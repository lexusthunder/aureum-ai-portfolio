# Portfolio Note — CinemaCritic AI

## What it is

Movie-review sentiment + critique generator. Uses `pyproject.toml` packaging, a `src/` layout, and a `tests/` folder — proper Python project structure.

## Why it matters

Shows I package Python projects the way production teams do (PEP 621, src-layout, pytest), not as a flat folder of scripts.

## Status

🟡 Scaffold + tests. Roadmap: fine-tune a small transformer (DistilBERT) on IMDB-reviews and ship a Gradio demo.
