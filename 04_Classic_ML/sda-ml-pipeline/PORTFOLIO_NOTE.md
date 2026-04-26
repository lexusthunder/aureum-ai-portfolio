# Portfolio Note — SDA ML Pipeline

![Python](https://img.shields.io/badge/python-3.11-blue?logo=python) ![Tests](https://img.shields.io/badge/tests-pytest-0A9EDC) ![Layout](https://img.shields.io/badge/layout-src/-orange) ![Status](https://img.shields.io/badge/status-Scaffold-yellow)

## What it is

A clean **Python ML scaffold** with proper `src/` layout: `model.py`, `train.py`, `predict.py`, `preprocessing.py`, plus an `app/` web layer and a `tests/` folder. Built as the production-style template I reuse to bootstrap new ML projects.

## Recruiter lens

- **Shows I package Python the way pros do** — `src/` layout, separate concerns (model / train / predict / preprocessing), tests live next to code, requirements pinned.
- **Shows I think about reuse** — this scaffold is what I clone-and-adapt; not every project starts from scratch.

## Files to open first

1. `src/model.py` — model class
2. `src/train.py` — training entry point
3. `src/predict.py` — inference path
4. `src/preprocessing.py` — feature engineering layer

## Status & roadmap

🟡 **Scaffold + first model.** Week 4 of the 3-month roadmap converts this into a deployed text-classification demo on Hugging Face Spaces.
