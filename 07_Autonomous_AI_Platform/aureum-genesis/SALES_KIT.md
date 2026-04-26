# Aureum Genesis — Sales Kit

> Everything you need to sell Genesis to a customer in one document.

## The 30-second pitch

Engineering teams ship maybe 20% of their backlog. **Aureum Genesis is an autonomous AI software engineer** that picks up tickets from your tracker, writes the code, runs tests, reviews itself, and opens a pull request — without a human in the loop. You pay per merged PR.

## Who buys this

| Buyer persona | Pain | Outcome they want |
|---|---|---|
| **VP of Engineering, Series B-D** (50-200 eng) | Backlog grows faster than headcount; senior eng pulled into rote tickets | Clear backlog of "low-creativity, high-volume" tickets without hiring |
| **Engineering Manager, mid-market SaaS** (10-30 eng) | Hard to do platform / refactor work between feature pressure | Genesis takes refactors + test coverage tickets while team ships features |
| **Indie / solo founder** | Drowning in their own backlog | Genesis becomes the first "second engineer" |

## Pricing

We offer **3 plans** plus **enterprise**.

| Plan | Price | What's included | Best for |
|---|---|---|---|
| **Starter** | **$49 / merged PR** | Up to 50 PRs/mo, max 1 repo, GitHub only, Claude Sonnet routing only | Solo / small teams trying it |
| **Growth** | **$2,500 / mo** flat + **$25 / merged PR over 100** | Unlimited repos, GitHub + GitLab, multi-vendor LLM routing, custom prompts, eval harness | Series A-C engineering orgs |
| **Scale** | **$15,000 / mo** | Everything in Growth + dedicated VPC deployment, SSO, audit log, SLA 99.5%, dedicated solutions engineer | 100+ eng orgs, regulated industries |
| **Enterprise** | **Custom** (typical $250K-$1M / yr) | On-prem deploy, fine-tuned coder agent on your codebase, custom tools, white-glove onboarding | Banks, healthcare, defense, FAANG |

### Unit economics for the customer

> "Will this pay for itself?" — yes if you get >2 merged PRs/eng/month, basically always.

Average mid-market engineer fully-loaded cost: **$160K/yr ≈ $80/hour**.
Average ticket: **3 engineer-hours ≈ $240** in time saved.
Genesis cost per merged PR: **$25-49**.
**Margin per PR for the customer: ~$190 (75-85%).**

## ROI calculator (one-pager for the buyer)

```
Inputs
  Eng FTE count             :  N
  Avg tickets/eng/month     : 12
  % of tickets Genesis-able : 35%   (configurable per customer)
  Avg eng-hours/ticket      :  3
  Eng fully-loaded $/hour   : $80

Math
  Tickets/month auto-shipped = N × 12 × 35%   = 4.2 × N
  Eng-hours saved/month      = 4.2 × N × 3    = 12.6 × N
  $ saved/month              = 12.6 × N × $80 = $1,008 × N

  Genesis cost (Growth plan) = $2,500 + $25 × max(0, 4.2×N − 100)

Break-even
  At N=10  →  $10,080 saved   vs   $2,500 cost   →   ROI 4.0×
  At N=50  →  $50,400 saved   vs   $4,000 cost   →   ROI 12.6×
  At N=200 →  $201,600 saved  vs   $19,500 cost  →   ROI 10.3×
```

## Sales email (cold)

> Subject: Your eng team's backlog → 35% smaller in 30 days
>
> Hi {first_name},
>
> {company} ships {n_releases}/quarter — well above average. The backlog you're not shipping is probably the bottleneck (it usually is at this scale).
>
> We built Aureum Genesis: an autonomous AI software engineer that takes your tickets and ships PRs. Customers see ~35% of their backlog auto-shipped in the first 30 days.
>
> Pricing starts at $49/merged PR. ROI is positive at any team size above 5 engineers.
>
> Worth 20 minutes? I'll show you Genesis on your repo, live.
>
> — Alex Ureche, Aureum
> [calendly.com/aureum-genesis](https://calendly.com/aureum-genesis)

## Demo script (live, 20 min)

1. **Minute 0-2** — show the customer's tracker. Pick 1 real ticket together.
2. **Minute 2-3** — paste the ticket into Genesis: `python main.py --ticket "..."`.
3. **Minute 3-15** — talk through orchestrator log live as it runs:
   - Researcher fetches relevant code (RAG)
   - Coder produces diff
   - Tester runs pytest
   - Critic scores 9/10, suggests 1 fix
   - Coder revises, Tester passes again, Critic 10/10
   - Deployer opens PR
4. **Minute 15-18** — open the PR on GitHub. Show diff, tests, PR description.
5. **Minute 18-20** — pricing + next-step.

## Deployment options for the customer

| Option | Setup time | Customer data leaves their cloud? |
|---|---|---|
| **SaaS** (genesis.aureum.ai) | 5 min — install GitHub App, set budget cap | Yes, source code traverses LLM vendors |
| **VPC** (Growth plan) | 1 day — Terraform module deploys into customer AWS/GCP | Code stays in their VPC; only LLM API calls leave |
| **On-prem** (Scale + Enterprise) | 3-5 days — Docker Compose + DNS + SSO wiring | Nothing leaves; bring-your-own-LLM (Claude/GPT/Gemini/local Llama) |

## SLA outline (Scale plan)

- **Availability:** 99.5% monthly uptime (excluding upstream LLM outages)
- **Response time:** orchestrator p50 < 90s, p99 < 300s
- **Data:** customer source never persisted on Aureum servers in VPC/on-prem deploys
- **Audit:** every agent call traced via OTel, logs retained 90 days
- **Support:** Slack Connect + dedicated solutions engineer, business hours response < 4h

## Onboarding checklist (per customer)

- [ ] Install Aureum Genesis GitHub App on customer's org
- [ ] Customer creates a project board / Linear filter "genesis-eligible"
- [ ] Customer sets budget cap (default $5/PR, $1,000/month)
- [ ] We run 5 sample tickets in dry-run mode, show traces
- [ ] Customer approves first 5 real PRs manually
- [ ] Switch to "auto-merge after 2 reviewer approvals"
- [ ] First invoice at end of month based on `merged_pr_count × $X`

## Compliance & security one-pager

- **SOC 2 Type II:** in flight (target Q3 2026)
- **ISO 27001:** roadmap Q4 2026
- **Code scanning:** every PR Genesis opens runs through customer's existing SAST (we do not bypass)
- **Secrets:** Genesis refuses to read files matching `.env*`, `*.key`, `*.pem`, `id_rsa*` — enforced in `fs.read` tool
- **PII:** customer data is in-flight only; never logged with prompts; OTel spans redact source code by default

## FAQ for the buyer

**Q: Will Genesis touch our auth / payments code?**
A: No. The customer maintains an allow-list of paths. Default excludes `auth/`, `billing/`, `secrets/`.

**Q: How do you stop Genesis from going crazy and spending $10K of LLM credits?**
A: Per-ticket hard cap (default $5), org-wide monthly cap, hard daily ceiling. `BudgetExceeded` halts the orchestrator deterministically.

**Q: What if Genesis writes wrong code?**
A: It can't merge — it opens a PR. Your existing CI + reviewer flow catches anything wrong. Plus the Critic agent already scores 1-10 internally before opening.

**Q: Can we self-host?**
A: Yes — Scale plan and above. Docker Compose ships in this repo (`docker-compose.yml`).

**Q: Does Genesis learn from our codebase?**
A: Yes — pgvector indexes every commit. Embeddings stay inside your VPC on Scale/On-prem plans.

## Next step for the prospect

> "20-minute live demo on your repo. Pick a ticket, watch Genesis ship a PR. If you don't see ROI in the first 5 minutes, I'll stop selling."
>
> — book at [calendly.com/aureum-genesis](https://calendly.com/aureum-genesis)
