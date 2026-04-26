"""Open a GitHub PR via the REST API. Uses GH_TOKEN."""
from __future__ import annotations

import os
import httpx


GITHUB_API = "https://api.github.com"


async def open_pr(repo: str, branch: str, base: str, title: str, body: str) -> dict:
    """
    POST /repos/{owner}/{repo}/pulls
    repo: 'owner/repo'
    Returns the PR JSON (number, html_url, etc.)
    """
    token = os.environ["GH_TOKEN"]
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    payload = {"title": title, "head": branch, "base": base, "body": body}
    async with httpx.AsyncClient(timeout=30, headers=headers) as cx:
        r = await cx.post(f"{GITHUB_API}/repos/{repo}/pulls", json=payload)
        r.raise_for_status()
    return r.json()
