# End-to-End Wine Quality Prediction with MLflow

An end-to-end ML project built on the Krish Naik tutorial scaffold. Predicts wine quality (0–10) from physicochemical properties using an **ElasticNet** regression model, with full MLflow experiment tracking.

## Architecture

```
Data Ingestion → Data Validation → Data Transformation → Model Training → Model Evaluation
                                                                              ↓
                                                                        MLflow Tracking
                                                                              ↓
                                                                       Flask REST API
```

## Pipeline Stages

| Stage | Component | Description |
|---|---|---|
| 1 | `DataIngestion` | Downloads the wine CSV from GitHub |
| 2 | `DataValidation` | Validates column schema against `schema.yaml` |
| 3 | `DataTransformation` | Train/test split (80/20) |
| 4 | `ModelTrainer` | Trains ElasticNet; saves `model.pkl` |
| 5 | `ModelEvaluation` | RMSE / MAE / R² metrics; logs to MLflow |

## Quick Start

```bash
# 1. Create environment
python -m venv venv && source venv/bin/activate

# 2. Install dependencies
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install -e .

# 3. Run full training pipeline
python main.py

# 4. Launch Flask prediction API
python app.py
# → http://localhost:8080
```

## MLflow Tracking

```bash
# View runs locally
mlflow ui --port 5000
```

Remote tracking is configured via the `MLFLOW_TRACKING_URI` environment variable (defaults to `config/config.yaml`).

```bash
export MLFLOW_TRACKING_URI=https://dagshub.com/<user>/End-to-end-ML-Project-with-MLflow.mlflow
export MLFLOW_TRACKING_USERNAME=<username>
export MLFLOW_TRACKING_PASSWORD=<token>
python main.py
```

## REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Web UI |
| POST | `/predict` | JSON prediction |
| GET | `/train` | Re-run training pipeline |

### Predict (curl)

```bash
curl -X POST http://localhost:8080/predict \
  -H "Content-Type: application/json" \
  -d '{
    "fixed acidity": 7.4,
    "volatile acidity": 0.70,
    "citric acid": 0.00,
    "residual sugar": 1.9,
    "chlorides": 0.076,
    "free sulfur dioxide": 11,
    "total sulfur dioxide": 34,
    "density": 0.9978,
    "pH": 3.51,
    "sulphates": 0.56,
    "alcohol": 9.4
  }'
```

## Docker

```bash
docker build -t wine-quality-mlflow .
docker run -p 8080:8080 wine-quality-mlflow
```

## CI/CD

GitHub Actions runs on every push to `main`:
1. Installs deps and executes the full training pipeline
2. Builds and pushes a Docker image to Docker Hub (requires `DOCKER_USERNAME` / `DOCKER_PASSWORD` secrets)

## Configuration

| File | Purpose |
|---|---|
| `config/config.yaml` | Artifact paths, URLs, MLflow URI |
| `params.yaml` | Hyperparameters (`alpha`, `l1_ratio`, `max_iter`) |
| `schema.yaml` | Expected columns and target variable |

## Project Structure

```
.
├── src/mlproject/
│   ├── components/        # DataIngestion, DataValidation, DataTransformation, ModelTrainer, ModelEvaluation
│   ├── config/            # ConfigurationManager
│   ├── constants/         # File path constants
│   ├── entity/            # Frozen dataclasses for all configs
│   ├── pipeline/          # Stage runners + PredictionPipeline
│   └── utils/             # read_yaml, save_json, save/load_model, create_directories
├── config/config.yaml
├── params.yaml
├── schema.yaml
├── main.py                # Orchestrates all pipeline stages
├── app.py                 # Flask inference API
├── Dockerfile
└── .github/workflows/github.yaml
```
