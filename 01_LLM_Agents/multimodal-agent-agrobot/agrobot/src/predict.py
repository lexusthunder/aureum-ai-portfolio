"""
AgroBot — Modul de predicție irigare bazat pe date senzori IoT.
"""

import os
import numpy as np
import joblib

_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "model.pkl")
_model = None


def _load_model():
    global _model
    if _model is None:
        if not os.path.exists(_MODEL_PATH):
            raise FileNotFoundError(
                f"Modelul nu există la: {os.path.abspath(_MODEL_PATH)}\n"
                "Rulați mai întâi train_model() din src.train_model."
            )
        _model = joblib.load(_MODEL_PATH)
    return _model


def predict(temperatura: float, umiditate_sol: float, ploaie: int) -> str:
    """
    Prezice dacă este necesară irigarea câmpului.

    Args:
        temperatura:   Temperatura aerului (°C), ex: 27.5
        umiditate_sol: Umiditatea solului (%), ex: 35.0
        ploaie:        1 dacă plouă, 0 dacă nu plouă

    Returns:
        Mesaj cu decizia și probabilitatea, ex:
        "Pornește stropitorile (prob=0.87)"
    """
    model = _load_model()
    X = np.array([[temperatura, umiditate_sol, ploaie]])
    pred = model.predict(X)[0]
    proba = model.predict_proba(X)[0][1]

    mesaj = "🚿 Pornește stropitorile" if pred == 1 else "✅ Nu porni stropitorile"
    return f"{mesaj} (prob={proba:.2f})"
