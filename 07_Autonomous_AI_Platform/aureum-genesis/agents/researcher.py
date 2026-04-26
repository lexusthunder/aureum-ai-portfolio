"""ResearcherAgent — turns a ticket into a typed ImplementationPlan."""
from __future__ import annotations

from pydantic import BaseModel, Field

from core.agent_runtime import Agent, AgentRunContext


class ImplementationPlan(BaseModel):
    summary: str = Field(..., description="One-sentence summary of the change")
    touched_files: list[str] = Field(default_factory=list)
    new_files: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list, description="Edge cases the Coder must handle")
    test_strategy: str = Field(..., description="How TesterAgent should validate the change")
    estimated_complexity: str = Field("medium", pattern="^(low|medium|high)$")


SYSTEM_PROMPT = """You are the Researcher in the Aureum Genesis pipeline.
Your job: read a ticket, retrieve relevant code from the repo, produce a precise plan.
Be conservative — flag every risk a senior engineer would. Output strictly the JSON schema given."""


class ResearcherAgent(Agent):
    name = "researcher"

    async def run(self, ctx: AgentRunContext, **_) -> ImplementationPlan:
        # 1. RAG over the repo for ticket-relevant chunks
        chunks = await ctx.vstore.search(query=ctx.ticket, k=8)
        evidence = "\n\n".join(f"# {c.file_path}:{c.line_start}-{c.line_end}\n{c.content}" for c in chunks)

        # 2. Ask the LLM for a typed plan
        user = f"TICKET:\n{ctx.ticket}\n\nREPO EVIDENCE (top 8 chunks):\n{evidence}\n\nReturn ImplementationPlan JSON."
        raw = await self.call_llm(ctx, system=SYSTEM_PROMPT, user=user, complexity="medium")
        return ImplementationPlan.model_validate_json(raw)
