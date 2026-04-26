"""
main.py — Interfața Gradio pentru agentul AI multimodal.

Pornire:
  cd openai_agent/
  pip install gradio Pillow SpeechRecognition gtts
  python main.py
"""

import gradio as gr
from agent_core import multimodal_ai

interface = gr.Interface(
    fn=multimodal_ai,
    inputs=[
        gr.Image(type="numpy", label="📷 Imagine (opțional)"),
        gr.Audio(sources=["microphone", "upload"], type="filepath", label="🎤 Întrebare vocală (opțional)"),
        gr.Textbox(lines=2, placeholder="Scrie întrebarea aici (opțional)", label="💬 Întrebare text"),
    ],
    outputs=[
        gr.Image(label="🖼️ Imagine analizată"),
        gr.Textbox(label="🤖 Răspuns AI"),
        gr.Audio(label="🔊 Răspuns vocal"),
    ],
    title="🧠 AI Multimodal Assistant",
    description=(
        "Agent AI complet: **vede**, **ascultă** și **răspunde**.\n\n"
        "Furnizează o imagine și/sau o întrebare (voce sau text) pentru a primi analiză și răspuns vocal."
    ),
    examples=[
        [None, None, "Ce poți analiza?"],
        [None, None, "Descrie culorile din imagine"],
    ],
    theme=gr.themes.Soft(),
    allow_flagging="never",
)

if __name__ == "__main__":
    print("✅ AgroBot Multimodal Agent pornit...")
    interface.launch(share=True)
