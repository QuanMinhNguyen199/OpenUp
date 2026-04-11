"""
Tool definitions for the agent.
Updated for Google GenAI SDK v2 (using 'parameters' instead of 'input_schema').
"""

import httpx
# Giả sử bạn dùng SQLAlchemy hoặc sqlite3 để quản lý DB quán cafe
# from .database import engine 
# from sqlalchemy import text

def execute_sql_query(query: str) -> str:
    """Execute a SQL query to manage the cafe database (TRUNCATE, INSERT, SELECT)."""
    # Đây là nơi AI thực hiện 'dọn dẹp' và 'khởi tạo' NPC theo lệnh của bạn
    # Demo logic:
    try:
        # with engine.connect() as conn:
        #     conn.execute(text(query))
        #     conn.commit()
        return f"Thực thi thành công lệnh SQL: {query[:100]}..."
    except Exception as e:
        return f"Lỗi SQL: {str(e)}"

def search_web(query: str) -> str:
    """Search for information on the web (placeholder)."""
    return f"Search results for: {query}"

def calculate(expression: str) -> str:
    """Evaluate a math expression."""
    try:
        # Lưu ý: eval không an toàn trong thực tế, nhưng dùng cho bài tập thì OK
        result = eval(expression, {"__builtins__": {}})
        return str(result)
    except Exception as e:
        return f"Error: {e}"

def fetch_url(url: str) -> str:
    """Fetch content from a URL."""
    try:
        resp = httpx.get(url, timeout=10, follow_redirects=True)
        return resp.text[:2000]
    except Exception as e:
        return f"Error: {e}"

# Tool registry - the agent uses this dict
TOOLS = {
    "execute_sql_query": {
        "fn": execute_sql_query,
        "description": "Thực thi lệnh SQL để quản lý database (dùng để TRUNCATE hoặc INSERT NPC).",
        "parameters": {"query": "string"},
    },
    "search_web": {
        "fn": search_web,
        "description": "Search for information on the web",
        "parameters": {"query": "string"},
    },
    "calculate": {
        "fn": calculate,
        "description": "Evaluate a math expression",
        "parameters": {"expression": "string"},
    },
    "fetch_url": {
        "fn": fetch_url,
        "description": "Fetch content from a URL",
        "parameters": {"url": "string"},
    },
}

def get_tool_schemas() -> list[dict]:
    """Return tool schemas in Google GenAI v2 format (using 'parameters')."""
    schemas = []
    for name, tool in TOOLS.items():
        schemas.append({
            "name": name,
            "description": tool["description"],
            "parameters": {  # ĐỔI TỪ input_schema THÀNH parameters
                "type": "object",
                "properties": {
                    k: {"type": v, "description": k}
                    for k, v in tool["parameters"].items()
                },
                "required": list(tool["parameters"].keys()),
            },
        })
    return schemas

def execute_tool(name: str, args: dict) -> str:
    """Execute a tool by name."""
    tool = TOOLS.get(name)
    if not tool:
        return f"Tool '{name}' does not exist"
    return tool["fn"](**args)