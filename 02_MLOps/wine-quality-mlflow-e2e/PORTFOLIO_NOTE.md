# Portfolio Note — Wine Quality MLOps E2E

## What it is

A complete MLOps reference implementation: data → trained model → tracked experiment → REST API → containerized service → CI/CD. Predicts wine quality (0-10) from 11 physicochemical features using ElasticNet regression.

## Why it matters for a Google AI Engineer interview

- **Real MLOps**, not a notebook. Every stage (`DataIngestion`, `DataValidation`, `DataTransformation`, `ModelTrainer`, `ModelEvaluation`) is its own component with frozen-dataclass config and is independently runnable.
- **MLflow tracking** — every run logs RMSE / MAE / R² + hyperparameters + artifacts. Can be pointed at a remote DagsHub server with three env vars.
- **Schema validation** — `schema.yaml` is checked at ingestion time so bad data fails fast.
- **REST serving** — Flask `POST /predict` endpoint accepts JSON, returns prediction. Same model loaded from `model.pkl` for inference and from MLflow for experiment comparison.
- **CI/CD** — GitHub Actions runs the full pipeline on every push to `main` and ships a Docker image.

## Tech stack

`Python` · `scikit-learn (ElasticNet)` · `MLflow` · `Flask` · `Docker` · `GitHub Actions` · `pandas` · `PyYAML`

## Architecture

```
Data Ingestion → Data Validation → Transformation → Model Training → Model Evaluation
                                                                          │
                                                                          ▼
                                                                   MLflow Tracking
                                                                          │
                                                                          ▼
                                                                  Flask REST API
                                                                          │
                                                                          ▼
                                                                  Docker container
                                                                          │
                                                                          ▼
                                                              GitHub Actions CI/CD
```

## How to run

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt && pip install -e .
python main.py            # full training pipeline
python app.py             # serve at http://localhost:8080
mlflow ui --port 5000     # browse experiments
```

## What I would extend

- Swap ElasticNet for XGBoost + Optuna sweep, log all trials to MLflow
- Add a Vertex AI Pipelines wrapper so the same DAG runs on GCP
- Add data-drift monitoring with Evidently and a Cloud Function alert
- Add canary deploys and shadow traffic via Vertex AI Endpoints
