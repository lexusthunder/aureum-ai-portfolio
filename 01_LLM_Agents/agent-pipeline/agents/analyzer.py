from __future__ import annotations

import asyncio
import json
import re
from typing import Any

import anthropic

from models.schemas import AnalysisReport, ResearchBrief
from utils.logger import AgentLogger

MODEL = "claude-sonnet-4-6"
MAX_RETRIES = 3
RETRY_DELAY = 2.0


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    raise ValueError(f"No valid JSON found in response:\n{text[:500]}")


class AnalyzerAgent:
    """
    Agent 2 – Analyzer
    Receives a ResearchBrief, produces deep analysis + SWOT.
    Terminal color: bright_green
    """

    SYSTEM_PROMPT = """You are a senior business analyst and strategy consultant with deep
expertise in market analysis, competitive intelligence, and SWOT frameworks.

Given a set of research questions about a business topic you will:
1. Answer each question with a thorough, data-informed analysis.
2. Extract 2-4 specific, non-obvious key insights per question.
3. Build a rigorous SWOT analysis for the market.
4. Rank the top market opportunities by strategic potential.
5. Describe the competitive landscape in concrete terms.
6. Summarize 5-7 most important findings.

Write as if preparing a briefing for a C-suite executive.
You MUST respond with ONLY a valid JSON object — no prose, no markdown fences."""

    def __init__(self, client: anthropic.AsyncAnthropic) -> None:
        self.client = client
        self.log = AgentLogger("analyzer")

    async def analyze(self, brief: ResearchBrief) -> AnalysisReport:
        self.log.divider()
        self.log.info(f"Analyzing research brief for: '{brief.topic}'")
        self.log.info(
            f"Processing {len(brief.research_questions)} research questions…"
        )

        questions_block = "\n".join(
            f"  {i+1}. {q}" for i, q in enumerate(brief.research_questions)
        )
        stakeholders = ", ".join(brief.key_stakeholders)
        trends = "\n".join(f"  - {t}" for t in brief.key_trends)

        user_prompt = f"""Topic: "{brief.topic}"
Market size context: {brief.estimated_market_size}
Key stakeholders: {stakeholders}
Key trends:
{trends}

Research questions to analyze deeply:
{questions_block}

Respond with ONLY this JSON structure (rich, specific content for each field):

{{
  "topic": "{brief.topic}",
  "question_analyses": [
    {{
      "question": "<exact question text>",
      "analysis": "<200-300 word deep analysis answering this question>",
      "key_insights": ["insight1", "insight2", "insight3"]
    }}
  ],
  "swot_analysis": {{
    "strengths": ["strength1", "strength2", "strength3", "strength4"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "opportunities": ["opportunity1", "opportunity2", "opportunity3", "opportunity4"],
    "threats": ["threat1", "threat2", "threat3"]
  }},
  "market_opportunities": [
    "Opportunity 1 — description with specific potential",
    "Opportunity 2 — ...",
    "Opportunity 3 — ..."
  ],
  "competitive_landscape": "<200-word description of competitors, market dynamics, moats>",
  "key_findings": [
    "Finding 1 — specific, data-referenced insight",
    "Finding 2 — ...",
    "Finding 3 — ...",
    "Finding 4 — ...",
    "Finding 5 — ..."
  ]
}}"""

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                self.log.info(
                    f"Calling Claude API (attempt {attempt}/{MAX_RETRIES})…"
                )
                response = await self.client.messages.create(
                    model=MODEL,
                    max_tokens=4096,
                    system=self.SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": user_prompt}],
                )
                raw = response.content[0].text
                data = _extract_json(raw)
                report = AnalysisReport.model_validate(data)

                self.log.success(
                    f"Analysis complete — {len(report.question_analyses)} questions analyzed"
                )
                self.log.info(
                    f"SWOT: {len(report.swot_analysis.strengths)}S / "
                    f"{len(report.swot_analysis.weaknesses)}W / "
                    f"{len(report.swot_analysis.opportunities)}O / "
                    f"{len(report.swot_analysis.threats)}T"
                )
                self.log.info(
                    f"Key findings: {len(report.key_findings)} identified"
                )
                self.log.panel(
                    "Top Opportunities",
                    "\n".join(
                        f"  {i+1}. {o}"
                        for i, o in enumerate(report.market_opportunities[:3])
                    ),
                )
                return report

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
