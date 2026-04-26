# Portfolio Note — Agent Pipeline

## What it is

A 4-agent LLM pipeline (Researcher → Analyzer → Writer → Critic) built on the Anthropic Claude API. Given a single research topic, it produces a 2,000+ word professional business report with a feedback loop that automatically revises until quality gates pass.

## Why it matters for a Google AI Engineer interview

- **Agent orchestration** — a real multi-agent system, not a single prompt. Each agent has its own system prompt, role, and Pydantic v2 output schema.
- **Quality gating** — the Critic agent scores reports 1-10 on accuracy, completeness, and actionability. Below threshold, the pipeline loops back to the Writer up to N times.
- **Production hygiene** — typed Pydantic schemas, retry-with-backoff on API failures (3 attempts), structured logging with Rich, env-based config, deterministic outputs to `output/`.
- **Same pattern Google uses** — the Researcher/Critic loop is the same recipe used in agentic systems like AlphaCode 2, Bard's deep research mode, and self-critique RLHF.

## Tech stack

`Python 3.11` · `Anthropic Claude (claude-sonnet-4-6)` · `Pydantic v2` · `Rich` · `python-dotenv`

## Architecture

```
USER INPUT (topic)
    ▼
RESEARCHER → ResearchBrief (5 questions, stakeholders, trends)
    ▼
ANALYZER  → AnalysisReport (deep-dives, SWOT, ranked opportunities)
    ▼
WRITER    → DraftReport (2,000+ words, 7-section structure)
    ▼
CRITIC    → score 1-10
    ├── score < 7 → loop back to WRITER (max 3 revisions)
    └── score ≥ 7 → save to output/*.md
```

## Files to read first (for an interviewer)

1. `main.py` — the orchestrator, ~250 lines, easy to follow
2. `agents/critic.py` — the quality-gate logic
3. `models/schemas.py` — typed agent IO contracts

## How to run

```bash
cp .env.example .env   # add ANTHROPIC_API_KEY
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py --topic "AI SaaS market in Dublin 2026"
```

## What I would extend in week 2 of a Google internship

- Add a `RetrieverAgent` that grounds the Researcher in fresh web evidence (RAG)
- Replace the local critic with a learned reward model
- Add OpenTelemetry traces so each agent call is observable in Cloud Trace
- Move orchestration to Vertex AI Agent Builder for autoscaling
