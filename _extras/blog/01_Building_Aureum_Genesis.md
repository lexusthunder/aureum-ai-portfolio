# Building Aureum Genesis: an autonomous AI software engineer in a weekend

*Originally drafted for Medium / Substack / dev.to · April 2026*

---

When Cognition Labs raised $175M for Devin at a $2B valuation, I did what every founder's first instinct is: I tried to build it.

Not to compete with them — to *understand* it.

This is what I learned, what I shipped in 72 hours, and what an L3 engineer can take away if they want to play in the same room as the Cursor / Magic.dev / Replit Agent crowd.

## The problem, in one sentence

Engineering teams ship maybe 20% of their backlog. The other 80% — the rate-limit-ticket, the structured-logging-refactor, the cursor-pagination-on-leads-endpoint — dies in a sprint that never happens. **An autonomous AI software engineer that picks up a ticket, writes the code, tests it, reviews it, and opens a PR could clear that backlog in days, not quarters.**

That's the $1B problem. Cursor charges per seat for the IDE. Cognition Labs charges per Devin "session". Genesis charges per merged PR.

## The architecture, in 5 boxes

I broke the autonomous engineer into **5 specialized agents**, each with typed Pydantic IO and a tightly-scoped system prompt:

| Agent | Input | Output |
|---|---|---|
| **Researcher** | Ticket + RAG over the repo | `ImplementationPlan` (touched_files, risks, test strategy) |
| **Coder** | Plan | Unified diff |
| **Tester** | Diff | `TestResult` (passed, failed, stdout) |
| **Critic** | Diff + tests | `Review` (score 1-10, blockers) |
| **Deployer** | Approved diff | `PullRequest` (number, URL) |

The orchestrator runs them in a loop: Code → Test → Critique. If Critic scores < 8, back to Coder for another revision (max 3). If it's >= 8, ship the PR.

This is the same recipe behind every "autonomous coder" startup in 2025-2026. The differences are in the details:
- Whose code is the Coder grounded in (RAG over the customer's repo, not just the ticket text)
- How is cost controlled (per-ticket hard budget cap)
- How is regression caught (frozen-ticket eval harness)
- Where does the code execute (E2B / Modal / your own VPC)

## The 3 things I'd missed in v1

I wrote the first version with a single `claude-opus-4-6` everywhere. **Cost: $0.80 per ticket**. That's fine for a demo, lethal at scale.

### 1. Different agents need different models

The Critic and Researcher need *judgement* — Sonnet 4.6 is enough. The Coder needs *strong code generation* — GPT-4o or Opus. The Tester is mostly *string templating* — Haiku is plenty.

I built a routing table:

```python
ROUTING_TABLE = {
    ("researcher", "medium"): "claude-sonnet-4-6",
    ("coder",      "medium"): "gpt-4o",
    ("tester",     "medium"): "claude-haiku-4-5",
    ("critic",     "medium"): "claude-sonnet-4-6",
    ("deployer",   "medium"): "claude-haiku-4-5",
}
```

**Cost per ticket dropped from $0.80 to $0.18.** Same quality, 4.4× cheaper.

### 2. Hard budget caps are non-negotiable

Without `BudgetExceeded` raised at the cost tracker layer, an agent can spiral: Coder produces broken diff → Tester fails → Critic says revise → Coder produces broken diff again. I've watched runs eat $30 before I killed them by hand.

The fix is one line of discipline: every LLM call goes through `cost_tracker.assert_can_spend(estimated_cost)`. If we'd exceed the cap, we raise. The orchestrator catches it and ends the run cleanly.

### 3. The eval harness IS the product

Every prompt change is a release. Without a frozen-ticket eval harness, prompt engineering becomes superstition. With one, every change is a measurable diff vs. baseline.

I shipped 5 starter tickets covering easy/medium/hard difficulty. Production has 50. CI runs the eval on every PR that touches `agents/` or `core/`. A regression blocks the merge. **No exceptions.**

## What this proves

If you're applying to an L4+ AI engineering role, the question isn't "can you write code?" — that's table stakes. The question is "can you build the *next* category-defining thing?"

Genesis isn't a tutorial. It's a working argument that the autonomous-coder space is real, addressable, and worth a $1B-2.6B valuation when executed well. The same archetype as Cognition Labs ($2.0B), Cursor ($2.6B), Magic.dev ($1.5B), Replit Agent ($1.16B), Codeium ($1.25B).

If you're a recruiter at Google, DeepMind, or Anthropic — Genesis is the project I'd open with. The rest of my portfolio is components. This is the company.

## What's next

- Real customer pilot (target: a 50-engineer Series B SaaS in Dublin)
- Fine-tune a private Coder model on the customer's codebase (LoRA on Llama 3.3 70B)
- VS Code extension that turns any selection into a Genesis ticket
- $50K MRR by end of year

If you have a backlog problem and want to be design partner #1, I'm at urecheionelalexandru@gmail.com.

---

*Source code at [github.com/lexusthunder/aureum-ai-portfolio/tree/main/07_Autonomous_AI_Platform/aureum-genesis](https://github.com/lexusthunder/aureum-ai-portfolio/tree/main/07_Autonomous_AI_Platform/aureum-genesis).*

*Built by [Ureche Ionel Alexandru](https://github.com/lexusthunder) — Aureum, Dublin.*
