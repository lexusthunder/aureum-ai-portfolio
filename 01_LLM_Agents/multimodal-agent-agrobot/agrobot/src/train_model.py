"""
AgroBot — Modul de antrenare model ML pentru irigare inteligentă.
Generează date IoT sintetice și antrenează un RandomForest classifier.
"""

import os
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


def train_model() -> None:
    """
    Generează date sintetice de la senzori IoT și antrenează modelul.

    Regula de irigare:
      - temperatura > 28°C ȘI umiditate_sol < 40% ȘI ploaie = 0  →  irigare (1)
      - altfel                                                      →  fără irigare (0)
    """
    print("[AgroBot] Generare date IoT sintetice (1000 eșantioane)...")

    np.random.seed(42)
    n = 1000

    temperatura     = np.random.uniform(10, 40, n)   # °C
    umiditate_sol   = np.random.uniform(10, 90, n)   # %
    ploaie          = np.random.randint(0, 2, n)     # 0 = nu plouă, 1 = plouă

    iriga = (
        (temperatura > 28) & (umiditate_sol < 40) & (ploaie == 0)
    ).astype(int)

    # Zgomot realist ~5%
    noise_mask = np.random.random(n) < 0.05
    iriga[noise_mask] = 1 - iriga[noise_mask]

    X = np.column_stack([temperatura, umiditate_sol, ploaie])
    y = iriga

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"[AgroBot] Acuratețe model: {acc * 100:.2f}%")
    print(classification_report(y_test, y_pred, target_names=["Nu iriga", "Irigare"]))

    # Salvare model
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "model.pkl")
    joblib.dump(model, model_path)
    print(f"[AgroBot] Model salvat în: {os.path.abspath(model_path)}")
