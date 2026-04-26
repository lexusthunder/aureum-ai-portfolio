# Genesis Operations Runbook

> What every Genesis operator (us + customer SREs) needs to know to run this in production.

## Quickstart for a new customer

```bash
# 1. Clone
git clone https://github.com/lexusthunder/aureum-ai-portfolio.git
cd aureum-ai-portfolio/07_Autonomous_AI_Platform/aureum-genesis

# 2. Configure
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY, OPENAI_API_KEY, GH_TOKEN, GH_REPO, GENESIS_BUDGET_USD

# 3. Spin up
docker compose up -d

# 4. Smoke test (mock mode, no $ spent)
docker compose run genesis python demo.py --mock

# 5. Real ticket
docker compose run -e TICKET="Add /api/v1/health/db endpoint" genesis
```

## Day-2 ops

### Watching cost

```bash
# Tail OTel traces (any OpenTelemetry-compatible UI: Jaeger, Cloud Trace, Honeycomb)
# Each agent run is a span with token + USD attributes.
```

### Killing a runaway

```bash
# Graceful — tracker raises BudgetExceeded after current LLM call returns
GENESIS_BUDGET_USD=0 docker compose restart genesis

# Hard — kill the container
docker compose kill genesis
```

### Rotating LLM keys

```bash
# Edit .env, then:
docker compose up -d --force-recreate genesis
```

## Common failures and fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| `BudgetExceeded` raised early | Customer set cap too low for ticket complexity | Raise `GENESIS_BUDGET_USD` for that customer |
| `Coder` produces invalid diff | Model context window exceeded by repo evidence | Lower `RAG_TOPK` from 8 to 4 |
| `Tester` always fails 0/0 | Repo has no `pytest` configured | Add Tester `--ignore-no-tests` flag (W2 backlog) |
| `Deployer` fails `git push` | Token missing `repo` scope | Re-issue PAT with `repo` + `workflow` scopes |
| Latency p99 > 5min | Going to Opus on every loop | Force `complexity=medium` via env var or LLMRouter override |

## Deployment topologies

### Option A — SaaS (we host)

```
Customer GitHub  →  GH App webhook  →  genesis.aureum.ai (multitenant)
                                            │
                                            ├─ Postgres (pgvector) per tenant
                                            ├─ Anthropic / OpenAI APIs
                                            └─ Sandbox: E2B
```

### Option B — VPC (Growth plan)

```
Customer GitHub  →  customer.aws / customer.gcp
                        │
                        ├─ ECS / Cloud Run runs Genesis container
                        ├─ RDS Postgres + pgvector
                        ├─ Anthropic / OpenAI calls (egress only)
                        └─ Code never leaves their VPC
```

### Option C — Air-gapped on-prem (Enterprise)

```
Genesis container + local Llama-3.3-70B (or Mistral-Large) via vLLM
        │
        ├─ Local Postgres + pgvector
        ├─ No outbound LLM calls
        └─ Customer fully isolated
```

## SRE invariants

1. **Genesis NEVER merges** — it only opens PRs. Reviewer + CI gate stays.
2. **Genesis NEVER reads `.env*`, `*.key`, `*.pem`, `id_rsa*`** — enforced in `fs.read`.
3. **Genesis NEVER spends past the cap** — `BudgetExceeded` is non-recoverable.
4. **Every agent call is a traced span** — auditable post-hoc.
5. **Genesis rolls back on `git apply` failure** — no half-applied diffs left in customer repo.

## Eval harness

```bash
# 50 frozen tickets + golden PRs. Run before any prompt change.
python eval/run_eval.py --against main --max-budget 100

# Output:
#   ✅ 47/50 success
#   ⚠️  2/50 quality < 8 (regression vs baseline 1)
#   ❌  1/50 BudgetExceeded
```

A regression (>3 of the 50) blocks a prompt-change deploy via CI.

## On-call playbook (Scale plan, SLA 99.5%)

| Severity | Response | Definition |
|---|---|---|
| **SEV-1** | 15 min | Genesis down for >5 min for any Scale customer |
| **SEV-2** | 1 hr | Single-tenant impact, agent loop degraded |
| **SEV-3** | 4 hr | Cosmetic / single-ticket failure |

PagerDuty rotation, weekly on-call.
