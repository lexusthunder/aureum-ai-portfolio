# Aureum AI Portfolio

[![🚀 Live Demo on Hugging Face](https://img.shields.io/badge/🚀_Live_Demo-Crop_Recommendation_AI-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/spaces/alexai888/crop-recommendation)

![Python](https://img.shields.io/badge/python-3.11-blue?logo=python) ![Claude](https://img.shields.io/badge/LLM-Claude_API-D97757) ![FastAPI](https://img.shields.io/badge/FastAPI-Pydantic_v2-009688?logo=fastapi) ![MLflow](https://img.shields.io/badge/MLOps-MLflow-0194E2) ![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker) ![Gradio](https://img.shields.io/badge/Gradio-UI-orange?logo=gradio) ![React_Native](https://img.shields.io/badge/React_Native-Expo-61DAFB?logo=react) ![Status](https://img.shields.io/badge/status-Active_Development-success)

> **Ureche Ionel Alexandru** — AI Engineer Portfolio
> Targeted at: Google AI Engineer / ML Engineer roles
> Location: Balbriggan, Co. Dublin, Ireland
> Contact: urecheionelalexandru@gmail.com
>
> 👉 **For recruiters:** see [`_meta/HOW_RECRUITERS_EVALUATE.md`](./_meta/HOW_RECRUITERS_EVALUATE.md) — a 30-second guide to scanning this repo.

---

## Why this portfolio

This repository is a curated, production-style portfolio that demonstrates breadth across the modern AI Engineer stack: LLM-based multi-agent systems, MLOps end-to-end pipelines, computer vision, classical ML, mobile AI, and full-stack AI products. Each project is self-contained, has its own README with architecture and "what this proves", and is reproducible from a single `pip install` and `python main.py`.

## Tech stack at a glance

| Area | Technologies |
|---|---|
| **LLMs / Agents** | Anthropic Claude API, multi-agent orchestration, Pydantic schemas, Gradio, Speech-to-Text, Text-to-Speech |
| **ML / DL** | scikit-learn, TensorFlow, PyTorch, RandomForest, ElasticNet |
| **MLOps** | MLflow, Docker, GitHub Actions CI/CD, DagsHub, Flask serving |
| **Data** | pandas, NumPy, Pillow, schema validation (YAML) |
| **Backend** | Python (FastAPI / Flask), Supabase, SQLite, REST APIs |
| **Frontend / Mobile** | React, React Native (Expo), TypeScript, iOS deployment |
| **Cloud / Infra** | Docker, GitHub Actions, environment-driven config |

## Portfolio map

| # | Project | Stack | What it proves |
|---|---|---|---|
| 01 | [agent-pipeline](./01_LLM_Agents/agent-pipeline) | Claude API · Pydantic v2 · Rich logging | Multi-agent orchestration with revision loops & quality gating |
| 01 | [multimodal-agent-agrobot](./01_LLM_Agents/multimodal-agent-agrobot) | Gradio · STT · TTS · RandomForest | Multimodal agent (image + voice + text) + IoT ML |
| 02 | [wine-quality-mlflow-e2e](./02_MLOps/wine-quality-mlflow-e2e) | MLflow · Flask · Docker · GH Actions | End-to-end MLOps with experiment tracking, REST serving, CI/CD |
| 03 | [smartvision](./03_Computer_Vision_IoT/smartvision) | OpenCV · Python | Computer vision prototype |
| 03 | [smart-irrigation-iot](./03_Computer_Vision_IoT/smart-irrigation-iot) | Sensors + ML | IoT ML inference for precision agriculture |
| 04 | [cinemacritic-ai](./04_Classic_ML/cinemacritic-ai) | scikit-learn · pyproject | Clean Python packaging + ML scaffold |
| 04 | [agricultural-ml](./04_Classic_ML/agricultural-ml) | scikit-learn · Jupyter | Crop / yield ML model |
| 04 | [b2b-lead-scoring-api](./04_Classic_ML/b2b-lead-scoring-api) | **NumPy NN from scratch** · FastAPI · pytest | Custom neural network + production REST API + auth |
| 04 | [crop-recommendation-gradio](./04_Classic_ML/crop-recommendation-gradio) 🚀 [LIVE](https://huggingface.co/spaces/alexai888/crop-recommendation) | scikit-learn · Gradio · real dataset | RandomForest + Gradio web UI — **deployed on HF Spaces** |
| 04 | [sda-ml-pipeline](./04_Classic_ML/sda-ml-pipeline) | src/ layout · pytest | Production-style Python ML scaffold |
| 05 | [calori-ai](./05_Mobile_AI/calori-ai) | React Native · Expo · TypeScript | Mobile AI app for nutrition tracking |
| 06 | [aureum-crm](./06_Full_Stack_AI_Product/aureum-crm) | FastAPI · Supabase · iOS · AI routes | Full-stack AI-powered B2B product (own startup) |

## Highlight: Aureum CRM

Aureum CRM is my own product — a real-estate / B2B CRM with AI-powered routes (`ai_routes.py`), Supabase backend, an iOS launcher, and a 50KB+ FastAPI backend. It is a real product, not a tutorial — see `06_Full_Stack_AI_Product/aureum-crm/`.

## Highlight: Multi-agent Claude pipeline

`agent-pipeline` runs **4 specialized Claude agents** (Researcher → Analyzer → Writer → Critic) with a **revision loop** that re-drafts until the Critic scores ≥ 7/10. This is the same pattern used by production research / report agents at top labs. See `01_LLM_Agents/agent-pipeline/`.

## Highlight: End-to-end MLOps

`wine-quality-mlflow-e2e` walks data through 5 pipeline stages (ingestion → validation → transformation → training → evaluation), tracks every run in MLflow, serves predictions via Flask, ships in Docker, and re-trains on every push to `main` via GitHub Actions. See `02_MLOps/wine-quality-mlflow-e2e/`.

## Repo structure

```
Aureum-AI-Portfolio/
├── README.md                 ← you are here
├── CV.md                     ← also see _cv/ for .docx version
├── 01_LLM_Agents/
├── 02_MLOps/
├── 03_Computer_Vision_IoT/
├── 04_Classic_ML/
├── 05_Mobile_AI/
├── 06_Full_Stack_AI_Product/
├── _cv/                      ← CV (Word + Markdown)
├── _interview_prep/          ← 3-month roadmap to Google
└── _meta/                    ← contributing, git setup, etc.
```

## How to run any project

Every project is reproducible in 3 commands:

```bash
cd <project-folder>
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

API keys (Anthropic, etc.) are read from `.env` — copy `.env.example` to `.env` and fill in your own.

## License

MIT — see individual project folders for upstream licenses (LTX-Video, BAGEL, etc. are upstream OSS that I have studied and built on; my own code is MIT).

## Contact

- Email: urecheionelalexandru@gmail.com
- Phone: +353 89 483 8780
- Location: Balbriggan, Co. Dublin, Ireland
- GitHub: _to be created — see `_meta/GIT_SETUP.md`_
- Portfolio brand: **Aureum**
