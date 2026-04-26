"""CoderAgent — produces a unified diff that implements the plan, iterating on errors."""
from __future__ import annotations

from pydantic import BaseModel

from core.agent_runtime import Agent, AgentRunContext
from agents.researcher import ImplementationPlan


class CodeDiff(BaseModel):
    unified_diff: str
    lines_added: int
    lines_removed: int
    files_touched: list[str]


SYSTEM_PROMPT = """You are the Coder in the Aureum Genesis pipeline.
Output ONLY a valid unified diff that implements the plan. Do not include prose.
- Use existing patterns from the repo.
- Keep the diff minimal: do not refactor unrelated code.
- Preserve test files unless the plan asks otherwise."""


class CoderAgent(Agent):
    name = "coder"

    async def run(
        self,
        ctx: AgentRunContext,
        plan: ImplementationPlan,
        prior_diff: CodeDiff | None = None,
        prior_score: int = 0,
        **_,
    ) -> CodeDiff:
        revision_note = ""
        if prior_diff and prior_score < 8:
            revision_note = f"\n\nPRIOR DIFF SCORED {prior_score}/10 — REVISE:\n{prior_diff.unified_diff[:4000]}"

        user = f"PLAN:\n{plan.model_dump_json(indent=2)}{revision_note}\n\nReturn ONLY the unified diff."
        diff_text = await self.call_llm(ctx, system=SYSTEM_PROMPT, user=user, complexity=plan.estimated_complexity)

        added = sum(1 for l in diff_text.splitlines() if l.startswith("+") and not l.startswith("+++"))
        removed = sum(1 for l in diff_text.splitlines() if l.startswith("-") and not l.startswith("---"))
        files = sorted({l[6:].split()[0] for l in diff_text.splitlines() if l.startswith("+++ b/")})

        # Apply via tool (sandboxed)
        await ctx.tools.call("git.apply", patch=diff_text)
        return CodeDiff(unified_diff=diff_text, lines_added=added, lines_removed=removed, files_touched=files)
