"""
Aureum AI — Crop Recommendation
Self-contained Gradio app for Hugging Face Spaces.

Trains a RandomForest on startup from Crop_recommendation.csv (22 crop classes)
then serves a 7-feature web UI at /.
"""
import gradio as gr
import joblib
import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

MODEL_PATH = "model.pkl"
ENCODER_PATH = "encoder.pkl"
DATA_PATH = "Crop_recommendation.csv"

FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]


def train_and_save():
    """Train RandomForest pipeline and persist to disk."""
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURES]
    y = df["label"]

    encoder = LabelEncoder()
    y_enc = encoder.fit_transform(y)

    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)),
    ])

    X_tr, X_te, y_tr, y_te = train_test_split(X, y_enc, test_size=0.2, random_state=42)
    pipe.fit(X_tr, y_tr)
    acc = accuracy_score(y_te, pipe.predict(X_te))

    joblib.dump(pipe, MODEL_PATH)
    joblib.dump(encoder, ENCODER_PATH)
    print(f"[Aureum] Trained — test accuracy: {acc * 100:.2f}%")
    return acc


# Train on cold start if needed
if not (os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH)):
    ACC = train_and_save()
else:
    ACC = None

pipeline = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)


def recommend(N, P, K, temperature, humidity, ph, rainfall):
    """Predict the best crop given soil + climate features."""
    x = np.array([[N, P, K, temperature, humidity, ph, rainfall]])
    pred = pipeline.predict(x)[0]
    proba = pipeline.predict_proba(x)[0]
    crop = encoder.inverse_transform([pred])[0]
    confidence = float(proba.max())

    # Top-3 alternatives
    top3_idx = np.argsort(proba)[::-1][:3]
    alternatives = [
        f"{encoder.inverse_transform([i])[0]} — {proba[i]*100:.1f}%"
        for i in top3_idx
    ]

    return crop.upper(), f"{confidence*100:.1f}%", "\n".join(alternatives)


with gr.Blocks(theme=gr.themes.Soft(), title="Aureum — Crop Recommendation") as demo:
    gr.Markdown("# 🌾 Aureum AI — Crop Recommendation")
    gr.Markdown(
        "Predict the optimal crop from soil + climate features. "
        "**RandomForest** (200 trees) trained on a 2,200-row, 22-class dataset. "
        "Part of the [Aureum AI Portfolio](https://github.com/lexusthunder/aureum-ai-portfolio)."
    )

    with gr.Row():
        with gr.Column():
            gr.Markdown("### Soil & Climate Inputs")
            N = gr.Slider(0, 140, value=90, label="Nitrogen (N)")
            P = gr.Slider(0, 145, value=42, label="Phosphorus (P)")
            K = gr.Slider(0, 205, value=43, label="Potassium (K)")
            temp = gr.Slider(0, 50, value=20.9, label="Temperature (°C)")
            hum = gr.Slider(0, 100, value=82.0, label="Humidity (%)")
            ph = gr.Slider(0, 14, value=6.5, label="Soil pH")
            rain = gr.Slider(0, 300, value=202.0, label="Rainfall (mm)")
            btn = gr.Button("🌱 Recommend Crop", variant="primary", size="lg")

        with gr.Column():
            gr.Markdown("### AI Recommendation")
            out_crop = gr.Textbox(label="🥇 Best crop", interactive=False)
            out_conf = gr.Textbox(label="Confidence", interactive=False)
            out_alt = gr.Textbox(label="Top 3 candidates", interactive=False, lines=3)

    gr.Examples(
        examples=[
            [90, 42, 43, 20.9, 82.0, 6.5, 202.0],
            [85, 58, 41, 21.7, 80.3, 7.0, 226.7],
            [60, 55, 44, 23.0, 82.3, 7.8, 263.9],
            [104, 18, 30, 23.6, 60.4, 6.8, 140.9],
        ],
        inputs=[N, P, K, temp, hum, ph, rain],
        label="Try a sample row from the dataset",
    )

    btn.click(
        fn=recommend,
        inputs=[N, P, K, temp, hum, ph, rain],
        outputs=[out_crop, out_conf, out_alt],
    )


if __name__ == "__main__":
    demo.launch()
