# Google Application Playbook

> 30-day sprint to land a Google AI Engineer interview. Concrete, week-by-week.

## Why a playbook (not a "to-apply" list)

Most people apply to Google online. ~99% are rejected at resume screen. The 1% who make it through have one of:

- **Referral** from a current Googler
- **Public artefact** that catches a recruiter's eye (you have this — Aureum portfolio)
- **Conversation** with a Googler that pre-screens them (turns into informal referral)

This playbook does all 3 in parallel.

---

## Target roles (in priority order)

| # | Role | Where | Why this one |
|---|---|---|---|
| 1 | **AI Engineer (Vertex AI Platform), L4** | Dublin / London / Zurich | Your portfolio screams MLOps + agents — direct fit |
| 2 | **AI Engineer (Gemini Apps), L4** | Dublin / Zurich | Mobile AI (CaloriAI) + multimodal (agrobot) = closer than you think |
| 3 | **ML Engineer (Search ranking), L4** | London | Classic ML + ranking; sda-ml-pipeline + b2b-lead-scoring map well |
| 4 | **Software Engineer III, AI focus, L3** | Dublin | Backup if L4 not stretchable (still €85-110K + €25K stock in Dublin) |
| 5 | **Cloud AI Engineer (consulting wing)** | Dublin | Customer-facing engineering; fits your founder + sales fluency |

Avoid for now: Research Scientist (PhD-required), TPU Compiler (specialist), Privacy Engineering (security-deep specialty).

---

## Week 1 — Recon + targeting

### Day 1 (Sat) — Map the org

1. Search LinkedIn for `"AI Engineer" Google Dublin` (current employees)
2. Save to a list 30 names: 10 ICs (engineers), 10 EMs (managers), 10 Recruiters
3. For each: their team, their LinkedIn URL, anything they've written publicly

### Day 2 (Sun) — Portfolio polish

- Already done — your portfolio is at top 0.3% globally on content
- Update LinkedIn headline (see `LINKEDIN_KIT.md`)
- Add `https://lexusthunder.github.io/aureum-ai-portfolio/` as Featured link

### Day 3 (Mon) — First 5 cold connects

Send 5 LinkedIn connection requests to ICs (not managers, not recruiters). Use the IC template (`LINKEDIN_KIT.md`). Goal: 1-2 accept this week.

### Day 4-5 (Tue-Wed) — Public engagement

Comment on 3 posts/day from your target list. Substantive comments only — no "great post 🔥". Quote a specific point, add a counter or extension. **You become familiar in their feed.**

### Day 6 (Thu) — Apply formally

Apply via [careers.google.com](https://careers.google.com) to your top 3 roles. Include:
- Resume link: GitHub Pages URL (not PDF)
- Cover letter: 200 words, mention Genesis + 1 specific Google paper/product/team

### Day 7 (Fri) — Track everything

Open a Google Sheet:
- Column A: Person
- Column B: Role
- Column C: Stage (cold / connected / chatted / referral / applied / interviewing)
- Column D: Last touch date
- Column E: Next action + date

This sheet IS the playbook. Update daily.

---

## Week 2 — Warm conversations

### Goals

- 3 LinkedIn DMs into proper conversation (10+ messages exchanged)
- 1 video call booked with a Googler (informal coffee, 20 min)
- 1 referral hint (someone says "I could potentially refer you")

### How

- For accepted connects from W1: send "I see you work on X. I'm in the autonomous-coder space, built [Genesis]. Would love your perspective for 20 min — I'll send specific questions ahead so we don't waste your time"
- Pre-send 3 thoughtful questions before any call. Shows respect for their time and your prep.

### Output of W2

- Refined cold email tone based on responses
- 1-2 names of recruiters or referrers to reference in W3

---

## Week 3 — Referrals + interview prep

### Referrals

When someone says "I'd refer you", they're being polite. **You** drive the conversion:

1. Send them a clean, structured ask:
   - PDF of your CV (or link)
   - Job IDs of the 2-3 roles you're targeting
   - 3-line pitch ("I'm a self-taught AI engineer, founder of Aureum, building an autonomous coder. Targeting L4 Vertex AI / Gemini Apps")
2. Make the email 30 seconds for them to forward. Subject: "Referral request — Aureum founder, L4 Vertex AI"

### Interview prep

Parallel track. By end of W3:

- 30 LeetCode mediums solved (~10/week average)
- 1 ML system design done out loud (record yourself, listen back)
- 8 STAR behavioral stories practiced

### Public artefact W3

Publish blog post 7 (5-agent pattern) + post 8 (per-PR pricing). Twitter threads.

---

## Week 4 — Application push + first interviews

### Mass apply (informed, not spam)

- Re-apply to L4 roles you targeted W1, **this time with referral** if you got one
- New roles: 5 more relevant Google roles + 5 backup companies (DeepMind, Anthropic, Stripe, Mistral)

### First interviews

If you've done W1-W3 right, you should have 1-3 phone screens by end of W4. These convert at ~50% to onsite.

### Calibration

End-of-W4 honest review:
- How many cold → conversation? Target: 5+
- How many conversation → referral? Target: 2+
- How many referrals → recruiter call? Target: 1+

If below target, the gap is in your message tone, not your portfolio. Workshop with someone who's done this.

---

## Cold email template — for cold-applied roles

> Subject: Genesis founder applying for [Role] — github.com/lexusthunder
>
> Hi [Recruiter],
>
> Applying to [Job ID] today. Brief context:
>
> - I'm the founder of Aureum, building Genesis — an autonomous AI software engineer (same archetype as Cognition Labs / Cursor / Magic.dev)
> - 16 production-style AI/ML projects in my portfolio
> - Built a custom NumPy neural network from scratch + production REST API around it
> - Pivoting into FT AI engineering after running a real product
>
> Portfolio: https://lexusthunder.github.io/aureum-ai-portfolio/
> Genesis: https://github.com/lexusthunder/aureum-ai-portfolio/tree/main/07_Autonomous_AI_Platform/aureum-genesis
>
> Happy to do any take-home, system design, or coding screen at your convenience. Looking forward.
>
> — Alex
> +353 89 483 8780

---

## Cover letter template — for online application

> Dear Hiring Team,
>
> I'm applying for [Role] because [specific reason — a paper from Vertex AI team, a Gemini Apps blog post, etc. — name names].
>
> I'm not a traditional AI engineering candidate. I have a Bachelor's in Pastoral Theology and worked logistics for years before pivoting fully into engineering. What I have instead: a public portfolio of 16 AI/ML projects, including a full-stack SaaS I founded (Aureum CRM) and an autonomous AI software engineer in the same archetype as Cognition Labs (Aureum Genesis).
>
> Genesis is the project I'd open my interview with. It's a 5-agent system with a multi-vendor LLM router, eval-gated prompt changes, sandboxed execution, and a production-ready GitHub PR opener. I'd love to walk through the design choices live.
>
> Why Google specifically: [insert ONE concrete reason — TPU pricing power, Gemini Nano on-device, Vertex AI Endpoints latency profile, etc.]. Generic answers waste your time.
>
> Portfolio: https://lexusthunder.github.io/aureum-ai-portfolio/
>
> — Alex Ureche
> Dublin, Ireland · alex@aureum.ai

---

## Common mistakes to avoid

| Mistake | Why it kills you | Fix |
|---|---|---|
| Applying to 50 roles in a day | Looks desperate; recruiters share blacklists internally | Apply to 3-5/week with intent |
| Generic cover letter ("I'm a hard worker") | Read by no one | Mention 1 specific Google product/paper |
| Asking for "any role" | Signals you don't know what you want | Pick L4 specific function |
| Following up >2× | Annoying | 1 follow-up at day 7, then quiet |
| Hiding the theology degree | Suspect | Lean into the pivot story |

---

## What success looks like by Day 30

- 3-5 phone screens completed
- 1-2 onsite loops in flight
- 30+ LinkedIn conversations active
- Portfolio recognized in your network ("oh, you're the Genesis guy")
- ~50 LeetCode mediums solved
- Pipeline at backup companies (DeepMind, Anthropic, Stripe ML) too — never single-track

---

## What to do if Day 30 is empty

It happens. The fix is rarely "more applications" — it's usually:

1. **Sharpen the wedge** — pick the ONE thing you want to be known for (autonomous coders), say no to everything else for 90 days
2. **Increase signal in public** — do 1 viral-ready post per week (HN, Twitter), not 7 mediocre ones
3. **Get an honest reviewer** — ask a senior eng to review your CV + cold email, take feedback brutally
4. **Reframe the ask** — instead of "looking for L4", say "looking for the team building [specific thing], I'd take L3 if it's that team"

---

## Final note

Google is a marathon, not a sprint. The candidates who get hired aren't always the most technical. They're the ones who're:

- **Visible** (public artefact)
- **Connected** (warm intros)
- **Specific** (know which team, why)
- **Patient** (3-6 month process)

You have visibility. The next 30 days build connection + specificity. Patience is the only thing that's free.

**Good luck. Send updates.**
