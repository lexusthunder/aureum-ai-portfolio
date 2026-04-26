import pandas as pd

from src.mlproject.components import logger
from src.mlproject.entity import DataValidationConfig
from src.mlproject.utils.common import read_yaml


class DataValidation:
    """Validates the raw dataset against the declared schema."""

    def __init__(self, config: DataValidationConfig):
        self.config = config

    def validate_all_columns(self) -> bool:
        """Check that every schema column is present in the dataset."""
        schema = read_yaml(self.config.schema_file)
        expected_columns = set(schema["columns"].keys())

        df = pd.read_csv(self.config.data_path)
        actual_columns = set(df.columns.tolist())

        missing = expected_columns - actual_columns
        extra = actual_columns - expected_columns

        if missing:
            logger.warning("Missing columns: %s", missing)
        if extra:
            logger.info("Extra columns not in schema (will be ignored): %s", extra)

        validation_status = len(missing) == 0

        self.config.status_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config.status_file, "w") as f:
            f.write(f"Validation status: {validation_status}\n")
            if missing:
                f.write(f"Missing columns: {missing}\n")

        logger.info("Validation status: %s — written to %s", validation_status, self.config.status_file)
        return validation_status

    def initiate_data_validation(self) -> bool:
        return self.validate_all_columns()
