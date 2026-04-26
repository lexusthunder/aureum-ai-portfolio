# Proiect SDA — Competiție AI

**Sistem Inteligent de Agricultură Precisă cu Machine Learning și Interfață Multimodală**

---

## Structura proiectului

```
proiect sda copetitie pe ai/
├── agrobot/              # Bot IoT de irigare inteligentă
│   ├── main.py           # Punct de intrare
│   └── src/
│       ├── train_model.py   # Antrenare model RandomForest
│       └── predict.py       # Predicție irigare
│
├── openai_agent/         # Agent AI Multimodal (imagine + voce + text)
│   ├── agent_core.py     # Logică centrală (analiză, TTS, STT)
│   └── main.py           # Interfață Gradio web
│
├── requirements.txt
└── README.md
```

---

## 1. AgroBot — Irigare Inteligentă IoT

**Problemă:** Când trebuie pornite stropitorile?

**Soluție:** Model RandomForest antrenat pe date de la 3 senzori IoT:
- Temperatură aer (°C)
- Umiditate sol (%)
- Precipitații (0/1)

**Acuratețe model:** ~96%

### Rulare

```bash
cd agrobot/
pip install scikit-learn joblib numpy
python main.py
```

**Exemplu output:**
```
📡 Cald, sol uscat, fără ploaie
   Temp=30°C | Umid=25% | Ploaie=NU
   → 🚿 Pornește stropitorile (prob=0.93)

📡 Plouă, sol umed
   Temp=22°C | Umid=78% | Ploaie=DA
   → ✅ Nu porni stropitorile (prob=0.01)
```

---

## 2. Agent AI Multimodal

**Capabilități:**
- 📷 Analiză imagine (luminozitate, culori dominante, dimensiuni)
- 🎤 Recunoaștere vocală (Google STT, online)
- 💬 Răspuns text contextual
- 🔊 Sinteză vocală (gTTS, online)

### Rulare

```bash
cd openai_agent/
pip install gradio Pillow SpeechRecognition gtts
python main.py
# Deschide browser la http://localhost:7860
```

---

## Instalare rapidă (tot proiectul)

```bash
pip install -r requirements.txt

# AgroBot
cd agrobot && python main.py

# Agent Multimodal
cd ../openai_agent && python main.py
```

---

## Tehnologii folosite

| Componenta | Tehnologie |
|---|---|
| Model ML | RandomForest (scikit-learn) |
| Interfață web | Gradio |
| Analiză imagine | NumPy + Pillow |
| Speech-to-Text | Google Speech Recognition |
| Text-to-Speech | gTTS |
| Date IoT | Generate sintetic + extensibil cu senzori reali |

---

## Autor

**Ureche Ionel Alexandru** — Proiect SDA Competiție AI, 2026
