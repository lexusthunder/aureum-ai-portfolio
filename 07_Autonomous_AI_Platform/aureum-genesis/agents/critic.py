"""CriticAgent — code review on a 1-10 scale. <8 → Coder must revise."""
from __future__ import annotations

from pydantic import BaseModel, Field

from core.agent_runtime import Agent, AgentRunContext
from agents.coder import CodeDiff
from agents.tester import TestResult


class Review(BaseModel):
    score: int = Field(..., ge=1, le=10)
    blockers: list[str] = Field(default_factory=list, description="Must-fix issues")
    suggestions: list[str] = Field(default_factory=list, description="Nice-to-haves")
    summary: str


SYSTEM_PROMPT = """You are the Critic in the Aureum Genesis pipeline. Senior engineer at a security-conscious shop.
Score the diff on a strict 1-10 scale:
  10 = ship to prod as-is
   8 = minor nits, ship after small revision
   5 = real issues, must revise
   1 = hostile / broken
Penalise: missing error handling, untyped fns, SQL injection vectors, secrets in code, N+1 queries, race conditions.
Return strict JSON of Review schema."""


class CriticAgent(Agent):
    name = "critic"

    async def run(self, ctx: AgentRunContext, diff: CodeDiff, test_result: TestResult, **_) -> Review:
        user = (
            f"DIFF:\n{diff.unified_diff}\n\n"
            f"TEST RESULT: passed={test_result.passed}, {test_result.total} total, {test_result.failed} failed.\n"
            f"Return Review JSON."
        )
        raw = await self.call_llm(ctx, system=SYSTEM_PROMPT, user=user, complexity="medium")
        return Review.model_validate_json(raw)
