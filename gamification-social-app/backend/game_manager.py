import asyncio
import time
import random
import math
import uuid
from typing import Dict, Optional
from fastapi import WebSocket
from schemas import ChatHistory
from ai_service import gen_dialogue_multiplayer
from prompts.single_prompts import NAMES, JOBS, RELATIONSHIPS, LESSONS, LOCATIONS
from database import SessionLocal
import models


def calculate_level(total_xp: int) -> int:
    if total_xp <= 0:
        return 1
    return int((1 + math.sqrt(1 + 0.08 * total_xp)) / 2)


def get_rank(level: int) -> str:
    if level >= 50: return "Grandmaster"
    if level >= 30: return "Master"
    if level >= 20: return "Expert"
    if level >= 10: return "Advanced"
    if level >= 5: return "Intermediate"
    return "Newbie"


# ─────────────────────────────────────────────
# GameRoom: manages a single match (10 rounds)
# ─────────────────────────────────────────────
class GameRoom:
    def __init__(self, room_id: str, p1_info: dict, p2_info: dict):
        self.room_id = room_id
        self.p1 = p1_info   # {user_id, username, level, rank}
        self.p2 = p2_info
        self.p1_ws: Optional[WebSocket] = None
        self.p2_ws: Optional[WebSocket] = None

        self.num = []
        self.history = []          # List[ChatHistory]
        self.score1 = 0            # cumulative delta P1
        self.score2 = 0            # cumulative delta P2
        self.current_round = 0
        self.both_idle_streak = 0
        self.answers: Dict[int, dict] = {}
        self.game_active = True
        self.answer_event = asyncio.Event()
        self.max_rounds = 10
        self.npc_info: dict = {}
        self.last_npc_say = ""

    # ── helpers ──────────────────────────────
    def both_connected(self):
        return self.p1_ws is not None and self.p2_ws is not None

    async def _send(self, ws: Optional[WebSocket], data: dict):
        if ws is None:
            return
        try:
            await ws.send_json(data)
        except Exception:
            pass

    async def broadcast(self, data: dict):
        await asyncio.gather(
            self._send(self.p1_ws, data),
            self._send(self.p2_ws, data),
        )

    async def send_each(self, d1: dict, d2: dict):
        await asyncio.gather(
            self._send(self.p1_ws, d1),
            self._send(self.p2_ws, d2),
        )

    def _update_xp(self, user_id: int, xp_change: int):
        db = SessionLocal()
        try:
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if user:
                user.total_xp = max(0, user.total_xp + xp_change)
                user.level = calculate_level(user.total_xp)
                db.commit()
        finally:
            db.close()

    def _extract_scores(self, result: dict, say1: str, say2: str):
        """Return (s1, s2, r1, r2) depending on who answered."""
        s1 = s2 = 0
        r1 = r2 = ""
        if say1 and say2:
            s1 = int(result.get("score1", 0))
            s2 = int(result.get("score2", 0))
            r1 = result.get("reason1", "")
            r2 = result.get("reason2", "")
        elif say1:
            s1 = int(result.get("score", 0))
            r1 = result.get("reason", "")
            s2 = -15
            r2 = "Không phản hồi"
        elif say2:
            s2 = int(result.get("score", 0))
            r2 = result.get("reason", "")
            s1 = -15
            r1 = "Không phản hồi"
        else:
            s1 = -15
            s2 = -15
            r1 = r2 = "Không phản hồi"
        return s1, s2, r1, r2

    # ── answer collection ────────────────────
    async def _wait_for_both(self):
        while len(self.answers) < 2 and self.game_active:
            self.answer_event.clear()
            await self.answer_event.wait()

    def submit_answer(self, user_id: int, content: str, ts: float):
        self.answers[user_id] = {"content": content, "timestamp": ts}
        self.answer_event.set()

    # ── disconnect / afk ─────────────────────
    async def handle_disconnect(self, user_id: int):
        if not self.game_active:
            return
        self.game_active = False

        winner_id = self.p2["user_id"] if user_id == self.p1["user_id"] else self.p1["user_id"]
        self._update_xp(winner_id, 30)
        self._update_xp(user_id, -10)

        await self.broadcast({"type": "opponent_disconnected", "result": "win", "xp_change": 30})
        self.answer_event.set()

    async def _handle_both_afk(self):
        self.game_active = False
        self._update_xp(self.p1["user_id"], -10)
        self._update_xp(self.p2["user_id"], -10)
        await self.broadcast({"type": "both_afk_penalty", "xp_change": -10})

    async def _handle_game_over(self):
        if not self.game_active:
            return
        self.game_active = False

        if self.score1 > self.score2:
            self._update_xp(self.p1["user_id"], 30)
            self._update_xp(self.p2["user_id"], -10)
            r1, r2, xp1, xp2 = "win", "lose", 30, -10
        elif self.score2 > self.score1:
            self._update_xp(self.p2["user_id"], 30)
            self._update_xp(self.p1["user_id"], -10)
            r1, r2, xp1, xp2 = "lose", "win", -10, 30
        else:
            # draw
            if self.score1 > 0:
                self._update_xp(self.p1["user_id"], 10)
                self._update_xp(self.p2["user_id"], 10)
                xp1 = xp2 = 10
            else:
                xp1 = xp2 = 0
            r1 = r2 = "draw"

        await self.send_each(
            {
                "type": "game_over",
                "result": r1,
                "total_your": self.score1,
                "total_opponent": self.score2,
                "xp_change": xp1,
                "opponent_username": self.p2["username"],
            },
            {
                "type": "game_over",
                "result": r2,
                "total_your": self.score2,
                "total_opponent": self.score1,
                "xp_change": xp2,
                "opponent_username": self.p1["username"],
            },
        )

    # ── main game loop ───────────────────────
    async def run(self):
        try:
            # random NPC params
            ni = random.randint(0, len(NAMES) - 1)
            ji = random.randint(0, len(JOBS) - 1)
            ri = random.randint(0, len(RELATIONSHIPS) - 1)
            li = random.randint(0, len(LOCATIONS) - 1)
            lei = random.randint(0, len(LESSONS) - 1)
            case = random.randint(0, 3)
            self.num = [ni, ji, ri, li, lei, case]

            self.npc_info = {
                "name": NAMES[ni],
                "job": JOBS[ji] if ri != 4 else "Học sinh",
                "relationship": RELATIONSHIPS[ri],
                "location": LOCATIONS[li],
            }

            # ── Turn 1: initial NPC message ──
            result = await gen_dialogue_multiplayer(
                name_idx=ni, job_idx=ji, relationship_idx=ri,
                location_idx=li, lesson_idx=lei,
                case=case, turn=1, history=[],
                user_say1="", user_say2="",
            )
            self.last_npc_say = result.get("npc_say", "")

            await self.broadcast({
                "type": "game_start",
                "npc": self.npc_info,
                "npc_say": self.last_npc_say,
                "npc_behavior": result.get("npc_behavior", ""),
                "start_context": result.get("start_context", ""),
                "turn": 1,
            })

            # ── 10 answer rounds ─────────────
            for rnd in range(1, self.max_rounds + 1):
                if not self.game_active:
                    break
                self.current_round = rnd
                self.answers = {}
                round_start = time.time()

                # wait up to 60s for both answers
                try:
                    await asyncio.wait_for(self._wait_for_both(), timeout=60)
                except asyncio.TimeoutError:
                    pass
                if not self.game_active:
                    break

                a1 = self.answers.get(self.p1["user_id"], {})
                a2 = self.answers.get(self.p2["user_id"], {})
                say1 = a1.get("content", "")
                say2 = a2.get("content", "")
                t1 = a1.get("timestamp", round_start + 60) - round_start
                t2 = a2.get("timestamp", round_start + 60) - round_start

                # AFK check
                if not say1 and not say2:
                    self.both_idle_streak += 1
                else:
                    self.both_idle_streak = 0
                if self.both_idle_streak >= 3:
                    await self._handle_both_afk()
                    return

                # call AI for scoring + next NPC message
                old_case = self.num[5]
                new_case = random.randint(0, 3)
                self.num[5] = new_case

                result = await gen_dialogue_multiplayer(
                    name_idx=self.num[0], job_idx=self.num[1],
                    relationship_idx=self.num[2], location_idx=self.num[3],
                    lesson_idx=self.num[4], case=new_case,
                    turn=rnd + 1,
                    history=self.history,
                    user_say1=say1, user_say2=say2,
                    old_case=old_case,
                )

                s1, s2, r1, r2 = self._extract_scores(result, say1, say2)

                # tiebreaker: same non-zero score → faster +5
                if s1 == s2 and s1 != 0:
                    if t1 < t2:
                        s1 += 5
                    elif t2 < t1:
                        s2 += 5

                self.score1 += s1
                self.score2 += s2

                # determine round winner for history
                winner_say = ""
                winner_round = ""
                if s1 > s2:
                    winner_say = say1 or ""
                    winner_round = "player1"
                elif s2 > s1:
                    winner_say = say2 or ""
                    winner_round = "player2"
                else:
                    winner_say = say1 or say2 or ""
                    winner_round = "draw"

                # push NPC + winner response into shared history
                if self.last_npc_say:
                    self.history.append(ChatHistory(role="assistant", content=self.last_npc_say))
                if winner_say:
                    self.history.append(ChatHistory(role="user", content=winner_say))
                # keep last 5 entries (matching ai_service slicing)
                self.history = self.history[-5:]

                self.last_npc_say = result.get("npc_say", "")

                # send round result (personalized)
                base = {
                    "type": "round_result",
                    "round": rnd,
                    "p1_username": self.p1["username"],
                    "p2_username": self.p2["username"],
                    "p1_msg": say1, "p2_msg": say2,
                    "p1_score": s1, "p2_score": s2,
                    "p1_reason": r1, "p2_reason": r2,
                    "p1_time": round(t1, 1), "p2_time": round(t2, 1),
                    "total_p1": self.score1, "total_p2": self.score2,
                    "winner_round": winner_round,
                }
                await self.broadcast(base)

                # 10s popup delay
                await asyncio.sleep(10)
                if not self.game_active:
                    break

                # send next NPC message (if not last round)
                if rnd < self.max_rounds:
                    await self.broadcast({
                        "type": "npc_message",
                        "npc_say": self.last_npc_say,
                        "npc_behavior": result.get("npc_behavior", ""),
                        "turn": rnd + 1,
                    })

            # game over
            await self._handle_game_over()

        except Exception as e:
            print(f"⚠ GameRoom error: {e}")
            self.game_active = False
            await self.broadcast({"type": "error", "message": "Lỗi server, trận đấu kết thúc."})


# ─────────────────────────────────────────────
# MatchmakingQueue: pairs waiting players
# ─────────────────────────────────────────────
class MatchmakingQueue:
    def __init__(self):
        self.waiting: Dict[int, dict] = {}   # user_id → {ws, username, level, rank, joined_at}
        self.rooms: Dict[str, GameRoom] = {} # room_id → GameRoom
        self.lock = asyncio.Lock()

    async def join(self, user_id: int, ws: WebSocket, username: str, level: int):
        rank = get_rank(level)
        async with self.lock:
            # already waiting?
            if user_id in self.waiting:
                return
            self.waiting[user_id] = {
                "ws": ws, "username": username,
                "level": level, "rank": rank,
                "joined_at": time.time(),
            }
            await ws.send_json({"type": "queue_joined", "timeout": 90})

            # try to pair
            if len(self.waiting) >= 2:
                ids = list(self.waiting.keys())
                id1, id2 = ids[0], ids[1]
                w1 = self.waiting.pop(id1)
                w2 = self.waiting.pop(id2)
                await self._create_room(id1, w1, id2, w2)

    async def leave(self, user_id: int):
        async with self.lock:
            self.waiting.pop(user_id, None)

    async def _create_room(self, id1, w1, id2, w2):
        room_id = uuid.uuid4().hex[:12]
        p1 = {"user_id": id1, "username": w1["username"], "level": w1["level"], "rank": w1["rank"]}
        p2 = {"user_id": id2, "username": w2["username"], "level": w2["level"], "rank": w2["rank"]}

        room = GameRoom(room_id, p1, p2)
        self.rooms[room_id] = room

        # notify both clients about match
        for uid, w, opp in [(id1, w1, p2), (id2, w2, p1)]:
            me = {"username": w["username"], "level": w["level"], "rank": w["rank"]}
            await w["ws"].send_json({
                "type": "match_found",
                "room_id": room_id,
                "you": me,
                "opponent": {"username": opp["username"], "level": opp["level"], "rank": opp["rank"]},
            })

    async def join_room(self, room_id: str, user_id: int, ws: WebSocket) -> Optional[GameRoom]:
        room = self.rooms.get(room_id)
        if not room:
            return None
        if user_id == room.p1["user_id"]:
            room.p1_ws = ws
        elif user_id == room.p2["user_id"]:
            room.p2_ws = ws
        else:
            return None
        return room

    def remove_room(self, room_id: str):
        self.rooms.pop(room_id, None)
