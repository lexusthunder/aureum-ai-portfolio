# 3-Month Roadmap → Google AI Engineer interview

> **Start date:** today (April 26, 2026)
> **Target interview window:** late July 2026
> **North star:** turn the existing portfolio into a "yes" signal for a Google AI Engineer recruiter screen.

---

## Daily rhythm (5 days/week)

| Time | Block | Output |
|---|---|---|
| 90 min | **DSA / LeetCode** | 2-3 problems, written solutions in `_interview_prep/leetcode/` |
| 2-3 h | **Portfolio project work** | Commits to GitHub on the active project |
| 60 min | **Reading / theory** | Notes in `_interview_prep/notes/` |
| 30 min | **Mock / behavioral** | STAR stories, system-design flashcards |

Saturday = ship + write blog post · Sunday = rest / light review.

---

## Month 1 — Foundation & strongest project polish (weeks 1–4)

### Week 1 — Audit, polish, publish
- [ ] Push everything in this portfolio to GitHub under `github.com/Aureum` (`_meta/GIT_SETUP.md`)
- [ ] Add green CI badges on `wine-quality-mlflow-e2e` and `agent-pipeline`
- [ ] Clean READMEs, add screenshots / GIFs, link from CV
- [ ] LeetCode: 10 easy + 5 medium (arrays, strings, hashmaps)

### Week 2 — Deepen agent-pipeline
- [ ] Add a **RetrieverAgent** in front of the Researcher (Tavily / Serper API)
- [ ] Add **OpenTelemetry** traces (Jaeger or Cloud Trace)
- [ ] Add **eval harness** — 20 topics, automatic scoring, regression check on prompt changes
- [ ] LeetCode: 10 mediums (trees, recursion)

### Week 3 — RAG project from scratch
- [ ] Build `07_RAG_System` — ingest PDFs of your own theology papers + business books, ask questions
- [ ] Stack: `pgvector` on Supabase, `sentence-transformers/all-MiniLM-L6-v2`, `LangChain` retriever, FastAPI `/ask`
- [ ] Add citations + hallucination detection
- [ ] LeetCode: 10 mediums (graphs, BFS/DFS)

### Week 4 — Computer vision real project
- [ ] Replace the empty `smartvision` with a working **YOLOv8** detector + Streamlit demo
- [ ] Train on a small custom dataset (50 images) — Roboflow for annotation
- [ ] Ship as a Docker image to Hugging Face Spaces
- [ ] LeetCode: 10 mediums (DP intro)

✅ **End of Month 1 deliverable**: 4 portfolio projects with live demos, 35 LeetCode solved, public GitHub.

---

## Month 2 — Depth + cloud + theory (weeks 5–8)

### Week 5 — Fine-tuning
- [ ] Add `08_FineTuning` — LoRA fine-tune `Qwen2.5-1.5B` or `Llama-3.2-1B` on a custom dataset (your own writing style or AgroBot Q&A)
- [ ] Use `peft`, `trl`, `bitsandbytes`, train on Colab T4
- [ ] Push checkpoint to Hugging Face Hub
- [ ] LeetCode: 10 mediums (DP, sliding window)

### Week 6 — Google Cloud deployment
- [ ] Deploy `wine-quality-mlflow-e2e` on **Vertex AI** (custom training job + endpoint)
- [ ] Deploy `agent-pipeline` on **Cloud Run** with `gcloud run deploy`
- [ ] Use **Secret Manager** for the API keys
- [ ] Add cost dashboard on Cloud Monitoring
- [ ] LeetCode: 10 mediums (heaps, intervals)

### Week 7 — System design
- [ ] Read *Designing Machine Learning Systems* (Chip Huyen) chapters 1-7
- [ ] Write 3 system-design docs in `_interview_prep/system_design/`:
  - "Design a YouTube recommendation system"
  - "Design Gmail Smart Compose"
  - "Design a news summarization service for 100M users"
- [ ] LeetCode: 10 mediums (mixed)

### Week 8 — Behavioral + Googleyness
- [ ] Write 12 STAR stories covering: ownership, ambiguity, collaboration, learning from failure, customer focus, technical depth
- [ ] Watch 3 mock Google interviews (Yangshun, Tech Dummies, etc.)
- [ ] Read Google's *re:Work* on Googleyness
- [ ] LeetCode: 10 hards (start)

✅ **End of Month 2 deliverable**: portfolio deployed on GCP, 75 LeetCode solved, 3 system-design docs, 12 STAR stories.

---

## Month 3 — Polish, mock interviews, apply (weeks 9–12)

### Week 9 — Mock coding interviews
- [ ] 5 mock interviews on **interviewing.io** or with peers
- [ ] Focus on the Google bar: clean code, tests-first, communicate trade-offs
- [ ] Re-do every problem you got stuck on the next day

### Week 10 — Mock ML system design + research
- [ ] 3 ML system-design mocks
- [ ] Read 5 Google AI papers and take notes (TPU paper, T5, PaLM-E, Gemini tech report, AlphaCode)
- [ ] Add a `papers_read.md` log to `_interview_prep/`

### Week 11 — Apply
- [ ] Customize CV for **Google AI Engineer / ML Engineer** Dublin and London listings
- [ ] Get referrals via LinkedIn (target Google employees in Dublin who studied at Babeș-Bolyai or Romanian universities)
- [ ] Apply: Google Careers + 5 referrals + 3 backup companies (DeepMind, Anthropic Dublin, Stripe ML, OpenAI Dublin if open, Snowflake ML)
- [ ] Continue 5 LeetCode/day, 1 mock/day

### Week 12 — Final polish + interview week
- [ ] Re-record 3 best project demos as 90-second Loom videos
- [ ] Practice your "tell me about yourself" until it's 90 seconds, conversational, natural
- [ ] Sleep, hydrate, walk before interviews
- [ ] After each round: write what went well + what to fix in `_interview_prep/post_interview.md`

✅ **End of Month 3 deliverable**: 150 LeetCode, 8 mocks done, ≥ 1 Google interview booked.

---

## Reading list (read in order)

1. *Designing Machine Learning Systems* — Chip Huyen
2. *The LLM Engineer's Handbook* — P. Iusztin
3. Google's **MLOps maturity model** whitepaper
4. **Anthropic's "Building effective agents"** post
5. **Google's TPU paper** (ISCA 2017) + **Gemini tech report**
6. *Cracking the Coding Interview* — only the patterns chapter
7. *System Design Interview Vol 1+2* — Alex Xu

---

## Tracking sheet

Use `_interview_prep/progress.csv`:
```
date, leetcode_solved, project_commit, theory_minutes, mock_interview, notes
```

Update daily. If you skip 2 days, course-correct on day 3.

---

## Hard truths

- **The portfolio is the differentiator.** Without 5 great projects on GitHub, the LeetCode score won't save you. With them, even a few wobbles in the live coding round are recoverable.
- **Aureum is your secret weapon.** "I'm building my own AI startup" is the strongest signal a Google interviewer can hear if you can speak to the architecture for 20 minutes credibly.
- **Pivot stories work** if you can show *evidence* of the pivot. This portfolio is that evidence.
