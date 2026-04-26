"""Git tools — wraps subprocess for diff/apply. Real production swaps for libgit2."""
from __future__ import annotations

from .shell import run_sandboxed


async def diff(repo_path: str = ".", staged: bool = False) -> str:
    cmd = "git diff --cached" if staged else "git diff"
    res = await run_sandboxed(cmd, cwd=repo_path, timeout_s=20)
    return res["stdout"]


async def apply_patch(patch: str, repo_path: str = ".") -> dict:
    """Apply a unified diff via `git apply -`. Returns shell.run result."""
    import tempfile, os
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".patch") as f:
        f.write(patch)
        patch_path = f.name
    try:
        return await run_sandboxed(f"git apply --whitespace=fix {patch_path}", cwd=repo_path, timeout_s=15)
    finally:
        os.unlink(patch_path)
