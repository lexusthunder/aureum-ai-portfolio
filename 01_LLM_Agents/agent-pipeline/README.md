# Agent Pipeline — Business Research Report Generator

A multi-agent pipeline that uses **4 Claude claude-sonnet-4-6 agents** working in sequence to produce
a professional business research report from a single topic string.

## Architecture

```
USER INPUT (topic)
      │
      ▼
┌─────────────┐     ResearchBrief
│  RESEARCHER │ ──────────────────►
│  (blue)     │                    │
└─────────────┘                    ▼
                            ┌─────────────┐     AnalysisReport
                            │   ANALYZER  │ ─────────────────►
                            │   (green)   │                   │
                            └─────────────┘                   ▼
                                                       ┌─────────────┐
                                                       │    WRITER   │◄─────┐
                                                       │   (yellow)  │      │ revision
                                                       └──────┬──────┘      │ loop
                                                              │ DraftReport  │
                                                              ▼              │
                                                       ┌─────────────┐      │
                                                       │    CRITIC   │──────┘
                                                       │    (red)    │ score < 7
                                                       └──────┬──────┘
                                                              │ score >= 7
                                                              ▼
                                                         output/*.md
```

## Agents

| Agent | Color | Role | Output |
|-------|-------|------|--------|
| Researcher | 🔵 Blue | Generates 5 critical research questions, identifies stakeholders & trends | `ResearchBrief` |
| Analyzer | 🟢 Green | Deep-dives each question, builds SWOT, ranks opportunities | `AnalysisReport` |
| Writer | 🟡 Yellow | Writes a 2000+ word structured professional report | `DraftReport` |
| Critic | 🔴 Red | Scores accuracy/completeness/actionability (1-10), triggers revision loop | `CriticFeedback` |

## Setup

```bash
cd agent-pipeline

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure API key
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY
```

## Usage

```bash
# Interactive (prompts for topic)
python main.py

# Direct topic via CLI flag
python main.py --topic "AI SaaS market in Dublin 2026"
```

## Example Output

```
⚡ Business Research Report Pipeline
Powered by 4 Claude claude-sonnet-4-6 agents working in sequence

Enter research topic: AI SaaS market in Dublin 2026

[10:23:01] 🔍 [RESEARCHER]  Starting research on topic: 'AI SaaS market in Dublin 2026'
[10:23:01] 🔍 [RESEARCHER]  Formulating critical research questions…
[10:23:01] 🔍 [RESEARCHER]  Calling Claude API (attempt 1/3)…
[10:23:08] 🔍 [RESEARCHER]  ✅ Research brief created — 5 questions generated
...
[10:23:45] 🎯 [CRITIC]      ✅ Report APPROVED with score 8/10

✅  Pipeline Complete!
Report:       AI SaaS Market in Dublin 2026: A Strategic Analysis
Critic Score: 8/10
Iterations:   1
Word Count:   ~2,847 words
Saved to:     output/20260321_102345_ai-saas-market-in-dublin-2026.md
```

## Report Structure

Every generated report contains:

1. **Executive Summary** — critical findings & business implications
2. **Market Overview** — size, geography, key players, current state
3. **Key Findings** — 5-7 numbered findings with supporting evidence
4. **Opportunities** — strategic opportunities with entry strategies
5. **Risks & Challenges** — regulatory, competitive, technical, macro risks
6. **Strategic Recommendations** — 4-5 prioritized, actionable recommendations
7. **Conclusion** — investment/strategic thesis summary

## Configuration

| Setting | Location | Default |
|---------|----------|---------|
| Max revision loops | `main.py` → `MAX_REVISION_LOOPS` | `3` |
| Approval threshold | `agents/critic.py` → `APPROVAL_THRESHOLD` | `7` |
| Claude model | `agents/*.py` → `MODEL` | `claude-sonnet-4-6` |
| API retries | `agents/*.py` → `MAX_RETRIES` | `3` |

## Project Structure

```
agent-pipeline/
├── main.py              # Orchestrator
├── agents/
│   ├── researcher.py    # Agent 1
│   ├── analyzer.py      # Agent 2
│   ├── writer.py        # Agent 3
│   └── critic.py        # Agent 4
├── models/
│   └── schemas.py       # Pydantic v2 models
├── utils/
│   └── logger.py        # Rich colored terminal logging
├── output/              # Generated reports (markdown)
├── requirements.txt
└── .env.example
```
