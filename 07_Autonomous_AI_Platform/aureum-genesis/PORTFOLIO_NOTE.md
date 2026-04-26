# Portfolio Note — Aureum Genesis (the billion-dollar one)

## What it proves to a Google interviewer

This isn't a tutorial — this is the same problem space as **Cognition Labs (Devin, $2B), Cursor ($2.6B), Magic.dev ($1.5B), Replit Agent ($1.16B), Codeium/Windsurf ($1.25B)**. The interviewer sees:

- I understand where the AI engineering market is going (autonomous coding agents)
- I can decompose a "build a Devin" prompt into 5 specialised agents with typed IO
- I think about the boring-but-critical pieces: cost caps, sandboxing, eval harnesses, OTel
- I frame work as products, not exercises

## Recruiter lens — value signals

| Signal class | What I demonstrate |
|---|---|
| **Architecture** | 5-agent loop, multi-vendor LLM router, pgvector RAG, plugin tool registry, eval harness |
| **Code quality** | Pydantic-typed IO, async orchestrator, retry-with-backoff, OTel traces |
| **Product thinking** | Per-PR pricing model, 60-sec pitch, prioritised "what next" list grounded in customer value |
| **Ambition** | Project framed against companies with $1B+ valuations, not against bootcamp homework |

## What's actually in this folder

🟡 **Architecture + skeleton** — orchestrator and agents have working interfaces, mocked LLM responses produce valid Pydantic objects, eval harness runs. Real LLM keys flip it on with one `.env` change.

🟢 **Public face** is the README + this note + the Mermaid diagram — these are what a recruiter reads in 90 seconds before deciding.

🔴 **Full e2e ticket → real PR** — Week 8 of `_interview_prep/3_MONTH_ROADMAP.md`.

## Files an interviewer should open

1. `README.md` — the vision + architecture + comp valuations
2. `main.py` — the orchestrator showing the agent loop
3. `core/llm_router.py` — model selection logic across vendors
4. `agents/coder.py` — the diff-and-iterate loop
5. `core/cost_tracker.py` — proof I think about $ in production AI

## Why this is the most important project in the portfolio

The other 13 projects prove I can build **components**. This one proves I can frame the **company**. For a Google AI Engineer interview that's an L4+ signal — engineers at L4 own systems, not just tasks.
