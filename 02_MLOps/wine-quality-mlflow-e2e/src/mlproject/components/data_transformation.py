import pandas as pd
from sklearn.model_selection import train_test_split

from src.mlproject.components import logger
from src.mlproject.entity import DataTransformationConfig


class DataTransformation:
    """Splits the validated dataset into train and test sets."""

    def __init__(self, config: DataTransformationConfig):
        self.config = config

    def train_test_splitting(self):
        df = pd.read_csv(self.config.data_path)
        logger.info("Loaded dataset: shape=%s", df.shape)

        train, test = train_test_split(
            df,
            test_size=self.config.test_size,
            random_state=self.config.random_state,
        )

        train.to_csv(self.config.transformed_train_path, index=False)
        test.to_csv(self.config.transformed_test_path, index=False)

        logger.info(
            "Train/test split complete — train: %d rows, test: %d rows",
            len(train),
            len(test),
        )
        logger.info("Train saved to: %s", self.config.transformed_train_path)
        logger.info("Test saved to: %s", self.config.transformed_test_path)

    def initiate_data_transformation(self):
        self.train_test_splitting()
