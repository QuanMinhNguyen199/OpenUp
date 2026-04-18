import asyncio
from ai_service import generate_npc_dialog
import json

async def main():
    data = await generate_npc_dialog("Anh Minh", "Bột Cà Phê Robusta")
    print(json.dumps(data, indent=2, ensure_ascii=False))

asyncio.run(main())