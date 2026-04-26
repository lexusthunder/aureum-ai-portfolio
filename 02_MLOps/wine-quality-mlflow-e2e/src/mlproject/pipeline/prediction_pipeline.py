import numpy as np
import pandas as pd

from src.mlproject.constants import CONFIG_FILE_PATH
from src.mlproject.utils.common import load_model, read_yaml


class PredictionPipeline:
    def __init__(self):
        config = read_yaml(CONFIG_FILE_PATH)
        model_path = config["model_trainer"]["model_path"]
        self.model = load_model(model_path)

    def predict(self, data: pd.DataFrame) -> np.ndarray:
        return self.model.predict(data)
