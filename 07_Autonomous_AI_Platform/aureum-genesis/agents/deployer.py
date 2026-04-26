"""DeployerAgent — opens a real PR via GitHub API."""
from __future__ import annotations

import json
import os
from pydantic import BaseModel

from core.agent_runtime import Agent, AgentRunContext
from core.github_pr import open_pr
from agents.coder import CodeDiff
from agents.researcher import ImplementationPlan


class PullRequest(BaseModel):
    number: int
    url: str
    branch: str
    title: str


SYSTEM_PROMPT = """You are the Deployer. Output STRICT JSON {"title": str, "body": str}.
Title: <70 chars, imperative ("Add X", "Fix Y").
Body: markdown with sections — Summary / What changed / Why / Test plan / Risk."""


class DeployerAgent(Agent):
    name = "deployer"

    async def run(self, ctx: AgentRunContext, diff: CodeDiff, plan: ImplementationPlan, **_) -> PullRequest:
        user = (
            f"PLAN:\n{plan.summary}\n\n"
            f"FILES TOUCHED: {', '.join(diff.files_touched) or '(none)'}\n"
            f"DIFF (first 3000 chars):\n{diff.unified_diff[:3000]}\n\n"
            "Return JSON only."
        )
        raw = await self.call_llm(ctx, system=SYSTEM_PROMPT, user=user, complexity="low")
        meta = json.loads(raw)

        slug = _slugify(plan.summary)[:50]
        branch = f"genesis/{slug}"
        repo = os.environ.get("GH_REPO", "lexusthunder/aureum-ai-portfolio")
        base = os.environ.get("GH_BASE_BRANCH", "main")

        # Branch + commit + push (real)
        await ctx.tools.call("shell.run", cmd=f"git checkout -b {branch}", cwd=ctx.repo_path, timeout_s=15)
        await ctx.tools.call("shell.run", cmd="git add -A", cwd=ctx.repo_path, timeout_s=15)
        await ctx.tools.call(
            "shell.run",
            cmd=f"git commit -m {_shell_quote(meta['title'])}",
            cwd=ctx.repo_path,
            timeout_s=15,
        )
        await ctx.tools.call("shell.run", cmd=f"git push -u origin {branch}", cwd=ctx.repo_path, timeout_s=120)

        pr = await open_pr(repo=repo, branch=branch, base=base, title=meta["title"], body=meta["body"])
        return PullRequest(number=pr["number"], url=pr["html_url"], branch=branch, title=meta["title"])


def _slugify(s: str) -> str:
    import re
    return re.sub(r"[^a-z0-9-]+", "-", s.lower()).strip("-")


def _shell_quote(s: str) -> str:
    return "'" + s.replace("'", "'\\''") + "'"
