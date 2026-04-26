import pandas as pd
from sklearn.linear_model import ElasticNet

from src.mlproject.components import logger
from src.mlproject.entity import ModelTrainerConfig
from src.mlproject.utils.common import save_model


class ModelTrainer:
    """Trains an ElasticNet regression model and persists it to disk."""

    def __init__(self, config: ModelTrainerConfig):
        self.config = config

    def initiate_model_training(self):
        train_df = pd.read_csv(self.config.train_data_path)
        logger.info("Training data loaded: shape=%s", train_df.shape)

        X_train = train_df.drop(columns=[self.config.target_column])
        y_train = train_df[self.config.target_column]

        model = ElasticNet(
            alpha=self.config.alpha,
            l1_ratio=self.config.l1_ratio,
            max_iter=self.config.max_iter,
            random_state=42,
        )
        model.fit(X_train, y_train)
        logger.info(
            "Model trained — alpha=%.4f, l1_ratio=%.4f",
            self.config.alpha,
            self.config.l1_ratio,
        )

        save_model(self.config.model_path, model)
        logger.info("Model saved to: %s", self.config.model_path)
