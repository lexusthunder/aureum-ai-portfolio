"""End-to-end demo of Genesis against a tiny test repo.

Usage:
    # Mock mode (no API keys needed) — proves the orchestrator wiring:
    python demo.py --mock

    # Real mode — needs ANTHROPIC_API_KEY + OPENAI_API_KEY + GH_TOKEN + GH_REPO:
    python demo.py
"""
from __future__ import annotations

import argparse
import asyncio
import os
import shutil
import sys
import tempfile
from pathlib import Path

from main import run_ticket


SAMPLE_REPO_INIT = {
    "app/__init__.py": "",
    "app/main.py": (
        "from fastapi import FastAPI\n"
        "app = FastAPI()\n\n"
        "@app.get('/api/v1/health')\n"
        "def health():\n"
        "    return {'status': 'ok'}\n"
    ),
    "tests/__init__.py": "",
    "tests/test_health.py": (
        "from fastapi.testclient import TestClient\n"
        "from app.main import app\n"
        "client = TestClient(app)\n\n"
        "def test_health():\n"
        "    r = client.get('/api/v1/health')\n"
        "    assert r.status_code == 200\n"
    ),
    "requirements.txt": "fastapi\nuvicorn\nhttpx\npytest\n",
    ".gitignore": "__pycache__/\n.venv/\n*.pyc\n",
}


def setup_demo_repo(path: Path) -> None:
    for rel, content in SAMPLE_REPO_INIT.items():
        f = path / rel
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(content)
    import subprocess
    subprocess.run(["git", "init", "-q"], cwd=path, check=True)
    subprocess.run(["git", "add", "-A"], cwd=path, check=True)
    subprocess.run(
        ["git", "-c", "user.email=demo@aureum.ai", "-c", "user.name=Genesis Demo",
         "commit", "-q", "-m", "init demo repo"],
        cwd=path,
        check=True,
    )


async def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--mock", action="store_true", help="use deterministic mocks (no API keys)")
    p.add_argument("--keep", action="store_true", help="keep temp repo on disk")
    args = p.parse_args()

    if args.mock:
        os.environ["GENESIS_MODE"] = "mock"

    tmp = Path(tempfile.mkdtemp(prefix="genesis-demo-"))
    try:
        setup_demo_repo(tmp)
        print(f"[demo] sample repo at {tmp}")

        ticket = "Add a /api/v1/health/db endpoint that returns 200 if a sqlite DB query succeeds, 503 otherwise."
        result = await run_ticket(ticket, repo_path=str(tmp), budget_usd=2.0)
        print("\n=== RESULT ===")
        for k, v in result.items():
            print(f"  {k}: {v}")
        return 0 if result.get("status") == "success" else 1
    finally:
        if args.keep:
            print(f"[demo] kept {tmp}")
        else:
            shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
