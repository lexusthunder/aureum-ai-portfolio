# How Google AI Engineer recruiters actually evaluate this portfolio

> A 30-second peek under the hood — the same lens any recruiter uses, applied to this repo.

## The 6-step recruiter scan

| # | Step | Time | What I optimized for |
|---|---|---|---|
| 1 | Skim master README | 5s | Clear value prop in line 1, stack table, 13-row project map |
| 2 | Click into 1-2 projects | 30s | Each has its own `PORTFOLIO_NOTE.md` with mermaid diagram + sample I/O |
| 3 | Check structure | 5s | `src/` layouts, `tests/`, `requirements.txt`, `Dockerfile` where it matters |
| 4 | Look for live demos | 10s | Roadmap explicitly schedules HF Spaces deploys in Weeks 4-6 |
| 5 | Skim 1 file of code | 30s | `agent-pipeline/main.py`, `b2b-lead-scoring-api/main.py` are the ones to open |
| 6 | Commit history | 5s | Owner is real human, real project — not a one-time copy-paste dump |

**Total budget:** under 90 seconds for a "yes / no / maybe" decision.

## What "looks functional" means (and how I'm closing the gap)

| Strong signal | Weak signal |
|---|---|
| ✅ Live demo URL (HF Spaces, Cloud Run) | ❌ "Run with `pip install`" only |
| ✅ Animated GIF / screenshot in README | ❌ Wall of text |
| ✅ Sample input → sample output, copy-paste-ready | ❌ "See `tests/` for examples" |
| ✅ Architecture mermaid diagram | ❌ No diagram |
| ✅ Green CI badge | ❌ No badge |

## The 6 strongest projects in this portfolio (recruiter-ranked)

1. **agent-pipeline** — multi-agent Claude with revision loop. Shows orchestration, schema design, retry logic.
2. **b2b-lead-scoring-api** — neural net **from scratch in NumPy** + FastAPI + auth + tests. Shows fundamentals + production sense.
3. **wine-quality-mlflow-e2e** — full MLOps stack with MLflow + Docker + GitHub Actions CI/CD. Shows shipping discipline.
4. **aureum-crm** — own startup with AI-powered backend routes + iOS app. Shows founder ownership.
5. **multimodal-agent-agrobot** — image + voice + text + IoT in one project. Shows breadth.
6. **crop-recommendation-gradio** — real dataset + RandomForest + Gradio UI. Shows real-world ML deploy.

## What's missing today (and the 3-month plan addresses)

- Live demo URLs → Week 4-6 of `_interview_prep/3_MONTH_ROADMAP.md` deploys 3 projects on HF Spaces / Cloud Run
- CI badges → Week 1 task = wire GitHub Actions on the MLOps + agent-pipeline projects
- RAG project → Week 3 of the roadmap
- Fine-tuning project → Week 5 of the roadmap

This portfolio is **deliberately incomplete on purpose** — every gap is on the roadmap with a date attached, so a recruiter sees "this person is operating with intent" instead of "this person ran out of ideas".
