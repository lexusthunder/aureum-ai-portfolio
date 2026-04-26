# Twitter / X Thread Templates — One per blog post

> Drop into Twitter/X composer. Spaced as separate tweets. Each thread targets ~2,000 impressions on a moderate account.

---

## Thread 1 — "Why your team ships 20%" (post 01)

```
1/ I asked 12 VPs of Engineering at Series B SaaS companies what % of their backlog they actually ship.

Median: 21%.

Read that again.

2/ The 79% that doesn't ship is two things.

The boring 35% — refactors, rate limiting, structured logging, cursor pagination, the N+1 nobody owns.

And the hard 50% — real features, ambiguous problems, novel system design.

3/ The boring 35% is what kills senior engineers.

It needs context. It needs care. It needs taste. But it doesn't need *creativity*.

So senior eng do it. Or it doesn't get done.

4/ That's the wedge for autonomous coding agents.

Not "replace developers". Take the boring 35%. Free senior eng for the hard 50%.

5/ The math:

Avg eng-hours/ticket: 3
Avg fully-loaded $/hour: $80
35% Genesis-able tickets: 4.2 / N tickets / month
At N=50 engineers: $50,400 saved/month vs. ~$4,000 platform cost.

ROI: 12.6×

6/ This is what I'm building at Aureum.

Genesis takes a ticket from Linear/Jira. Writes the code. Tests it. Self-reviews. Opens a PR. Per-PR pricing.

Same archetype as Cognition Labs ($2B), Cursor ($2.6B), Magic.dev ($1.5B). Different wedge.

7/ Full post + the math + why I refused to skip the boring sales kit:

https://lexusthunder.github.io/aureum-ai-portfolio/blog/posts/01-why-your-team-ships-20-percent.html

8/ If you're a VP of Eng who wants to be design partner #0 — DM me. Picking 3.

Aureum, Dublin. Per merged PR. 30-day pilot.
```

---

## Thread 2 — "LLM routing table" (post 02)

```
1/ Yesterday I cut my Claude API costs 4.4× with a 15-line routing table.

Same eval pass rate. Just smarter routing.

Here's the table 👇

2/ Different agents have different cognitive loads.

Researcher: needs *reasoning* — Sonnet enough.
Coder: needs strong code-gen — GPT-4o or Opus.
Tester: mostly templates — Haiku.
Critic: needs judgement — Sonnet.
Deployer: writes a PR title — Haiku.

3/ The routing table:

(researcher, medium) → claude-sonnet-4-6
(coder, medium) → gpt-4o
(tester, medium) → claude-haiku-4-5
(critic, medium) → claude-sonnet-4-6
(deployer, medium) → claude-haiku-4-5

(complexity flips models for hard tickets — bumps to Opus)

4/ Result:

Cost per ticket: $0.80 → $0.18
Eval pass rate: 47/50 → 47/50 (same)
4.4× cheaper.

5/ For a 100-customer SaaS at 200 tickets/customer/month:

Before: $192k/yr in LLM spend.
After: $43k/yr.
Saved: $148k/yr — one engineer's salary.

6/ Three lessons:

→ Optimise the median ticket, not the worst
→ Eval harness gates the routing change (no eval = no ship)
→ Multi-vendor isn't disloyal, it's correct (Sonnet judges, GPT-4o codes)

7/ Full post with code:

https://lexusthunder.github.io/aureum-ai-portfolio/blog/posts/02-llm-routing-table.html

8/ Building autonomous coding agents at @aureum_ai (Dublin). Per-PR pricing. DM if you have backlog problems and want to be design partner.
```

---

## Thread 3 — "Eval harness is the product" (post 03)

```
1/ Hot take: the eval harness IS the product in AI engineering. Not the model. Not the prompts. The eval harness.

Without it, prompt engineering becomes superstition.

2/ The default workflow at most AI teams:

→ Engineer changes a prompt
→ Eyeballs 5 outputs
→ "Looks better" → ship
→ Customer hits regression 3 days later
→ Engineer eyeballs 5 different outputs
→ Repeat

This isn't engineering. It's tarot.

3/ The fix: a frozen test set + scoring function.

For Aureum Genesis, my harness has 5 starter tickets (public) + 50 in production.

Each ticket: locked input, expected output, min quality score, max budget cap.

4/ Anatomy of one ticket:

```yaml
- id: T005
  difficulty: hard
  ticket: |
    The /properties endpoint has an N+1 query.
    Refactor to a single JOIN. Add a regression test
    asserting query count <= 2.
  expected:
    min_quality_score: 9
    max_budget_usd: 1.50
```

5/ Why this is the *product*:

→ It's the only thing that makes prompt iteration safe
→ It's how you sell to enterprise (proof, not philosophy)
→ It's the data that becomes your fine-tune moat over time

6/ Three pitfalls to avoid:

→ Eval suite drift (engineers "fix" tickets that fail) → tickets are append-only
→ LLM-as-judge cheats (same model writing & scoring) → use a different model family
→ All easy tickets → 30/50/20 easy/med/hard split

7/ Steal the 5-ticket starter set:

https://github.com/lexusthunder/aureum-ai-portfolio/blob/main/07_Autonomous_AI_Platform/aureum-genesis/eval/tickets.yaml

8/ Full post:

https://lexusthunder.github.io/aureum-ai-portfolio/blog/posts/03-eval-harness-is-the-product.html

If you're not running an eval gate on prompt changes, you're not yet doing AI engineering. You're doing AI gambling.
```

---

## Thread 4 — "NumPy NN" (post 04)

```
1/ Most people learn ML starting with PyTorch.

torch.nn.Linear, .backward(), an optimizer, fit loop. You're shipping in an afternoon.

I did this for a year. Then a senior engineer asked me, in a 1:1, "what does .backward() actually compute?"

I couldn't answer.

2/ I went home that weekend and wrote backprop in NumPy.

Not for production. For interviews. For the moment when "what's actually happening on the backward pass" comes up.

Here's the 50-line snippet:

3/ ```python
class NN:
  def __init__(self, n_in, n_h, lr=0.05):
    self.W1 = np.random.randn(n_in, n_h) * np.sqrt(2/n_in)
    self.W2 = np.random.randn(n_h, 1) * np.sqrt(2/n_h)
    ...

  def forward(self, X):
    self.Z1 = X @ self.W1
    self.A1 = np.maximum(0, self.Z1)
    self.A2 = sigmoid(self.A1 @ self.W2)
    return self.A2
```

4/ The magic moment:

dL/dz for sigmoid + binary cross-entropy = (predicted - true).

Not a chain rule trick. A clean form, by design.

```python
dZ2 = (A2 - y) / m
dW2 = A1.T @ dZ2     # input was A1, transpose
dA1 = dZ2 @ W2.T     # gradient w.r.t. A1
dZ1 = dA1 * (Z1 > 0) # ReLU gradient
dW1 = X.T @ dZ1
```

5/ That's it. Backprop in your bones.

The whole machine learning stack — PyTorch, TensorFlow, JAX — is doing this under the hood.

Once you've written it once, every paper becomes legible.

6/ You should write one. ~3 hours of work. Pays back forever.

Steps:
→ Implement on Iris dataset
→ Add a third layer
→ Replace BCE with cross-entropy + softmax (derive dL/dZ from scratch)
→ Implement Adam from the paper

7/ Full post + working code:

https://lexusthunder.github.io/aureum-ai-portfolio/blog/posts/04-numpy-neural-net.html

8/ Next time a senior asks "explain backprop", you don't quote a textbook. You ask for a whiteboard. The senior smiles. You're hired.
```

---

## Thread 5 — "Theology to AI" (post 05)

```
1/ I have a Bachelor's in Pastoral Theology.

I'm applying to Google AI Engineer roles next month.

Here's the only pivot story that worked.

2/ Three things made it work:

(1) I built things, not credentials.

The temptation when pivoting is to credentialise — bootcamps, certs, MicroMasters. I did some, then stopped. Nobody at Google has ever asked about a certificate. They've asked about projects.

3/ (2) I leveraged what I already had.

Theology training is *extremely* useful for prompt engineering.

You spend years parsing loaded text, structuring arguments, holding contradictory positions. That's exactly what LLM work is.

I didn't hide the degree. I framed it.

4/ (3) I built a brand, not a job application.

Most pivoters apply to 200 jobs and get 4 callbacks.

Instead I built Aureum — a portfolio with my own narrative ("I'm building Genesis, in the same space as Cognition Labs"), a public site, a blog, a sales kit.

Recruiters don't filter that. They engage with it.

5/ Three things I'd do differently:

→ Start the public artefact on day 1 (I waited 18 months — those returns compound from month 0)
→ Pick one wedge (I tried to be everything; better to go deep on autonomous agents)
→ Don't confuse "applying" with "getting hired" — referrals convert 30× cold applications

6/ The honest part:

The pivot took longer than I want to admit. There were months where it felt pointless.

What kept it moving: small wins, recorded publicly. A new project shipped. A blog post 3 people read. A GitHub star from a stranger.

The receipts compound, even when the inbox is empty.

7/ If you're pivoting today:

→ Make a public GitHub TODAY
→ Pick one wedge, build one thing in it
→ Find one warm intro per week

That's the playbook. The hard part is doing it for 18 consecutive months while your cohort thinks you're delusional.

8/ Full pivot story:

https://lexusthunder.github.io/aureum-ai-portfolio/blog/posts/05-from-theology-to-ai.html

If you're pivoting and want to swap notes, DM. The replies keep my own evenings honest.
```

---

## Thread 6 — "Genesis Week 1" (post 06)

```
1/ I shipped Aureum Genesis v1.0 in 72 hours.

An autonomous AI software engineer. Real Anthropic + OpenAI clients, real GitHub PR opener, Docker deploy, full sales kit.

Here's the build log.

2/ Hour 0: hypothesis.

Cognition Labs raised $175M for Devin at $2B valuation. Cursor at $2.6B. Magic.dev at $1.5B. They all share: autonomous coding agents.

I picked per-PR pricing. Predictable. Aligned to outcome.

3/ Hours 1-6: architecture.

5-agent loop on paper:

Researcher → Coder → Tester → Critic → Deployer
                       ↑           ↓
                       └── revise if score < 8

Constraint imposed up front: hard per-ticket budget cap. Without it, an agent can burn $200 in 30 min.

4/ Hours 7-18: skeleton.

Wrote orchestrator. Stubbed agents with mocked LLM responses. LLM router with 15-entry routing table. Cost tracker with real $/1M-token prices.

By hour 18: system runs end-to-end with mocks. 6 unit tests pass.

5/ Hours 19-30: real LLM clients.

Hooked Anthropic + OpenAI SDKs.

First real run on T001 ("Add /api/v1/health/db endpoint, FastAPI"):

Cost: $0.41
Wall time: 92 seconds
Result: tested PR-ready diff, no human in loop

I sat there staring at the terminal for a while.

6/ Hours 31-42: sandbox + GitHub PR.

Subprocess shell with timeout. fs path-escape guard. git tools. GitHub PR via REST API.

That's when Genesis stopped being a toy.

7/ Hours 43-54: Docker + observability.

OpenTelemetry on every agent call. Cloud Trace integration. Per-tenant span attributes (tokens, $, model, agent).

8/ Hours 55-66: sales kit.

This is the part most engineers skip. I refused.

→ 30-sec pitch
→ 4 pricing tiers ($49/PR Starter → $1M/yr Enterprise)
→ ROI calculator (4×-12.6× ROI dovedit)
→ Cold sales email
→ Demo script
→ 3 deployment topologies

If you can't write the sales kit, you don't have a product. You have a demo.

9/ Hours 67-72: runbook.

5 SRE invariants. Quickstart in 5 commands. On-call playbook SEV-1/2/3.

10/ What I learned:

→ Constraints invented up front save 10 hours later
→ Mock first, real second
→ The sales kit is a forcing function for clarity
→ "MVP in a weekend" is bullshit if you skip Docker, observability, runbook

11/ Genesis on GitHub:

https://github.com/lexusthunder/aureum-ai-portfolio/tree/main/07_Autonomous_AI_Platform/aureum-genesis

12/ Full build log:

https://lexusthunder.github.io/aureum-ai-portfolio/blog/posts/06-genesis-week-one.html

If you're a VP of Eng — DM. Picking 3 design partners. $0 setup, 30-day pilot, per-PR pricing only.
```

---

## Posting cadence

| Day | Time | Action |
|---|---|---|
| Sun | 14:00 UTC | New blog post → thread same day, posted as Twitter thread |
| Tue | 14:00 UTC | Same |
| Thu | 14:00 UTC | Same |
| Mon/Wed/Fri | 18:00 UTC | One micro-post (1-2 tweets), no thread |
| Sat | — | Off |

## Post timing tips

- **14:00 UTC** = 9am EST = morning US, evening EU, peak global engagement
- **Replies in first 60 min** matter most for thread reach — engage with first 5-10 commenters
- **Pin** your best Genesis thread to your profile

## Engagement playbook

- Reply to every comment within 4h of post
- Quote-tweet other AI engineers' threads with substantive additions
- Don't engage in fights / hot takes — algorithm doesn't reward, recruiters notice negatively
