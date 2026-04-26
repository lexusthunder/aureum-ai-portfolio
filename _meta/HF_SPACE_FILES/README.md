---
title: Crop Recommendation
emoji: 🌾
colorFrom: green
colorTo: yellow
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
license: mit
---

# Aureum AI — Crop Recommendation

Predict the optimal crop from 7 soil + climate features using a RandomForest classifier (200 trees, ~99% test accuracy on a 2,200-row, 22-class dataset).

Part of the **[Aureum AI Portfolio](https://github.com/lexusthunder/aureum-ai-portfolio)** — built for Google AI Engineer interviews.

## Features

- **N, P, K** — soil nutrients
- **Temperature** (°C), **Humidity** (%), **pH**, **Rainfall** (mm)

## Output

- Best crop (1 of 22)
- Confidence score
- Top-3 alternatives

## Tech stack

`scikit-learn` (RandomForest + StandardScaler in a Pipeline) · `Gradio` · `Pandas`

## Reproduce locally

```bash
pip install -r requirements.txt
python app.py
```
