"""
Singleton pentru modelul ML activ.
Modelul este inițializat la startup și poate fi reantrenat via API.
Suport persistence: salvează/încarcă modelul din pickle.
"""

import os
import pickle

import numpy as np

from main import B2BLeadScoringModel
from app.core.config import settings

_model: B2BLeadScoringModel | None = None
N_FEATURES = 5  # company_size, budget, engagement_score, industry_match, decision_maker_contact


def get_model() -> B2BLeadScoringModel:
    """Returnează modelul activ (lazy init). Încearcă load din disk mai întâi."""
    global _model
    if _model is None:
        _model = _load_model()
    if _model is None:
        _model = _create_default_model()
        _save_model(_model)
    return _model


def _load_model() -> B2BLeadScoringModel | None:
    """Încearcă încărcarea modelului din disk."""
    path = settings.model_path
    if not os.path.exists(path):
        return None
    try:
        with open(path, "rb") as f:
            model = pickle.load(f)
        if isinstance(model, B2BLeadScoringModel):
            return model
    except Exception:
        pass
    return None


def _save_model(model: B2BLeadScoringModel) -> None:
    """Salvează modelul pe disk."""
    try:
        with open(settings.model_path, "wb") as f:
            pickle.dump(model, f)
    except Exception:
        pass


def _create_default_model() -> B2BLeadScoringModel:
    """Creează și antrenează modelul pe date sintetice dacă nu există date reale."""
    rng = np.random.default_rng(42)
    model = B2BLeadScoringModel(
        input_size=N_FEATURES,
        hidden_size=settings.model_hidden_size,
    )
    # Antrenament pe date sintetice demo
    X = rng.random((500, N_FEATURES))
    y = ((X[:, 0] + X[:, 1] + X[:, 2]) > 1.5).astype(float).reshape(-1, 1)
    model.train(X, y, epochs=300, learning_rate=settings.model_learning_rate, verbose=False)
    return model


def retrain_model(X: np.ndarray, y: np.ndarray, epochs: int, learning_rate: float) -> list[float]:
    """Reantrenează modelul cu date noi. Salvează pe disk. Returnează loss history."""
    global _model
    _model = B2BLeadScoringModel(
        input_size=X.shape[1],
        hidden_size=settings.model_hidden_size,
    )
    history = _model.train(X, y, epochs=epochs, learning_rate=learning_rate, verbose=False)
    _save_model(_model)
    return history


def score_leads(features_matrix: np.ndarray) -> np.ndarray:
    """Returnează probabilitățile pentru o matrice de features."""
    model = get_model()
    return model.predict_proba(features_matrix)
