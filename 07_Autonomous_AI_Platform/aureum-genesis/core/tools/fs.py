"""Filesystem tools — reads are open, writes are sandboxed inside repo_path."""
from __future__ import annotations

from pathlib import Path


async def read(path: str, max_bytes: int = 200_000) -> str:
    """Read a text file, capped at max_bytes."""
    p = Path(path).resolve()
    if not p.exists():
        return ""
    return p.read_text(errors="replace")[:max_bytes]


async def write_sandboxed(path: str, content: str, repo_path: str = ".") -> str:
    """
    Write `content` to `path`, refusing escape from `repo_path`.
    Returns the absolute path written.
    """
    repo = Path(repo_path).resolve()
    target = (repo / path).resolve()
    if not str(target).startswith(str(repo) + "/") and target != repo:
        raise PermissionError(f"refused write outside repo: {target} not under {repo}")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content)
    return str(target)
