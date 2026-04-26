from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class ResearchBrief(BaseModel):
    """Output from Researcher Agent."""

    topic: str = Field(description="The research topic")
    research_questions: List[str] = Field(
        description="Exactly 5 critical research questions"
    )
    key_stakeholders: List[str] = Field(
        description="Key stakeholders in this market/space"
    )
    estimated_market_size: str = Field(
        description="Estimated market size with context"
    )
    key_trends: List[str] = Field(description="3-5 key market trends identified")
    research_scope: str = Field(
        description="Clear description of the research scope and boundaries"
    )


class QuestionAnalysis(BaseModel):
    """Deep analysis for a single research question."""

    question: str = Field(description="The research question being answered")
    analysis: str = Field(description="Detailed analysis and answer to the question")
    key_insights: List[str] = Field(description="2-4 key insights from this analysis")


class SWOTAnalysis(BaseModel):
    """SWOT analysis of the market/topic."""

    strengths: List[str] = Field(description="Market strengths / favorable factors")
    weaknesses: List[str] = Field(description="Market weaknesses / unfavorable factors")
    opportunities: List[str] = Field(description="Growth opportunities identified")
    threats: List[str] = Field(description="Threats and risks in the market")


class AnalysisReport(BaseModel):
    """Output from Analyzer Agent."""

    topic: str = Field(description="The research topic")
    question_analyses: List[QuestionAnalysis] = Field(
        description="Deep analysis for each research question"
    )
    swot_analysis: SWOTAnalysis = Field(description="Full SWOT analysis")
    market_opportunities: List[str] = Field(
        description="Top market opportunities ranked by potential"
    )
    competitive_landscape: str = Field(
        description="Overview of the competitive landscape"
    )
    key_findings: List[str] = Field(
        description="5-7 most important findings from the analysis"
    )


class DraftReport(BaseModel):
    """Output from Writer Agent."""

    title: str = Field(description="Professional report title")
    topic: str = Field(description="The research topic")
    executive_summary: str = Field(
        description="Executive summary (200-300 words)"
    )
    market_overview: str = Field(
        description="Market overview section (300-400 words)"
    )
    key_findings: str = Field(
        description="Key findings section with numbered findings (400-500 words)"
    )
    opportunities: str = Field(
        description="Opportunities section (300-400 words)"
    )
    risks: str = Field(description="Risks and challenges section (200-300 words)")
    recommendations: str = Field(
        description="Strategic recommendations section (300-400 words)"
    )
    conclusion: str = Field(description="Conclusion section (150-200 words)")
    version: int = Field(default=1, description="Draft version number")


class CriticFeedback(BaseModel):
    """Output from Critic Agent."""

    score: int = Field(ge=1, le=10, description="Overall score 1-10")
    accuracy_score: int = Field(ge=1, le=10, description="Accuracy score 1-10")
    completeness_score: int = Field(ge=1, le=10, description="Completeness score 1-10")
    actionability_score: int = Field(
        ge=1, le=10, description="Actionability score 1-10"
    )
    strengths: List[str] = Field(description="What the report does well")
    weaknesses: List[str] = Field(description="Areas that need improvement")
    specific_feedback: List[str] = Field(
        description="Specific, actionable feedback items"
    )
    approved: bool = Field(description="True if score >= 7 and report is approved")
    revision_instructions: Optional[str] = Field(
        default=None,
        description="Detailed instructions for revision if not approved",
    )


class FinalReport(BaseModel):
    """Final approved report ready for saving."""

    title: str
    topic: str
    content: str = Field(description="Full markdown content of the report")
    critic_score: int
    iterations: int
    generated_at: str
    word_count: int
