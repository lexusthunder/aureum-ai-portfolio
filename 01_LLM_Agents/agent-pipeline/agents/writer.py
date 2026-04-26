from __future__ import annotations

import asyncio
import json
import re
from typing import Any, Optional

import anthropic

from models.schemas import AnalysisReport, CriticFeedback, DraftReport
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


class WriterAgent:
    """
    Agent 3 – Writer
    Receives AnalysisReport, writes a professional 2000+ word report.
    On revision, also receives CriticFeedback to improve the draft.
    Terminal color: bright_yellow
    """

    SYSTEM_PROMPT = """You are a professional business report writer and content strategist
with expertise in producing executive-level research reports for consulting firms,
investment banks, and corporate strategy teams.

Your writing is:
- Authoritative and data-driven, with specific figures and examples
- Structured clearly with well-developed sections
- Actionable — every section has concrete takeaways
- Free of vague language and corporate filler
- Aimed at senior decision-makers who value substance

Each section must be substantive (target word counts noted in the task).
You MUST respond with ONLY a valid JSON object — no prose, no markdown fences."""

    def __init__(self, client: anthropic.AsyncAnthropic) -> None:
        self.client = client
        self.log = AgentLogger("writer")

    def _build_analysis_context(self, analysis: AnalysisReport) -> str:
        qa_block = "\n\n".join(
            f"Q: {qa.question}\nA: {qa.analysis}\nInsights: {'; '.join(qa.key_insights)}"
            for qa in analysis.question_analyses
        )
        swot = analysis.swot_analysis
        return f"""Topic: {analysis.topic}

=== Question Analyses ===
{qa_block}

=== SWOT Analysis ===
Strengths: {', '.join(swot.strengths)}
Weaknesses: {', '.join(swot.weaknesses)}
Opportunities: {', '.join(swot.opportunities)}
Threats: {', '.join(swot.threats)}

=== Market Opportunities ===
{chr(10).join(f'- {o}' for o in analysis.market_opportunities)}

=== Competitive Landscape ===
{analysis.competitive_landscape}

=== Key Findings ===
{chr(10).join(f'- {f}' for f in analysis.key_findings)}"""

    async def write(
        self,
        analysis: AnalysisReport,
        feedback: Optional[CriticFeedback] = None,
        previous_draft: Optional[DraftReport] = None,
        version: int = 1,
    ) -> DraftReport:
        self.log.divider()

        if feedback and previous_draft:
            self.log.info(
                f"Revising draft v{previous_draft.version} based on critic feedback "
                f"(score was {feedback.score}/10)…"
            )
            return await self._revise(analysis, previous_draft, feedback, version)

        self.log.info(f"Writing initial draft report for: '{analysis.topic}'")
        self.log.info("Drafting all 7 sections…")
        return await self._write_initial(analysis, version)

    async def _write_initial(
        self, analysis: AnalysisReport, version: int
    ) -> DraftReport:
        context = self._build_analysis_context(analysis)

        user_prompt = f"""Write a comprehensive business research report based on this analysis:

{context}

Respond with ONLY this JSON structure. Each section must hit the target word count
and contain specific, substantive content — not summaries or bullet lists
(except for key findings which should be numbered):

{{
  "title": "<Professional report title — specific and descriptive>",
  "topic": "{analysis.topic}",
  "executive_summary": "<250-300 word executive summary covering the most critical findings and their business implications>",
  "market_overview": "<350-450 word section covering market size, geography, key players, and current state>",
  "key_findings": "<450-550 word section with 5-7 numbered findings, each with a headline and 2-3 supporting sentences>",
  "opportunities": "<350-450 word section on top strategic opportunities with specific entry strategies>",
  "risks": "<250-350 word section covering key risks — regulatory, competitive, technical, macroeconomic>",
  "recommendations": "<350-450 word section with 4-5 specific, prioritized strategic recommendations>",
  "conclusion": "<150-200 word conclusion summarizing the investment/strategic thesis>",
  "version": {version}
}}"""

        return await self._call_api(user_prompt, version)

    async def _revise(
        self,
        analysis: AnalysisReport,
        previous_draft: DraftReport,
        feedback: CriticFeedback,
        version: int,
    ) -> DraftReport:
        feedback_items = "\n".join(
            f"  - {item}" for item in feedback.specific_feedback
        )
        weaknesses = "\n".join(f"  - {w}" for w in feedback.weaknesses)

        context = self._build_analysis_context(analysis)

        user_prompt = f"""You are revising a business report draft based on critic feedback.

=== ORIGINAL ANALYSIS ===
{context}

=== PREVIOUS DRAFT (to be improved) ===
Title: {previous_draft.title}

Executive Summary:
{previous_draft.executive_summary}

Market Overview:
{previous_draft.market_overview}

Key Findings:
{previous_draft.key_findings}

Opportunities:
{previous_draft.opportunities}

Risks:
{previous_draft.risks}

Recommendations:
{previous_draft.recommendations}

Conclusion:
{previous_draft.conclusion}

=== CRITIC FEEDBACK (Score: {feedback.score}/10) ===
Weaknesses to address:
{weaknesses}

Specific revision instructions:
{feedback_items}

Additional instructions:
{feedback.revision_instructions or "Address all weaknesses listed above."}

Produce a substantially improved version. Every section should be enhanced.
Respond with ONLY this JSON (each section must be meaningfully improved):

{{
  "title": "<improved title if needed>",
  "topic": "{analysis.topic}",
  "executive_summary": "<improved executive summary — 250-300 words>",
  "market_overview": "<improved market overview — 350-450 words>",
  "key_findings": "<improved key findings — 450-550 words, numbered>",
  "opportunities": "<improved opportunities section — 350-450 words>",
  "risks": "<improved risks section — 250-350 words>",
  "recommendations": "<improved recommendations — 350-450 words>",
  "conclusion": "<improved conclusion — 150-200 words>",
  "version": {version}
}}"""

        return await self._call_api(user_prompt, version)

    async def _call_api(self, user_prompt: str, version: int) -> DraftReport:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                self.log.info(
                    f"Calling Claude API (attempt {attempt}/{MAX_RETRIES})…"
                )
                response = await self.client.messages.create(
                    model=MODEL,
                    max_tokens=8192,
                    system=self.SYSTEM_PROMPT,
                    messages=[{"role": "user", "content": user_prompt}],
                )
                raw = response.content[0].text
                data = _extract_json(raw)
                data["version"] = version
                draft = DraftReport.model_validate(data)

                total_words = sum(
                    len(section.split())
                    for section in [
                        draft.executive_summary,
                        draft.market_overview,
                        draft.key_findings,
                        draft.opportunities,
                        draft.risks,
                        draft.recommendations,
                        draft.conclusion,
                    ]
                )
                self.log.success(
                    f"Draft v{version} written — ~{total_words:,} words across 7 sections"
                )
                self.log.info(f"Title: {draft.title}")
                return draft

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
