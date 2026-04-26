import os
from pathlib import Path

from src.mlproject.components import logger
from src.mlproject.constants import CONFIG_FILE_PATH, PARAMS_FILE_PATH, SCHEMA_FILE_PATH
from src.mlproject.entity import (
    DataIngestionConfig,
    DataValidationConfig,
    DataTransformationConfig,
    ModelTrainerConfig,
    ModelEvaluationConfig,
)
from src.mlproject.utils.common import create_directories, read_yaml


class ConfigurationManager:
    """Central access point for configuration sections defined in YAML files."""

    def __init__(
        self,
        config_filepath: Path = CONFIG_FILE_PATH,
        params_filepath: Path = PARAMS_FILE_PATH,
        schema_filepath: Path = SCHEMA_FILE_PATH,
    ):
        logger.info("Initializing ConfigurationManager.")
        self.config = read_yaml(config_filepath)
        self.params = read_yaml(params_filepath)
        self.schema = read_yaml(schema_filepath)

        create_directories([self.config["artifacts_root"]])

    # ------------------------------------------------------------------
    # Data Ingestion
    # ------------------------------------------------------------------
    def get_data_ingestion_config(self) -> DataIngestionConfig:
        logger.info("Loading DataIngestion configuration.")
        config = self.config["data_ingestion"]
        create_directories([config["root_dir"]])
        return DataIngestionConfig(
            root_dir=Path(config["root_dir"]),
            source_URL=config["source_URL"],
            local_data_file=Path(config["local_data_file"]),
            unzip_dir=Path(config["unzip_dir"]),
        )

    # ------------------------------------------------------------------
    # Data Validation
    # ------------------------------------------------------------------
    def get_data_validation_config(self) -> DataValidationConfig:
        logger.info("Loading DataValidation configuration.")
        config = self.config["data_validation"]
        create_directories([config["root_dir"]])
        return DataValidationConfig(
            root_dir=Path(config["root_dir"]),
            data_path=Path(config["data_path"]),
            schema_file=Path(config["schema_file"]),
            status_file=Path(config["STATUS_FILE"]),
        )

    # ------------------------------------------------------------------
    # Data Transformation
    # ------------------------------------------------------------------
    def get_data_transformation_config(self) -> DataTransformationConfig:
        logger.info("Loading DataTransformation configuration.")
        config = self.config["data_transformation"]
        params = self.params["DataTransformation"]
        create_directories([config["root_dir"]])
        return DataTransformationConfig(
            root_dir=Path(config["root_dir"]),
            data_path=Path(config["data_path"]),
            transformed_train_path=Path(config["transformed_train_path"]),
            transformed_test_path=Path(config["transformed_test_path"]),
            test_size=float(params["test_size"]),
            random_state=int(params["random_state"]),
        )

    # ------------------------------------------------------------------
    # Model Trainer
    # ------------------------------------------------------------------
    def get_model_trainer_config(self) -> ModelTrainerConfig:
        logger.info("Loading ModelTrainer configuration.")
        config = self.config["model_trainer"]
        params = self.params["ModelTrainer"]
        schema = self.schema
        create_directories([config["root_dir"]])
        return ModelTrainerConfig(
            root_dir=Path(config["root_dir"]),
            train_data_path=Path(config["train_data_path"]),
            model_path=Path(config["model_path"]),
            alpha=float(params["alpha"]),
            l1_ratio=float(params["l1_ratio"]),
            max_iter=int(params["max_iter"]),
            target_column=schema["target_column"],
        )

    # ------------------------------------------------------------------
    # Model Evaluation
    # ------------------------------------------------------------------
    def get_model_evaluation_config(self) -> ModelEvaluationConfig:
        logger.info("Loading ModelEvaluation configuration.")
        config = self.config["model_evaluation"]
        params = self.params["ModelTrainer"]
        schema = self.schema
        create_directories([config["root_dir"]])

        mlflow_uri = os.getenv("MLFLOW_TRACKING_URI", config.get("mlflow_uri", ""))
        return ModelEvaluationConfig(
            root_dir=Path(config["root_dir"]),
            model_path=Path(config["model_path"]),
            test_data_path=Path(config["test_data_path"]),
            metric_file_name=Path(config["metric_file_name"]),
            target_column=schema["target_column"],
            mlflow_uri=mlflow_uri,
            alpha=float(params["alpha"]),
            l1_ratio=float(params["l1_ratio"]),
        )
