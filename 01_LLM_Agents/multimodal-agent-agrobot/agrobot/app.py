"""
AgroBot — Interfață Gradio pentru sistem IoT de irigare inteligentă.
"""

import os
import sys
import numpy as np
import gradio as gr

sys.path.insert(0, os.path.dirname(__file__))

from src.train_model import train_model
from src.predict import predict, _load_model

# ── Antrenare automată dacă modelul lipsește ──────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "model.pkl")
if not os.path.exists(MODEL_PATH):
    train_model()

# ── Logică predicție pentru Gradio ───────────────────────────────────────────
def predict_irigare(temperatura, umiditate_sol, ploaie):
    ploaie_int = 1 if ploaie == "Da ☔" else 0
    rezultat = predict(temperatura, umiditate_sol, ploaie_int)

    model = _load_model()
    X = np.array([[temperatura, umiditate_sol, ploaie_int]])
    proba_irigare = model.predict_proba(X)[0][1]
    proba_nu = 1 - proba_irigare

    if proba_irigare >= 0.7:
        status = "🚿 IRIGARE NECESARĂ"
        culoare = "🔴"
        recomandare = f"Pornește stropitorile imediat. Condițiile indică stres hidric ridicat."
    elif proba_irigare >= 0.4:
        status = "⚠️ MONITORIZARE"
        culoare = "🟡"
        recomandare = "Condiții limită. Verifică din nou în 2-3 ore."
    else:
        status = "✅ NU ESTE NECESARĂ IRIGAREA"
        culoare = "🟢"
        recomandare = "Solul are umiditate suficientă. Nu acționa."

    detalii = f"""
### {culoare} {status}

**Recomandare:** {recomandare}

---

| Parametru          | Valoare              |
|--------------------|----------------------|
| 🌡️ Temperatură     | {temperatura}°C       |
| 💧 Umiditate sol   | {umiditate_sol}%      |
| 🌧️ Precipitații    | {ploaie}             |

---

**Probabilitate irigare:** `{proba_irigare:.0%}`
**Probabilitate fără irigare:** `{proba_nu:.0%}`
"""

    bara_irigare = round(proba_irigare * 100, 1)
    return detalii, bara_irigare


def retrain():
    train_model()
    return "✅ Modelul a fost reantrenat cu succes pe date IoT noi (1000 eșantioane)."


# ── Scenarii demo ─────────────────────────────────────────────────────────────
SCENARII = {
    "☀️ Caniculă, sol uscat":         (35, 18, "Nu 🌤️"),
    "🌧️ Ploaie, sol umed":            (22, 78, "Da ☔"),
    "🌤️ Cald, umiditate medie":       (29, 38, "Nu 🌤️"),
    "❄️ Răcoros, sol moderat":        (16, 55, "Nu 🌤️"),
    "🔥 Vară extremă, fără ploaie":   (38, 12, "Nu 🌤️"),
}

def incarca_scenariu(scenariu):
    if scenariu not in SCENARII:
        return gr.update(), gr.update(), gr.update()
    temp, hum, rain = SCENARII[scenariu]
    return temp, hum, rain


# ── UI Gradio ─────────────────────────────────────────────────────────────────
CSS = """
.gradio-container { font-family: 'Inter', sans-serif; }
#titlu { text-align: center; margin-bottom: 4px; }
#subtitlu { text-align: center; color: #6b7280; margin-bottom: 20px; }
#btn-predict { background: #16a34a !important; color: white !important; font-size: 16px !important; }
#btn-retrain { background: #1d4ed8 !important; color: white !important; }
"""

with gr.Blocks(
    title="AgroBot — Irigare Inteligentă",
    theme=gr.themes.Default(
        primary_hue="green",
        secondary_hue="blue",
        neutral_hue="slate",
    ),
    css=CSS,
) as demo:

    gr.Markdown("# 🌱 AgroBot", elem_id="titlu")
    gr.Markdown("**Sistem IoT de Irigare Inteligentă** · RandomForest · 96% Acuratețe", elem_id="subtitlu")

    with gr.Row():
        # ── Stânga: input senzori ─────────────────────────────────────────────
        with gr.Column(scale=1):
            gr.Markdown("### 📡 Date Senzori IoT")

            scenariu_dd = gr.Dropdown(
                choices=list(SCENARII.keys()),
                label="Încarcă scenariu demo",
                value=None,
                interactive=True,
            )

            temperatura = gr.Slider(
                minimum=0, maximum=50, value=28, step=0.5,
                label="🌡️ Temperatură aer (°C)",
                info="Temperatura măsurată de senzorul IoT"
            )
            umiditate_sol = gr.Slider(
                minimum=0, maximum=100, value=40, step=1,
                label="💧 Umiditate sol (%)",
                info="Umiditate măsurată la 15cm adâncime"
            )
            ploaie = gr.Radio(
                choices=["Nu 🌤️", "Da ☔"],
                value="Nu 🌤️",
                label="🌧️ Precipitații active"
            )

            btn_predict = gr.Button("🔍 Analizează & Decide", variant="primary", elem_id="btn-predict")

            gr.Markdown("---")
            gr.Markdown("### 🔄 Reantrenare Model")
            btn_retrain = gr.Button("⚙️ Reantrenează pe date noi", elem_id="btn-retrain")
            retrain_out = gr.Textbox(label="Status reantrenare", interactive=False, lines=1)

        # ── Dreapta: output ───────────────────────────────────────────────────
        with gr.Column(scale=1):
            gr.Markdown("### 📊 Decizie & Analiză")

            rezultat_md = gr.Markdown(value="*Apasă **Analizează** pentru a vedea decizia.*")

            gr.Markdown("**Probabilitate irigare:**")
            bara_prob = gr.Slider(
                minimum=0, maximum=100, value=0, step=0.1,
                label="% Probabilitate irigare",
                interactive=False,
                info="0% = nu iriga, 100% = irigare urgentă"
            )

    gr.Markdown("---")
    gr.Markdown(
        "🤖 **AgroBot** · Model: RandomForest (n=100, depth=8) · "
        "Antrenat pe 1000 eșantioane IoT sintetice · "
        "Features: Temperatură, Umiditate sol, Precipitații",
        elem_id="subtitlu"
    )

    # ── Event handlers ────────────────────────────────────────────────────────
    scenariu_dd.change(
        fn=incarca_scenariu,
        inputs=scenariu_dd,
        outputs=[temperatura, umiditate_sol, ploaie]
    )

    btn_predict.click(
        fn=predict_irigare,
        inputs=[temperatura, umiditate_sol, ploaie],
        outputs=[rezultat_md, bara_prob]
    )

    btn_retrain.click(
        fn=retrain,
        inputs=[],
        outputs=[retrain_out]
    )

    # ── Predicție live la schimbarea sliderelor ───────────────────────────────
    for comp in [temperatura, umiditate_sol, ploaie]:
        comp.change(
            fn=predict_irigare,
            inputs=[temperatura, umiditate_sol, ploaie],
            outputs=[rezultat_md, bara_prob]
        )


if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        inbrowser=True,
    )
