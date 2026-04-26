# Genesis Eval Harness

> Frozen tickets that Genesis must pass before any prompt change ships.

## Why this exists

Without an eval harness, prompt engineering becomes superstition. With it, every prompt edit is a measurable change against a baseline. This is the same recipe used by every serious AI company (Anthropic's `evals/`, OpenAI's `oai-evals`, etc.).

## Files

| File | What |
|---|---|
| `tickets.yaml` | 5 frozen tickets — easy / medium / hard distribution. Public starter set; production fleet has 50. |
| `run_eval.py` | Runner — executes tickets, scores against expected, writes JSON summary, exits non-zero on regression |
| `last_run.json` | Most recent eval output (gitignored) |
| `goldens/` | Reference plans + diffs from the baseline run (regenerated on prompt change) |

## How to run

```bash
# Full suite, fail on any regression
python eval/run_eval.py --against main --max-budget 5

# Single ticket
python eval/run_eval.py --filter T001 --max-budget 0.5

# Faster iteration: run against your branch and compare to last main result
python eval/run_eval.py --against my-branch --out eval/branch_run.json
```

## CI integration

```yaml
# .github/workflows/genesis-eval.yml
name: Genesis Eval
on: { pull_request: { paths: ["agents/**", "core/**", "eval/**"] } }
jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r requirements.txt pyyaml
      - run: python eval/run_eval.py --against ${{ github.head_ref }} --max-budget 10
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

A regression on any ticket BLOCKS the PR. This is the single most important guardrail in the whole system.

## What a good eval ticket has

1. **Stable input** — the ticket text never changes
2. **Deterministic acceptance** — file paths touched, test count, min quality score
3. **Realistic budget** — set to what a competent engineer would charge in time-equivalent
4. **One concept per ticket** — don't mix "add endpoint" with "add caching"; split

## What's in the public starter

| ID | Difficulty | Concept |
|---|---|---|
| T001 | easy | Add a health-check endpoint with tests |
| T002 | medium | Add rate limiting middleware |
| T003 | medium | Refactor to structured JSON logging |
| T004 | medium | Add cursor-based pagination |
| T005 | hard | Detect + fix N+1 query, regression-test query count |

The full production fleet (50 tickets) covers also: SQL migrations, async refactors, security fixes, dependency upgrades, multi-file refactors, Docker hardening, and observability instrumentation.

## Roadmap

- [ ] Hydrate `tests/fixtures/eval_repo/` with a real seeded FastAPI demo project
- [ ] Add LLM-as-a-judge for diff quality (currently uses CriticAgent's own score)
- [ ] Track win-rate vs. specific human engineers (anonymized, opt-in)
- [ ] Public leaderboard at https://genesis.aureum.ai/leaderboard
