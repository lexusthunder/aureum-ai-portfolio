# Portfolio Note — Aureum CRM

## What it is

A real-estate / B2B CRM I am building as my own product under the **Aureum** brand. It has a Python backend (`aureum_backend.py`, ~50KB), AI-powered routes (`ai_routes.py`, ~15KB), Supabase as the data layer, and an iOS launcher (`LAUNCH_iOS.sh`) for the mobile build.

## Why it matters for a Google AI Engineer interview

- **Owns the full stack**, from DB schema → backend → AI inference → mobile app. This is what Google looks for: "can you ship?"
- **AI is a feature, not a demo** — the AI routes are wired into a real CRM workflow (lead scoring, summarization, drafting), not a separate notebook.
- **Founder-mode signal** — this is my own startup, demonstrating product thinking, not just engineering.

## Tech stack

`Python (FastAPI/Flask backend)` · `Supabase (PostgreSQL + auth)` · `SQLite (local cache)` · `React frontend` · `iOS / TestFlight build` · `OpenAI / Anthropic API for AI routes`

## Files to read first

1. `aureum_backend.py` — main backend, all CRM endpoints
2. `ai_routes.py` — AI-powered endpoints (summarization, scoring, drafting)
3. `frontend/` — React UI
4. `LAUNCH_iOS.sh` — the iOS build pipeline

## What I would extend

- Move AI routes behind Vertex AI endpoints with rate-limit + cost guardrails
- Add a vector store (pgvector on Supabase) for semantic lead search
- Add eval harness so prompt regressions are caught before deploy

## Status

Active development. Not all assets are pushed — see top-level `_meta/GIT_SETUP.md` for how to publish on GitHub under the **Aureum** brand.
