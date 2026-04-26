# Milion Dolar B2B — Lead Scoring API

API de scoring lead-uri B2B bazat pe rețele neurale. Trimite features despre un prospect și primești probabilitatea de conversie + clasificare hot/warm/cold.

## Quick Start

### 1. Instalează dependențele
```bash
pip install -r requirements.txt
```

### 2. Configurează env
```bash
cp .env.example .env
# Editează .env — schimbă API_KEY
```

### 3. Pornește serverul
```bash
uvicorn app.main:app --reload
```

Deschide: http://localhost:8000/docs — Swagger UI complet.

---

## Endpoints

| Method | Path | Descriere |
|--------|------|-----------|
| GET | `/health` | Health check |
| POST | `/api/v1/leads/score` | Scorează lead-uri B2B |
| POST | `/api/v1/leads/train` | Reantrenează modelul |

**Autentificare:** Header `X-API-Key: <valoarea din .env>`

---

## Exemplu — Score Lead

```bash
curl -X POST http://localhost:8000/api/v1/leads/score \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-change-in-production" \
  -d '{
    "leads": [
      {
        "company_size": 0.9,
        "budget": 0.8,
        "engagement_score": 0.7,
        "industry_match": 1.0,
        "decision_maker_contact": 1.0
      }
    ],
    "threshold": 0.5
  }'
```

**Răspuns:**
```json
{
  "total_leads": 1,
  "hot_leads": 1,
  "warm_leads": 0,
  "cold_leads": 0,
  "results": [
    {
      "index": 0,
      "probability": 0.8742,
      "label": 1,
      "category": "hot"
    }
  ]
}
```

---

## Features Model

| Feature | Tip | Descriere |
|---------|-----|-----------|
| `company_size` | float [0-1] | Dimensiunea companiei (0=micro, 1=enterprise) |
| `budget` | float [0-1] | Buget estimat disponibil |
| `engagement_score` | float [0-1] | Scor interacțiune (demo, emailuri, vizite) |
| `industry_match` | float [0-1] | Potrivire cu industria țintă |
| `decision_maker_contact` | float [0-1] | Contact direct cu factorul decizional |

---

## Rulează Tests

```bash
pytest tests/ -v
```

---

## Arhitectură

```
milion dolar b2b/
├── main.py                   # B2BLeadScoringModel (rețea neurală NumPy)
├── app/
│   ├── main.py               # FastAPI app factory
│   ├── core/
│   │   ├── config.py         # Settings din .env
│   │   └── security.py       # API Key auth
│   ├── models/
│   │   └── ml_model.py       # Singleton model + retrain
│   ├── routers/
│   │   ├── health.py         # /health endpoint
│   │   └── leads.py          # /leads/score, /leads/train
│   └── schemas/
│       └── lead.py           # Pydantic schemas
├── tests/
│   └── test_model.py         # Unit tests model
├── requirements.txt
├── .env.example
└── .gitignore
```

## Deploy (Railway / Render)

1. Push pe GitHub
2. New Project → Deploy from GitHub
3. Set `API_KEY` în environment variables
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Tehnologii

- **ML:** NumPy (rețea neurală custom, fără dependențe grele)
- **API:** FastAPI + Pydantic v2
- **Auth:** API Key header
- **Deploy:** Railway / Render / orice VPS
