"""Sandboxed shell — subprocess with timeout + cwd guard. Production: swap for E2B/Modal."""
from __future__ import annotations

import asyncio
import os
import shlex
from pathlib import Path


async def run_sandboxed(cmd: str, timeout_s: float = 60.0, cwd: str | None = None, env: dict | None = None) -> dict:
    """
    Run `cmd` in a subprocess. Returns:
        {"returncode": int, "stdout": str, "stderr": str, "duration_s": float, "collected": int, "failed": int}

    NOTE: For real production, route through E2B / Modal sandbox.
    Subprocess here is fine for dev + CI but trusts the host.
    """
    cwd_path = Path(cwd or os.getcwd()).resolve()
    if not cwd_path.exists():
        return {"returncode": 127, "stdout": "", "stderr": f"cwd not found: {cwd_path}", "duration_s": 0.0}

    start = asyncio.get_event_loop().time()
    proc = await asyncio.create_subprocess_shell(
        cmd,
        cwd=str(cwd_path),
        env={**os.environ, **(env or {})},
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    try:
        stdout_b, stderr_b = await asyncio.wait_for(proc.communicate(), timeout=timeout_s)
    except asyncio.TimeoutError:
        proc.kill()
        await proc.wait()
        return {
            "returncode": -9,
            "stdout": "",
            "stderr": f"timeout after {timeout_s}s",
            "duration_s": timeout_s,
        }

    duration = asyncio.get_event_loop().time() - start
    stdout = stdout_b.decode(errors="replace")
    stderr = stderr_b.decode(errors="replace")

    # Pytest-aware extraction
    collected, failed = _parse_pytest(stdout + stderr)

    return {
        "returncode": proc.returncode or 0,
        "stdout": stdout,
        "stderr": stderr,
        "duration_s": round(duration, 3),
        "collected": collected,
        "failed": failed,
    }


def _parse_pytest(text: str) -> tuple[int, int]:
    """Best-effort: find `N passed, M failed` line."""
    import re
    m = re.search(r"(\d+) passed", text)
    passed = int(m.group(1)) if m else 0
    m = re.search(r"(\d+) failed", text)
    failed = int(m.group(1)) if m else 0
    return passed + failed, failed
