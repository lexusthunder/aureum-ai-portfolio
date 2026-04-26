"""Vendor-aware LLM clients — Anthropic, OpenAI, Gemini.

Each client implements the same minimal `complete(system, user, **opts)` contract
so the LLMRouter can swap them transparently.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Protocol


class LLMClient(Protocol):
    last_in: int
    last_out: int
    async def complete(self, system: str, user: str, **opts: object) -> str: ...


# ---------- Anthropic ----------

@dataclass
class AnthropicClient:
    model: str = "claude-sonnet-4-6"
    last_in: int = 0
    last_out: int = 0

    async def complete(self, system: str, user: str, **opts) -> str:
        from anthropic import AsyncAnthropic
        client = AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        resp = await client.messages.create(
            model=opts.get("model", self.model),
            max_tokens=opts.get("max_tokens", 4096),
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        self.last_in = resp.usage.input_tokens
        self.last_out = resp.usage.output_tokens
        # Concatenate text blocks
        return "".join(block.text for block in resp.content if block.type == "text")


def anthropic_client(model: str = "claude-sonnet-4-6") -> AnthropicClient:
    return AnthropicClient(model=model)


# ---------- OpenAI ----------

@dataclass
class OpenAIClient:
    model: str = "gpt-4o"
    last_in: int = 0
    last_out: int = 0

    async def complete(self, system: str, user: str, **opts) -> str:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=os.environ["OPENAI_API_KEY"])
        resp = await client.chat.completions.create(
            model=opts.get("model", self.model),
            max_tokens=opts.get("max_tokens", 4096),
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
        self.last_in = resp.usage.prompt_tokens
        self.last_out = resp.usage.completion_tokens
        return resp.choices[0].message.content or ""


def openai_client(model: str = "gpt-4o") -> OpenAIClient:
    return OpenAIClient(model=model)


# ---------- Gemini (optional, lazy) ----------

@dataclass
class GeminiClient:
    model: str = "gemini-2-5-pro"
    last_in: int = 0
    last_out: int = 0

    async def complete(self, system: str, user: str, **opts) -> str:
        # Lazy import keeps Gemini optional. Wire when needed.
        raise NotImplementedError("hydrate with google-genai SDK when needed")


def gemini_client(model: str = "gemini-2-5-pro") -> GeminiClient:
    return GeminiClient(model=model)


# ---------- Mock for tests / dry-runs ----------

@dataclass
class MockClient:
    """Deterministic mock — used by `pytest` and `--dry-run`."""
    canned_response: str = '{"summary":"mock plan","touched_files":[],"new_files":[],"risks":[],"test_strategy":"none","estimated_complexity":"low"}'
    last_in: int = 100
    last_out: int = 50

    async def complete(self, system: str, user: str, **opts) -> str:
        return self.canned_response
