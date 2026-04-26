"""Base agent runtime — typed context shared across all 5 agents."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .cost_tracker import CostTracker
from .llm_router import LLMRouter
from .tool_registry import ToolRegistry
from .vector_store import VectorStore


@dataclass
class AgentRunContext:
    """Shared services every agent receives. Single source of truth per ticket."""
    ticket: str
    repo_path: str
    cost: CostTracker
    router: LLMRouter
    vstore: VectorStore
    tools: ToolRegistry


class Agent:
    """Base class. Each agent overrides `run()`. Provides retry + tracing for free."""
    name: str = "abstract"

    async def run(self, ctx: AgentRunContext, **kwargs: Any) -> Any:
        raise NotImplementedError("subclass must implement run()")

    async def call_llm(self, ctx: AgentRunContext, system: str, user: str, **opts: Any) -> str:
        """Convenience wrapper — picks model via router, accounts cost, returns text."""
        choice = ctx.router.pick(agent=self.name, complexity=opts.get("complexity", "medium"))
        ctx.cost.start_call(model=choice.model)
        try:
            text = await choice.client.complete(system=system, user=user, **opts)
            ctx.cost.end_call(model=choice.model, in_tokens=choice.last_in, out_tokens=choice.last_out)
            return text
        except Exception:
            ctx.cost.abort_call()
            raise
