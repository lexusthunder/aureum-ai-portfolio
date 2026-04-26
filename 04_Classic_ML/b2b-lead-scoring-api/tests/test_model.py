"""Tests pentru B2BLeadScoringModel."""

import numpy as np
import pytest

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import B2BLeadScoringModel


def make_data(n=100, n_features=5, seed=0):
    np.random.seed(seed)
    X = np.random.rand(n, n_features)
    y = ((X[:, 0] + X[:, 1] + X[:, 2]) > 1.5).astype(float).reshape(-1, 1)
    return X, y


def test_forward_output_shape():
    model = B2BLeadScoringModel(5, 8)
    X = np.random.rand(10, 5)
    out = model.forward(X)
    assert out.shape == (10, 1)


def test_forward_output_in_range():
    model = B2BLeadScoringModel(5, 8)
    X = np.random.rand(50, 5)
    out = model.forward(X)
    assert (out >= 0).all() and (out <= 1).all()


def test_loss_decreases_after_training():
    X, y = make_data(200)
    model = B2BLeadScoringModel(5, 16)
    history = model.train(X, y, epochs=300, learning_rate=0.1, verbose=False)
    assert history[-1] < history[0], "Loss trebuie să scadă după antrenament"


def test_predict_binary_output():
    X, y = make_data(50)
    model = B2BLeadScoringModel(5, 8)
    model.train(X, y, epochs=100, learning_rate=0.1, verbose=False)
    preds = model.predict(X)
    assert set(preds.flatten().tolist()).issubset({0, 1})


def test_accuracy_above_chance():
    X, y = make_data(300, seed=42)
    model = B2BLeadScoringModel(5, 16)
    model.train(X, y, epochs=500, learning_rate=0.1, verbose=False)
    acc = model.accuracy(X, y)
    assert acc > 0.6, f"Accuracy prea mică: {acc:.2%}"


def test_compute_loss_no_nan():
    model = B2BLeadScoringModel(5, 8)
    X, y = make_data(20)
    pred = model.forward(X)
    loss = model.compute_loss(pred, y)
    assert not np.isnan(loss)
    assert loss > 0


def test_train_validates_input_shape():
    model = B2BLeadScoringModel(5, 8)
    X_bad = np.random.rand(10, 5)  # 1D target — trebuie să ridice eroare
    y_bad = np.random.rand(10)     # nu e 2D
    with pytest.raises(ValueError, match="2D"):
        model.train(X_bad, y_bad)
