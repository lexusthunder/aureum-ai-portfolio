import json
from pathlib import Path
from typing import Iterable, Union

import joblib
import yaml

from src.mlproject.components import logger


def read_yaml(path_to_yaml: Union[str, Path]) -> dict:
    """Load a YAML file into a standard dictionary."""
    with open(Path(path_to_yaml), "r", encoding="utf-8") as yaml_file:
        content = yaml.safe_load(yaml_file) or {}
    logger.info(f"YAML file loaded: {path_to_yaml}")
    return content


def save_json(path: Union[str, Path], data: dict):
    """Persist a dictionary to a JSON file."""
    with open(Path(path), "w", encoding="utf-8") as json_file:
        json.dump(data, json_file, indent=4)
    logger.info(f"JSON file saved at: {path}")


def save_model(path: Union[str, Path], model_obj):
    """Serialize an ML model to disk."""
    joblib.dump(model_obj, Path(path))
    logger.info(f"Model saved to {path}")


def load_model(path: Union[str, Path]):
    """Load a serialized ML model from disk."""
    model = joblib.load(Path(path))
    logger.info(f"Model loaded from {path}")
    return model


def create_directories(paths: Iterable[Union[str, Path]]):
    """Ensure a collection of directories exists."""
    for path in paths:
        Path(path).mkdir(parents=True, exist_ok=True)
        logger.info(f"Directory ensured at: {path}")
