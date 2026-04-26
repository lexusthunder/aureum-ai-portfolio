# Improvement Log

## 2026-04-11 — CTO Session #2 (Deadline: 2026-04-18)

### Bug Fixes

#### `app.py` — Model reloaded from disk on every request (FIX)
- **Problema:** `PredictionPipeline()` era instanțiat în handler-ul `/predict` — fiecare request citea `config.yaml`, deschidea fișierul pickle, deserializa modelul. Pe trafic real, I/O disk devine bottleneck.
- **Fix:** Model încărcat o singură dată la startup (`_pipeline = PredictionPipeline()` la nivel de modul). Reîncărcat doar după retraining.

#### `app.py` — `/train` endpoint era GET fără autentificare (FIX)
- **Problema:** Training-ul (operație cu side effects masive) era expus ca GET — bots, prefetch-uri, crawlers puteau declanșa retraining accidental. Zero autentificare.
- **Fix:** Schimbat la POST, adăugat validare `X-API-Key` header contra `TRAIN_API_KEY` env var. Adăugat `timeout=600` la subprocess pentru a preveni hang-ul infinit.

#### `app.py` — Flask-Cors importat dar nu necesar (FIX)
- **Problema:** `from flask_cors import CORS` + `CORS(app)` adăuga header-ul `Access-Control-Allow-Origin: *` pe toate răspunsurile — nu e necesar dacă frontend-ul e servit de aceeași aplicație Flask.
- **Fix:** Eliminat CORS middleware. Poate fi readăugat dacă se servește un SPA separat.

#### `prediction_pipeline.py` — Config key greșit (FIX)
- **Problema:** Citea `config["model_evaluation"]["model_path"]` în loc de `config["model_trainer"]["model_path"]`. Funcționa prin coincidență (ambele au aceeași cale), dar semantic greșit — modelul e produs de trainer, nu de evaluation.
- **Fix:** Schimbat la `config["model_trainer"]["model_path"]`. Cleanup import duplicat.

### Stare Curentă (2026-04-11)
- **Pipeline:** 5 stages complet funcționale (ingestion → validation → transformation → training → evaluation)
- **API:** Flask cu `/predict` (POST), `/train` (POST, autentificat), `/` (form)
- **MLflow:** Integrare completă cu logging params/metrics/model
- **CI/CD:** GitHub Actions + Dockerfile
- **Known Issues:** `mlflow==2.2.2` e vechi dar stabil; de actualizat la nevoie. No unit tests for Flask routes.

---

## 2026-04-06 — Full Pipeline Implementation (CTO Review)

### Critical Fixes

- **schema.yaml corrected**: Original schema defined `age`, `gender`, `income`, `spending_score` which did not match the actual wine quality dataset (`fixed acidity`, `volatile acidity`, ... `quality`). Updated to match the real data source.
- **config.yaml fixed**: `data_transformation` section had a single `transformed_data_path`; pipeline required separate `transformed_train_path` and `transformed_test_path` for proper train/test split handling.

### Incomplete Features Completed

| Component | Status Before | Status After |
|---|---|---|
| `DataValidation` | Missing | Implemented — validates schema columns, writes status file |
| `DataTransformation` | Missing | Implemented — 80/20 train/test split, saves CSV artifacts |
| `ModelTrainer` | Missing | Implemented — ElasticNet regression, serializes `model.pkl` |
| `ModelEvaluation` | Missing | Implemented — RMSE/MAE/R² metrics + MLflow experiment logging |
| Pipeline stages (01–05) | Missing | All 5 stage runner files created |
| `PredictionPipeline` | Missing | Created — used by Flask app for inference |
| `main.py` | Only ingestion | Orchestrates all 5 stages in sequence |
| `app.py` | Empty | Flask REST API with `/`, `/predict`, `/train` endpoints |
| `templates/index.html` | Empty | Responsive web form for wine quality prediction |
| `Dockerfile` | Empty | Python 3.10-slim image, installs deps, exposes port 8080 |
| `.github/workflows/github.yaml` | Empty | CI: run pipeline; CD: build + push Docker image |

### Configuration Manager Improvements

- `ConfigurationManager` now accepts `schema_filepath` parameter and loads all 3 YAML files.
- `get_model_evaluation_config()` reads `MLFLOW_TRACKING_URI` from environment (CI-safe: empty string disables remote tracking).
- All entity dataclasses (`DataValidationConfig`, `DataTransformationConfig`, `ModelTrainerConfig`, `ModelEvaluationConfig`) added as frozen dataclasses.

### Security / Robustness

- MLflow URI can be overridden via `MLFLOW_TRACKING_URI` env var — no credentials in source code.
- `app.py` validates all required feature fields before inference; returns structured JSON errors.
- Dockerfile uses `--no-cache-dir` to minimize image size.

### Architecture Decisions

- **ElasticNet** selected as the model (params `alpha` + `l1_ratio` were already in `params.yaml`; this confirms the intended algorithm despite `model_name: LinearRegression` label in params).
- **No preprocessing/scaling** added intentionally: wine quality dataset from Krish's tutorial is used raw; scaling can be added as a follow-up if metrics are unsatisfactory.
- **`/train` endpoint** uses subprocess to re-run `main.py` — this is a dev convenience. For production, replace with a proper task queue (Celery/RQ).
