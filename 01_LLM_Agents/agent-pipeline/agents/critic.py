from __future__ import annotations

import asyncio
import json
import re
from typing import Any

import anthropic

from models.schemas import CriticFeedback, DraftReport
from utils.logger import AgentLogger

MODEL = "claude-sonnet-4-6"
MAX_RETRIES = 3
RETRY_DELAY = 2.0
APPROVAL_THRESHOLD = 7


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


class CriticAgent:
    """
    Agent 4 – Critic
    Reviews a DraftReport and scores it 1-10.
    If score < 7 → returns feedback for revision loop.
    If score >= 7 → approves the report.
    Terminal color: bright_red
    """

    SYSTEM_PROMPT = """You are a senior editorial director and business strategy expert
who reviews research reports for consulting firms. You are demanding but constructive.

You evaluate reports on three dimensions:
1. ACCURACY (1-10): Are claims supported? Are figures realistic? Is the analysis sound?
2. COMPLETENESS (1-10): Does it cover all critical angles? Are there gaps?
3. ACTIONABILITY (1-10): Are the recommendations specific and implementable?
   Can a decision-maker act on this report?

The OVERALL SCORE is the weighted average: (accuracy * 0.35 + completeness * 0.3 + actionability * 0.35).
Round to nearest integer.

A score of 7+ means the report is approved for delivery to the client.
Below 7 requires revision with specific, actionable feedback.

You MUST respond with ONLY a valid JSON object — no prose, no markdown fences."""

    def __init__(self, client: anthropic.AsyncAnthropic) -> None:
        self.client = client
        self.log = AgentLogger("critic")

    async def review(self, draft: DraftReport) -> CriticFeedback:
        self.log.divider()
        self.log.info(
            f"Reviewing draft v{draft.version}: '{draft.title}'"
        )
        self.log.info(
            "Evaluating accuracy, completeness, and actionability…"
        )

        user_prompt = f"""Review this business research report draft:

=== TITLE ===
{draft.title}

=== EXECUTIVE SUMMARY ===
{draft.executive_summary}

=== MARKET OVERVIEW ===
{draft.market_overview}

=== KEY FINDINGS ===
{draft.key_findings}

=== OPPORTUNITIES ===
{draft.opportunities}

=== RISKS ===
{draft.risks}

=== RECOMMENDATIONS ===
{draft.recommendations}

=== CONCLUSION ===
{draft.conclusion}

Evaluate rigorously. A 7 means genuinely good — not just adequate.
Respond with ONLY this JSON:

{{
  "score": <weighted overall score 1-10>,
  "accuracy_score": <1-10>,
  "completeness_score": <1-10>,
  "actionability_score": <1-10>,
  "strengths": [
    "<specific strength 1>",
    "<specific strength 2>",
    "<specific strength 3>"
  ],
  "weaknesses": [
    "<specific weakness 1>",
    "<specific weakness 2>",
    "<specific weakness 3 if any>"
  ],
  "specific_feedback": [
    "<actionable feedback item 1 — what exactly to improve and how>",
    "<actionable feedback item 2>",
    "<actionable feedback item 3>",
    "<actionable feedback item 4 if needed>"
  ],
  "approved": <true if score >= {APPROVAL_THRESHOLD}, false otherwise>,
  "revision_instructions": "<if not approved: 2-3 sentence summary of the most critical improvements needed>"
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

                # Enforce approval logic based on score
                score = int(data.get("score", 0))
                data["approved"] = score >= APPROVAL_THRESHOLD
                if not data["approved"] and not data.get("revision_instructions"):
                    data["revision_instructions"] = (
                        "Address the weaknesses and specific feedback items listed above."
                    )

                feedback = CriticFeedback.model_validate(data)

                self.log.score_table(
                    {
                        "Accuracy":      feedback.accuracy_score,
                        "Completeness":  feedback.completeness_score,
                        "Actionability": feedback.actionability_score,
                        "OVERALL":       feedback.score,
                    }
                )

                if feedback.approved:
                    self.log.success(
                        f"Report APPROVED with score {feedback.score}/10 ✅"
                    )
                else:
                    self.log.warning(
                        f"Report scored {feedback.score}/10 — sending back for revision"
                    )
                    self.log.panel(
                        "Revision Instructions",
                        feedback.revision_instructions or "Address all weaknesses.",
                    )

                return feedback

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
