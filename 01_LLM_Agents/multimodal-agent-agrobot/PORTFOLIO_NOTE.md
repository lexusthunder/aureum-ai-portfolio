# Portfolio Note — Multimodal Agent + AgroBot

## What it is

Two integrated projects shipped as one competition entry:

1. **AgroBot** — IoT ML model that decides when to start sprinklers based on 3 sensors (air temperature, soil humidity, rainfall flag). RandomForest classifier, ~96% accuracy on synthetic + extensible-to-real-sensor data.
2. **Multimodal Agent** — a Gradio web agent that accepts **image + voice + text** input and replies with synthesized speech. Image analysis (brightness, dominant colors, dimensions) via NumPy + Pillow; STT via Google Speech Recognition; TTS via gTTS.

## Why it matters for a Google AI Engineer interview

- **Multimodality** — fusing vision, speech, and text in one agent. This is the direction Gemini is pushing.
- **Edge / IoT inference** — the AgroBot side proves I can ship a model that runs on small devices, not just notebooks.
- **End-to-end UX** — the agent has a real Gradio UI at `localhost:7860`, not just a CLI demo.

## Tech stack

`scikit-learn (RandomForest)` · `joblib` · `NumPy` · `Pillow` · `Gradio` · `SpeechRecognition` · `gTTS` · `Python 3.11`

## How to run

```bash
pip install -r requirements.txt
# IoT model
cd agrobot && python main.py
# Multimodal web agent
cd ../openai_agent && python main.py
# → opens http://localhost:7860
```

## What I would extend

- Replace gTTS with a local Whisper + Coqui TTS (offline, privacy)
- Train the AgroBot model on real sensor data from a Raspberry Pi pilot
- Containerize and deploy on Cloud Run for the agent, IoT Core for the sensors
