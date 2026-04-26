import numpy as np
import pandas as pd
from flask import Flask, jsonify, render_template, request

from src.mlproject.pipeline.prediction_pipeline import PredictionPipeline

app = Flask(__name__)

# Feature names expected by the model (matches schema.yaml columns minus target)
FEATURE_NAMES = [
    "fixed acidity",
    "volatile acidity",
    "citric acid",
    "residual sugar",
    "chlorides",
    "free sulfur dioxide",
    "total sulfur dioxide",
    "density",
    "pH",
    "sulphates",
    "alcohol",
]

# Load model once at startup, not on every request
_pipeline = PredictionPipeline()


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "No JSON payload received."}), 400

        # Accept either {"features": [...]} or a flat dict of named features
        if "features" in data:
            values = data["features"]
            if len(values) != len(FEATURE_NAMES):
                return jsonify({
                    "error": f"Expected {len(FEATURE_NAMES)} features, got {len(values)}."
                }), 400
            input_df = pd.DataFrame([values], columns=FEATURE_NAMES)
        else:
            missing = [f for f in FEATURE_NAMES if f not in data]
            if missing:
                return jsonify({"error": f"Missing fields: {missing}"}), 400
            input_df = pd.DataFrame([{k: data[k] for k in FEATURE_NAMES}])

        prediction = _pipeline.predict(input_df)
        return jsonify({"prediction": float(np.round(prediction[0], 4))})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/train", methods=["POST"])
def train():
    """Re-run the full training pipeline via HTTP (dev convenience endpoint)."""
    import os
    import subprocess

    api_key = request.headers.get("X-API-Key", "")
    expected_key = os.environ.get("TRAIN_API_KEY", "")
    if not expected_key or api_key != expected_key:
        return jsonify({"error": "Missing or invalid X-API-Key header."}), 401

    result = subprocess.run(
        ["python", "main.py"],
        capture_output=True,
        text=True,
        timeout=600,
    )
    if result.returncode == 0:
        # Reload model after retraining
        global _pipeline
        _pipeline = PredictionPipeline()
        return jsonify({"status": "Training completed successfully."})
    return jsonify({"status": "Training failed.", "stderr": result.stderr}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)
