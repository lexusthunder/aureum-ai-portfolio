"""Web search — pluggable. Default: Tavily. Swap with Serper/Bing trivially."""
from __future__ import annotations

import os
from typing import Any

import httpx


async def search(query: str, k: int = 5) -> list[dict[str, Any]]:
    """Returns [{title, url, content}, ...]. Uses Tavily if key set, else empty list."""
    key = os.getenv("TAVILY_API_KEY")
    if not key:
        return []
    async with httpx.AsyncClient(timeout=20) as cx:
        r = await cx.post(
            "https://api.tavily.com/search",
            json={"api_key": key, "query": query, "max_results": k, "include_answer": False},
        )
        r.raise_for_status()
        data = r.json()
    return [
        {"title": h.get("title", ""), "url": h.get("url", ""), "content": h.get("content", "")[:500]}
        for h in data.get("results", [])
    ]
