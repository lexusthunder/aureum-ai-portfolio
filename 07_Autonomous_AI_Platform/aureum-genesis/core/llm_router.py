"""LLM router — picks the cheapest model that clears the quality bar for an agent task."""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class Complexity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# Routing table. Tuned by 50-ticket eval harness — lower-cost model wins ties.
# Real prices shown in $/1M tokens (input/output) — pick refreshes monthly.
ROUTING_TABLE: dict[tuple[str, Complexity], str] = {
    ("researcher", Complexity.LOW): "claude-haiku-4-5",
    ("researcher", Complexity.MEDIUM): "claude-sonnet-4-6",
    ("researcher", Complexity.HIGH): "claude-opus-4-6",
    ("coder", Complexity.LOW): "gpt-4o-mini",
    ("coder", Complexity.MEDIUM): "gpt-4o",
    ("coder", Complexity.HIGH): "claude-opus-4-6",
    ("tester", Complexity.LOW): "claude-haiku-4-5",
    ("tester", Complexity.MEDIUM): "claude-haiku-4-5",
    ("tester", Complexity.HIGH): "claude-sonnet-4-6",
    ("critic", Complexity.LOW): "claude-sonnet-4-6",
    ("critic", Complexity.MEDIUM): "claude-sonnet-4-6",
    ("critic", Complexity.HIGH): "claude-opus-4-6",
    ("deployer", Complexity.LOW): "claude-haiku-4-5",
    ("deployer", Complexity.MEDIUM): "claude-haiku-4-5",
    ("deployer", Complexity.HIGH): "claude-haiku-4-5",
}


@dataclass
class ModelChoice:
    model: str
    client: Any  # injected at runtime — Anthropic / OpenAI / Gemini SDK
    last_in: int = 0
    last_out: int = 0


@dataclass
class LLMRouter:
    """Per-agent + complexity → model. Pluggable, evaluable, dirt-cheap to swap."""
    overrides: dict[tuple[str, Complexity], str] = field(default_factory=dict)

    def pick(self, agent: str, complexity: str | Complexity = Complexity.MEDIUM) -> ModelChoice:
        cx = Complexity(complexity) if isinstance(complexity, str) else complexity
        key = (agent, cx)
        model = self.overrides.get(key) or ROUTING_TABLE.get(key, "claude-sonnet-4-6")
        # In production, client is hydrated from a vendor-aware factory.
        return ModelChoice(model=model, client=_get_client(model))


def _get_client(model: str) -> Any:
    """Lazy-import the right SDK based on model prefix. Mocked in tests."""
    if model.startswith("claude-"):
        from .vendors import anthropic_client
        return anthropic_client()
    if model.startswith("gpt-"):
        from .vendors import openai_client
        return openai_client()
    if model.startswith("gemini-"):
        from .vendors import gemini_client
        return gemini_client()
    raise ValueError(f"unknown model family: {model}")
