import mlflow
import mlflow.sklearn
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from urllib.parse import urlparse

from src.mlproject.components import logger
from src.mlproject.entity import ModelEvaluationConfig
from src.mlproject.utils.common import load_model, save_json


def _eval_metrics(actual, predicted) -> dict:
    rmse = float(np.sqrt(mean_squared_error(actual, predicted)))
    mae = float(mean_absolute_error(actual, predicted))
    r2 = float(r2_score(actual, predicted))
    return {"rmse": rmse, "mae": mae, "r2": r2}


class ModelEvaluation:
    """Evaluates the trained model and logs results to MLflow."""

    def __init__(self, config: ModelEvaluationConfig):
        self.config = config

    def log_into_mlflow(self):
        test_df = pd.read_csv(self.config.test_data_path)
        model = load_model(self.config.model_path)

        X_test = test_df.drop(columns=[self.config.target_column])
        y_test = test_df[self.config.target_column]

        if self.config.mlflow_uri:
            mlflow.set_tracking_uri(self.config.mlflow_uri)

        tracking_url_type_store = urlparse(mlflow.get_tracking_uri()).scheme

        with mlflow.start_run():
            predictions = model.predict(X_test)
            metrics = _eval_metrics(y_test, predictions)

            logger.info("Evaluation metrics: %s", metrics)
            save_json(self.config.metric_file_name, metrics)

            mlflow.log_params({"alpha": self.config.alpha, "l1_ratio": self.config.l1_ratio})
            mlflow.log_metrics(metrics)

            # File-store backends don't support model registry
            if tracking_url_type_store != "file":
                mlflow.sklearn.log_model(model, "model", registered_model_name="ElasticNetWineModel")
            else:
                mlflow.sklearn.log_model(model, "model")

    def initiate_model_evaluation(self):
        self.log_into_mlflow()
