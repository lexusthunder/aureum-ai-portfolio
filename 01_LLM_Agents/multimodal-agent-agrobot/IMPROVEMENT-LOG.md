# IMPROVEMENT-LOG — Proiect SDA Competiție AI

---

## Sesiunea 3 — 2026-04-11 (CTO Session #2, Deadline: 2026-04-18)

### Bug Fixes

#### Eliminat `agrobot/agrobot.py/` — director stale cu cod mort (FIX)
- **Problema:** Un director numit `agrobot.py` (!) conținea un fișier `agrobot.py` — codul original cu `joblib.load("models/model.pkl")` hardcoded (path relativ care crapă din alt working directory). Acest cod era complet înlocuit de `src/predict.py` + `main.py` în Sesiunea 2, dar nu a fost eliminat.
- **Fix:** Eliminat directorul complet. Codul activ rămâne în `agrobot/src/` și `agrobot/main.py`.

#### `agrobot/app.py` — Gradio `theme`/`css` în loc greșit (FIX)
- **Problema:** `theme` și `css` erau pasate la `demo.launch()` — deprecated/ignorat în Gradio 4+. Tema nu se aplica corect.
- **Fix:** Mutat `theme` și `css` în constructorul `gr.Blocks()` unde sunt suportate.

#### `agrobot/requirements.txt` — Pip freeze bloat (FIX)
- **Problema:** Fișierul era un pip freeze complet (kaggle, bleach, protobuf, etc.) — dependențe irelevante pentru AgroBot. Root `requirements.txt` era corect.
- **Fix:** Redus la 5 dependențe reale: numpy, pandas, scikit-learn, joblib, gradio.

### Stare Curentă (2026-04-11)
- **AgroBot:** Funcțional — antrenare, predicție, Gradio UI cu scenarii demo
- **Agent Multimodal:** Funcțional — analiză imagine, transcriere voce, TTS
- **Model:** RandomForest 96% accuracy pe date sintetice
- **Cod curat:** Nu mai există fișiere/directoare stale

---

## Sesiunea 2 — 2026-04-06 (CTO Review)

### Bug-uri critice fixate

| # | Bug | Fix |
|---|-----|-----|
| 1 | `agrobot/agrobot.py/agrobot.py` importa din `src.train_model` și `src.predict` — module inexistente | Creare completă `agrobot/src/train_model.py` + `agrobot/src/predict.py` |
| 2 | `openai_agent/agent_core.py` conținea interfața Gradio cu `from agent_core import multimodal_ai` → import circular fatal | Separare: `agent_core.py` = logică, `main.py` = interfață Gradio |
| 3 | Proiectul nu avea git repo propriu | `git init` + `.gitignore` configurate |

### Features completate

- **AgroBot `src/train_model.py`**: Generare date IoT sintetice (1000 eșantioane), antrenare RandomForest cu stratify, evaluare cu classification_report, salvare model la `models/model.pkl`
- **AgroBot `src/predict.py`**: Model încărcat lazy (singleton), path robust relativ la `__file__`, mesaje cu emoji
- **AgroBot `main.py`**: 5 scenarii IoT demonstrative, output clar
- **Agent multimodal `agent_core.py`**: Funcție `multimodal_ai(image, audio, text)` completă cu:
  - Analiză imagine: luminozitate, culori dominante (R/G/B), dimensiuni
  - Adnotare imagine cu PIL
  - Transcriere voce (Google STT, fallback graceful)
  - Generare răspuns contextual
  - TTS (gTTS → fallback macOS `say`)
- **`openai_agent/main.py`**: Interfață Gradio curată, fără import circular

### Metrici model AgroBot

- Acuratețe: **96.00%**
- Precision "Irigare": 94%
- Recall "Irigare": 71%
- F1 "Nu iriga": 98%

### Structura finală

```
proiect sda copetitie pe ai/
├── .gitignore
├── README.md
├── requirements.txt
├── IMPROVEMENT-LOG.md
├── agrobot/
│   ├── main.py            ← CREAT (entry point complet)
│   └── src/
│       ├── __init__.py    ← CREAT
│       ├── train_model.py ← CREAT (training complet)
│       └── predict.py     ← CREAT (predicție robustă)
└── openai_agent/
    ├── agent_core.py      ← RESCRIS (funcție multimodal_ai completă)
    └── main.py            ← CREAT (UI Gradio fără import circular)
```

### Issues cunoscute / Next steps

- [ ] Date IoT sintetice → integrate cu senzori reali (DHT22, capacitive soil sensor)
- [ ] Model multimodal → poate fi îmbunătățit cu un model vision real (CLIP, LLaVA)
- [ ] Adăugat Gradio pentru AgroBot (interfață web vizuală)
- [ ] Unit tests pentru funcțiile de predicție

---

## Sesiunea 1 — Anterioare (din git history home)

- Initial commit FastAPI + React frontend (proiect CaloriAI)
- Fix API failures, error handling
