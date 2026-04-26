# Google AI Engineer — Interview Playbook

## The 5 rounds you'll face

| Round | What | How to prep |
|---|---|---|
| **1. Recruiter screen** (30 min) | Background, why Google, basic CS fundamentals | Tighten the 90-sec elevator pitch + know your CV cold |
| **2. Technical phone screen** (45 min) | 1 LeetCode medium, mostly DSA | Solve 100+ mediums, narrate while coding |
| **3. Coding onsite × 2** (45 min each) | 1 medium + 1 hard | Practice with a timer, talk through trade-offs |
| **4. ML system design** (60 min) | Open-ended ML problem | Practice 10 designs, follow the Chip Huyen template |
| **5. Behavioral / Googleyness** (45 min) | STAR stories | 12 prepared stories, ≤ 2 minutes each |

## ML system design template (use every time)

1. **Clarify the problem** — who's the user? what's the metric? what's online vs. offline?
2. **Frame as ML** — supervised? ranking? generative? what's the label?
3. **Data** — sources, volume, freshness, labeling, biases
4. **Features** — categorical, numerical, embeddings, freshness
5. **Model** — start with the simplest baseline, then a stronger candidate
6. **Training** — data split, validation, sampling, hyperparameter strategy
7. **Serving** — latency budget, batch vs. online, hardware (CPU/GPU/TPU)
8. **Monitoring** — drift, feedback loops, A/B, alerting
9. **Trade-offs** — quality vs. cost vs. latency
10. **Scale** — what changes at 10× and 100×

## Behavioral — the 12 STAR stories you must have ready

Make sure each of these has a story (≤ 2 minutes, S-T-A-R):
1. A time you took ownership of something outside your remit → **Aureum CRM**
2. A time you learned a new tech fast → MLflow + Docker in `02_MLOps`
3. A time you handled ambiguity → designing the agent revision loop
4. A failure you learned from → first version of `multimodal-agent-agrobot`
5. A conflict you resolved
6. A decision with incomplete information → choosing ElasticNet vs. XGBoost
7. The most technically complex thing you've built → the 4-agent pipeline
8. A time you simplified something
9. A time you helped someone else
10. A time you went above and beyond
11. Why Google specifically (be specific about a team / paper / product)
12. Where you'll be in 5 years

## Non-negotiables before applying

- [ ] All 10 portfolio projects pushed to public GitHub
- [ ] CV trimmed to 1 page (`_cv/CV.md`)
- [ ] LinkedIn matches CV
- [ ] Pinned repos = 4 strongest projects
- [ ] At least 1 project deployed live (Vertex AI / Cloud Run / HF Spaces)
- [ ] 100+ LeetCode mediums solved
- [ ] 12 STAR stories written
- [ ] 1 referral request sent
