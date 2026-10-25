# HTTP API for the React frontend.
# Run with: uvicorn planner_api:api --port 8010
# On Vercel it is served through api/index.py

import json
import os
import time
from datetime import datetime

from langchain_core.messages import HumanMessage
from starlette.applications import Starlette
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, StreamingResponse
from starlette.routing import Route

from main import app as graph_app

# Vercel's filesystem is read-only except /tmp
SAVE_DIR = (
    "/tmp/travel_plans"
    if os.getenv("VERCEL")
    else os.path.join(os.path.dirname(__file__), "travel_plans")
)

NODE_ORDER = ["flight_agent", "hotel_agent", "itinerary_agent", "final_agent"]


def _event(payload: dict) -> str:
    return json.dumps(payload) + "\n"


def _node_text(node_name: str, update: dict) -> str:
    if node_name == "flight_agent":
        return update.get("flight_results", "")
    if node_name == "hotel_agent":
        return update.get("hotel_results", "")
    if node_name == "itinerary_agent":
        return update.get("itinerary", "")
    if node_name == "final_agent":
        msgs = update.get("messages", [])
        return msgs[-1].content if msgs else ""
    return ""


def _save_plan(query: str, user_id: str, collected: dict) -> str:
    os.makedirs(SAVE_DIR, exist_ok=True)
    now = datetime.now()
    filename = f"travel_plan_{now.strftime('%Y%m%d_%H%M%S')}.md"
    content = f"""# Travel Plan
**Query:** {query}
**Generated:** {now.strftime("%Y-%m-%d %H:%M:%S")}
**User ID:** {user_id}

---

## ✈️ Flight Information
{collected['flight_agent'] or 'N/A'}

---

## 🏨 Hotel Information
{collected['hotel_agent'] or 'N/A'}

---

## 🗓️ Itinerary
{collected['itinerary_agent'] or 'N/A'}

---

## 🧠 Final Travel Plan
{collected['final_agent'] or 'N/A'}

---
*LLM Calls: {collected['llm_calls']}*
"""
    try:
        with open(os.path.join(SAVE_DIR, filename), "w", encoding="utf-8") as f:
            f.write(content)
    except OSError:
        pass
    return filename


def _stream_plan(query: str, user_id: str):
    config = {"configurable": {"thread_id": user_id}}
    collected = {name: "" for name in NODE_ORDER}
    collected["llm_calls"] = 0
    started = time.time()

    try:
        for chunk in graph_app.stream(
            {
                "messages": [HumanMessage(content=query)],
                "user_query": query,
                "flight_results": "",
                "hotel_results": "",
                "itinerary": "",
                "llm_calls": 0,
            },
            config=config,
            stream_mode="updates",
        ):
            for node_name, update in chunk.items():
                text = _node_text(node_name, update)
                if node_name in collected:
                    collected[node_name] = text
                collected["llm_calls"] = update.get("llm_calls", collected["llm_calls"])
                yield _event({
                    "type": "node",
                    "node": node_name,
                    "text": text,
                    "llm_calls": collected["llm_calls"],
                })

        filename = _save_plan(query, user_id, collected)
        yield _event({
            "type": "done",
            "filename": filename,
            "llm_calls": collected["llm_calls"],
            "duration": round(time.time() - started, 1),
        })
    except Exception as exc:
        yield _event({"type": "error", "message": f"{type(exc).__name__}: {exc}"})


async def plan(request: Request):
    body = await request.json()
    query = (body.get("query") or "").strip()
    user_id = (body.get("user_id") or "traveler").strip() or "traveler"
    if not query:
        return JSONResponse({"error": "query is required"}, status_code=400)
    return StreamingResponse(
        _stream_plan(query, user_id),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


async def health(_: Request):
    return JSONResponse({"status": "ok"})


api = Starlette(
    routes=[
        Route("/api/plan", plan, methods=["POST"]),
        Route("/api/health", health, methods=["GET"]),
    ],
    middleware=[
        Middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
            allow_origin_regex=r"https://.*\.vercel\.app",
            allow_methods=["*"],
            allow_headers=["*"],
        )
    ],
)
