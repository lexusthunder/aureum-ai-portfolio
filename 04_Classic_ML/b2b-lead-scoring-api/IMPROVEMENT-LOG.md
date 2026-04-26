# IMPROVEMENT LOG — Milion Dolar B2B

## 2026-04-11 — CTO Session #2 (Deadline: 2026-04-18)

### Bug Fixes

#### `app/core/config.py` — Deprecated `class Config` (FIX)
- **Problema:** `class Config` in pydantic-settings v2 e deprecated, generează warning la import.
- **Fix:** Migrat la `model_config = SettingsConfigDict(...)`. Adăugat `model_path` setting.

#### `app/routers/leads.py` — Import redundant HTTPException (FIX)
- **Problema:** `from fastapi import HTTPException` importat de 2 ori in interiorul funcțiilor, deși era deja disponibil la top level.
- **Fix:** Mutat import la top level, eliminat importurile duplicate din funcții.

#### `app/models/ml_model.py` — Global random seed side effect (FIX)
- **Problema:** `np.random.seed(42)` seta seed-ul global numpy — afecta TOATE operațiile random din aplicație (inclusiv alte module).
- **Fix:** Înlocuit cu `np.random.default_rng(42)` — generator izolat, fără side effects.

#### `app/main.py` — Deprecated `@app.on_event("startup")` (FIX)
- **Problema:** `on_event` e deprecated in FastAPI recent. Va genera warnings și eventual va fi eliminat.
- **Fix:** Migrat la `lifespan` async context manager (pattern-ul recomandat).

### Features

#### Model Persistence (NEW — prioritate #1 din backlog)
- **Fișier:** `app/models/ml_model.py`
- **Problema:** Modelul se pierdea complet la fiecare restart al serverului. Orice reantrenare via `/train` era temporară.
- **Fix:** Adăugat `pickle.dump()` la save și `pickle.load()` la startup. Flow: startup → try load from disk → if not found, train default → save. Retrain via API salvează automat.
- **Config:** `MODEL_PATH` env var (default: `model.pkl`), gitignored via `*.pkl`.

### Stare Curenta (2026-04-11)
- **API:** Complet funcțional — scoring, training, health check, API key auth
- **Model:** Persistent pe disk (pickle), se reîncarcă la restart
- **Tests:** 7/7 passing
- **Known Issues actualizate:** Model persistence rezolvat. Rămân: rate limiting, normalizare automată, frontend, database, Docker.

---

## 2026-04-06 — Sesiune inițială CTO

### Starea inițială
- Proiect conținea DOAR `main.py` cu o rețea neurală minimală
- Niciun git repo propriu, niciun backend/frontend, niciun API
- Bugs critice: fără epsilon clipping în loss function (risc NaN/inf), inițializare slabă (* 0.01), fără validare input, fără predict() separat

### Bug Fixes Critice

**[FIX] main.py — Loss function NaN/overflow**
- Problemă: `np.log(predictions)` crăpa cu RuntimeWarning sau NaN dacă predictions = 0.0 exactă
- Fix: `predictions = np.clip(predictions, 1e-7, 1 - 1e-7)` înainte de log
- Fișier: `main.py:50`

**[FIX] main.py — Overflow în sigmoid**
- Problemă: `np.exp(-self.z2)` putea face overflow pentru valori mari negative ale z2
- Fix: `np.clip(self.z2, -500, 500)` înainte de sigmoid
- Fișier: `main.py:18`

**[FIX] main.py — Inițializare greșită a greutăților**
- Problemă: `* 0.01` crează gradienți aproape zero pentru activări ReLU (dying ReLU problem)
- Fix: He initialization `* np.sqrt(2.0 / input_size)` — standard pentru ReLU
- Fișier: `main.py:10-11`

**[FIX] main.py — Fără validare input**
- Problemă: Model accepta orice shape fără eroare clară
- Fix: Validare explicită pentru ndim și range în `train()`
- Fișier: `main.py:65-70`

### Features Adăugate

**[FEAT] FastAPI B2B Lead Scoring API**
- `POST /api/v1/leads/score` — scorează 1-1000 lead-uri per request
- `POST /api/v1/leads/train` — reantrenează modelul cu date proprii
- `GET /health` — health check
- Swagger UI la `/docs`

**[FEAT] Autentificare API Key**
- Header `X-API-Key` necesar pentru toate endpointurile protejate
- Configurat din `.env`

**[FEAT] Clasificare hot/warm/cold**
- hot: probabilitate >= 0.7
- warm: 0.4-0.7
- cold: < 0.4

**[FEAT] Tests unitare**
- `tests/test_model.py` cu 7 teste: shape, range, loss decrease, binary output, accuracy, no NaN, input validation

**[FEAT] Structură proiect completă**
- `requirements.txt`, `.env.example`, `.gitignore`, `README.md`

### Known Issues / TODO

- [ ] **Model persistence** — modelul se pierde la restart. De adăugat `pickle.dump()` pe disk + load la startup
- [ ] **Rate limiting** — fără limitare requests, poate fi abuzat
- [ ] **Normalizare automată** — utilizatorul trebuie să normalizeze manual features (0-1). De adăugat StandardScaler/MinMaxScaler
- [ ] **Frontend** — nu există UI. De construit dashboard React cu form de scoring
- [ ] **Database** — lead-urile nu sunt salvate. De adăugat SQLite/PostgreSQL
- [ ] **Metrics endpoint** — nu există /metrics pentru monitoring
- [ ] **Docker** — nu există Dockerfile pentru deploy facil
- [ ] **Regularizare L2** — modelul poate overfit pe dataset-uri mici

### Prioritate pentru deadline 18 Apr 2026

1. **Model persistence** (critic — altfel modelul reantrenat se pierde)
2. **Frontend minim** (pentru demo)
3. **Docker** (pentru deploy)
4. **Database pentru leads** (pentru MVP)
