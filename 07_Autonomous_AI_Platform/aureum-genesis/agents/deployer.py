"""DeployerAgent — opens a PR via the GitHub API once Critic is satisfied."""
from __future__ import annotations

import os
from pydantic import BaseModel

from core.agent_runtime import Agent, AgentRunContext
from agents.coder import CodeDiff
from agents.researcher import ImplementationPlan


class PullRequest(BaseModel):
    number: int
    url: str
    branch: str
    title: str


SYSTEM_PROMPT = """You are the Deployer. Write a clear PR title (<70 chars) and a markdown body
with sections: Summary, What changed, Why, Test plan, Risk."""


class DeployerAgent(Agent):
    name = "deployer"

    async def run(self, ctx: AgentRunContext, diff: CodeDiff, plan: ImplementationPlan, **_) -> PullRequest:
        user = f"PLAN:\n{plan.summary}\nFILES:\n{', '.join(diff.files_touched)}\nReturn JSON: {{title, body}}."
        raw = await self.call_llm(ctx, system=SYSTEM_PROMPT, user=user, complexity="low")
        meta = _parse_pr_meta(raw)

        slug = _slugify(plan.summary)[:50]
        branch = f"genesis/{slug}"

        # Branch + commit + push
        await ctx.tools.call("shell.run", cmd=f"git checkout -b {branch}", timeout_s=10)
        await ctx.tools.call("shell.run", cmd="git add -A && git commit -m " + _shell_quote(meta["title"]), timeout_s=15)
        await ctx.tools.call("shell.run", cmd=f"git push -u origin {branch}", timeout_s=60)

        # Open PR via GitHub API
        pr_data = await _open_pr_via_api(branch=branch, title=meta["title"], body=meta["body"])
        return PullRequest(number=pr_data["number"], url=pr_data["html_url"], branch=branch, title=meta["title"])


def _parse_pr_meta(raw: str) -> dict:
    import json
    return json.loads(raw)


def _slugify(s: str) -> str:
    import re
    return re.sub(r"[^a-z0-9-]+", "-", s.lower()).strip("-")


def _shell_quote(s: str) -> str:
    return "'" + s.replace("'", "'\\''") + "'"


async def _open_pr_via_api(branch: str, title: str, body: str) -> dict:
    """POST /repos/{owner}/{repo}/pulls — uses GH_TOKEN env var. Stubbed here for portfolio."""
    # Real impl: httpx.AsyncClient → https://api.github.com/repos/{owner}/{repo}/pulls
    return {"number": 142, "html_url": f"https://github.com/lexusthunder/{os.getenv('GH_REPO','demo')}/pull/142"}
