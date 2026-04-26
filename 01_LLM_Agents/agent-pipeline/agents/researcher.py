from __future__ import annotations

import asyncio
import json
import re
from typing import Any

import anthropic

from models.schemas import ResearchBrief
from utils.logger import AgentLogger

MODEL = "claude-sonnet-4-6"
MAX_RETRIES = 3
RETRY_DELAY = 2.0


def _extract_json(text: str) -> dict[str, Any]:
    """Extract JSON object from a string that may contain surrounding text."""
    text = text.strip()
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Try to find a JSON block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    # Find the first { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    raise ValueError(f"No valid JSON found in response:\n{text[:500]}")


class ResearcherAgent:
    """
    Agent 1 – Researcher
    Receives a topic, produces 5 critical research questions and a ResearchBrief.
    Terminal color: bright_blue
    """

    SYSTEM_PROMPT = """You are a senior research analyst with 15+ years of experience in
business intelligence, market research, and competitive analysis. You excel at
identifying the most critical questions that must be answered to fully understand
a market or business topic.

When given a topic you will:
1. Generate exactly 5 incisive research questions that cover market size, competition,
   trends, risks, and opportunities.
2. Identify the key stakeholders (companies, regulators, investors, end-users).
3. Estimate the market size with realistic figures and context.
4. List 3-5 current key trends shaping the space.
5. Define the precise research scope.

You MUST respond with ONLY a valid JSON object — no prose, no markdown fences."""

    def __init__(self, client: anthropic.AsyncAnthropic) -> None:
        self.client = client
        self.log = AgentLogger("researcher")

    async def research(self, topic: str) -> ResearchBrief:
        self.log.divider()
        self.log.info(f"Starting research on topic: '{topic}'")
        self.log.info("Formulating critical research questions…")

        user_prompt = f"""Research topic: "{topic}"

Generate a comprehensive ResearchBrief. Respond with ONLY this JSON structure
(fill every field with rich, specific content — not placeholders):

{{
  "topic": "{topic}",
  "research_questions": [
    "Question 1 — market size & growth",
    "Question 2 — competitive landscape",
    "Question 3 — key trends & drivers",
    "Question 4 — risks & regulatory factors",
    "Question 5 — opportunities & entry points"
  ],
  "key_stakeholders": ["stakeholder1", "stakeholder2", "..."],
  "estimated_market_size": "e.g. $X billion globally / $Y million in Ireland by 20XX",
  "key_trends": ["trend1", "trend2", "trend3"],
  "research_scope": "A 2-3 sentence description of what this research covers and its boundaries."
}}"""

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                self.log.info(
                    f"Calling Claude API (attempt {attempt}/{MAX_RETRIES})…"
                )
                response = await self.client.messages.create(
                    model=MODEL,
                    max_tokens=2048,
                    system=self.SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": user_prompt}],
                )
                raw = response.content[0].text
                data = _extract_json(raw)
                brief = ResearchBrief.model_validate(data)

                self.log.success(
                    f"Research brief created — {len(brief.research_questions)} questions generated"
                )
                self.log.panel(
                    "Research Questions",
                    "\n".join(
                        f"  {i+1}. {q}"
                        for i, q in enumerate(brief.research_questions)
                    ),
                )
                self.log.info(f"Market size estimate: {brief.estimated_market_size}")
                self.log.info(f"Key stakeholders: {', '.join(brief.key_stakeholders[:4])}")
                return brief

            except (anthropic.RateLimitError, anthropic.APIStatusError) as exc:
                if attempt == MAX_RETRIES:
                    self.log.error(f"API error after {MAX_RETRIES} attempts: {exc}")
                    raise
                wait = RETRY_DELAY * attempt
                self.log.warning(f"API error ({exc}). Retrying in {wait}s…")
                await asyncio.sleep(wait)

            except (json.JSONDecodeError, ValueError) as exc:
                if attempt == MAX_RETRIES:
                    self.log.error(f"JSON parse error after {MAX_RETRIES} attempts: {exc}")
                    raise
                self.log.warning(f"JSON parse error: {exc}. Retrying…")
                await asyncio.sleep(RETRY_DELAY)
