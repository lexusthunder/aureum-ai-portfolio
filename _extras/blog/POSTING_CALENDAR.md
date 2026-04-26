# Aureum Blog · Posting Calendar (12 weeks · 36 posts)

> Cadence: **3 posts / week** — Sun · Tue · Thu, all at 14:00 UTC.
> Already shipped: 6 (April 26 – May 7). Scheduled below: 30 more (May 10 – July 30).

## How to use

Each row is one post, ready to expand into a full article. Time budget: **45-60 min/post** if you've already lived the topic. Steps:

1. Pick the next row from the calendar
2. Open `_post_template.html`, save as `posts/NN-slug.html`
3. Write 800-1500 words from the outline
4. Add an entry to `index.html` (top of the post grid)
5. Add an `<item>` to `feed.xml`
6. `git add . && git commit -m "Post NN: <title>" && git push`
7. Cross-post on Twitter / LinkedIn (templates below)
8. Submit to Hacker News on the post day at 14:00 UTC

## Calendar

| # | Date | Topic | Tag | Hook |
|---|---|---|---|---|
| 7 | Sun May 10 | The 5-agent pattern: a reusable blueprint | LLM | Once you've built one 5-agent system, you've built every one |
| 8 | Tue May 12 | Why per-PR pricing beats per-seat for autonomous coders | Founder | The maths: $50/PR > $30/seat at any team size > 5 |
| 9 | Thu May 14 | pgvector for code search: a 100-line tutorial | RAG | Forget Pinecone. Postgres + pgvector handles 10M chunks |
| 10 | Sun May 17 | I rewrote my CRM in 88 files. Here's the architecture | Founder | From 7,000-line single file to 88 modules · screen-by-screen |
| 11 | Tue May 19 | Sandbox or die: why every agent needs subprocess isolation | Security | One uncaught `rm -rf` ends your career. Here's the layer |
| 12 | Thu May 21 | Routing across vendors: when Claude beats GPT-4o (and vice versa) | LLM | A table of which vendor wins on which task type |
| 13 | Sun May 24 | The fastest way to learn ML: ship a tiny model, charge $5 | Career | Forget Coursera. Sell ten people a $5 model |
| 14 | Tue May 26 | OpenTelemetry for AI agents: the missing manual | MLOps | Span schema + naming conventions for agent calls |
| 15 | Thu May 28 | Why I refused VC for Aureum (this year) | Founder | Series A is fund-fit-finding. Bootstrap until you find it |
| 16 | Sun May 31 | Cost-routing LLMs: from static table to learned router | LLM | What sklearn ROC AUC has to do with $/PR |
| 17 | Tue Jun 02 | The recruiter's 90-second scan: what they actually look for | Career | Anatomy of a recruiter's first impression |
| 18 | Thu Jun 04 | Build the eval harness before you build the agent | MLOps | I lost a week not doing this. Don't repeat me |
| 19 | Sun Jun 07 | A founder's notebook: 10 mistakes from Aureum CRM v1 | Founder | Public retrospective. The painful parts |
| 20 | Tue Jun 09 | Sandboxing untrusted code in Python: subprocess vs E2B vs Modal | Security | When does $0.50 per E2B run pay for itself |
| 21 | Thu Jun 11 | The taste gap: why senior engineers still beat agents on ambiguity | LLM | What Genesis can't do yet |
| 22 | Sun Jun 14 | RAG over your codebase: chunking, embeddings, reranking | RAG | The 3-step recipe + the gotchas at each step |
| 23 | Tue Jun 16 | Founder + interview prep: how I split my hours | Career | Time-budget breakdown · what gets dropped |
| 24 | Thu Jun 18 | The autonomous-coder competitive landscape, charted | Industry | Cognition · Cursor · Magic · Replit · Codeium · what each owns |
| 25 | Sun Jun 21 | I built a 3D Vice City clone in Three.js for fun. Here's why it matters | Creative | Range of ability is a hireability signal |
| 26 | Tue Jun 23 | The right way to fine-tune a small model in 2026 | LLM | LoRA on Llama-3.3-70B vs full fine-tune. The decision matrix |
| 27 | Thu Jun 25 | What an enterprise SOC2 audit actually checks (for AI products) | Security | Compliance roadmap for an AI startup |
| 28 | Sun Jun 28 | Going from $0 to $10K MRR with one design partner | Founder | The math of design-partner pricing |
| 29 | Tue Jun 30 | The "1 product, 1 customer" rule for first-year founders | Founder | Why you should refuse customer #2 for 3 months |
| 30 | Thu Jul 02 | OpenTelemetry vs Datadog vs LangSmith: choosing AI observability | MLOps | Side-by-side · cost · features · lock-in |
| 31 | Sun Jul 05 | Why I'm still grinding LeetCode (and you might be wrong to skip it) | Career | The L4 conversation depends on it |
| 32 | Tue Jul 07 | Building a $50K MRR product solo · 90-day plan | Founder | The exact week-by-week sequence |
| 33 | Thu Jul 09 | The Aureum CRM AI matching algorithm, explained | Product | Embeddings · cosine similarity · re-ranking heuristics |
| 34 | Sun Jul 12 | Why iOS-first for B2B SaaS in 2026 (counterintuitive) | Product | Decision-makers check email on iPhone, not Mac |
| 35 | Tue Jul 14 | Pricing strategy for an autonomous coding agent: 4 tiers | Founder | The strategic logic behind Starter/Growth/Scale/Enterprise |
| 36 | Thu Jul 16 | What I want from Google Vertex AI in 2027 | Industry | Wishlist from a customer point of view |

## Cross-post templates

### Twitter / X (per post)

```
New post: <Title>

<One-line hook from the post>

<Post URL>
```

### LinkedIn (per post — slightly longer)

```
<Title>

<2-3 sentence hook from the post>

I wrote this because <reason>.

If you're <target audience>, you'll get something out of it.

Read: <Post URL>

#AIEngineering #LLMs #BuildInPublic
```

### Hacker News (Show HN posts only — Genesis posts especially)

Post at 14:00 UTC on Tuesday or Thursday. Title format:
```
Show HN: Aureum Genesis – an autonomous AI software engineer (per-PR pricing)
```

URL: link directly to the relevant blog post or the GitHub readme. Engage in comments for the first 4 hours.

### Reddit (selectively)

- r/MachineLearning — for technical posts (NumPy NN, eval harness)
- r/LocalLLaMA — for routing-table type posts
- r/programming — for "I built X" posts
- r/cscareerquestions — for the pivot story

## Metrics to track (weekly)

| Metric | Where | Goal |
|---|---|---|
| GitHub stars | github.com/lexusthunder/aureum-ai-portfolio | +5 / week |
| Site traffic | manual count via Google Search Console | +20% MoM |
| Blog post comments | replies to Twitter / LinkedIn posts | 2-3 per post |
| Inbound emails | inbox label "aureum-blog" | 1 per week |
| Cold-email reply rate | for sales kit emails | > 10% |

## Anti-patterns to avoid

- ❌ Writing for engagement, not signal — say what you actually believe
- ❌ Using buzzwords without specifics — every claim has a number
- ❌ Filler posts to keep cadence — better to skip a Tuesday than ship slop
- ❌ Cross-posting without adapting tone (LinkedIn ≠ Twitter ≠ HN)
- ❌ Forgetting the call-to-action (always link the relevant project / sales kit)

## When to break the schedule

- A genuine breaking event (a vendor pricing change, a paper drops in your space) → write a reaction post within 24h
- A customer signs → write the case study (with their permission) within a week
- A talk you give → publish the slide deck + write-up the same day

The cadence exists to enforce showing up. The exceptions exist because the world doesn't wait for Sundays.
