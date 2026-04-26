"""Tests for the budget guard. These run today, no API keys needed."""
import pytest

from core.cost_tracker import CostTracker, BudgetExceeded


def test_under_budget_ok():
    c = CostTracker(budget_usd=1.0)
    cost = c.end_call(model="claude-haiku-4-5", in_tokens=10_000, out_tokens=2_000)
    assert cost > 0
    assert c.total_usd < 1.0
    assert c.tokens["in"] == 10_000


def test_over_budget_raises():
    c = CostTracker(budget_usd=0.001)
    with pytest.raises(BudgetExceeded):
        c.end_call(model="claude-opus-4-6", in_tokens=100_000, out_tokens=50_000)


def test_unknown_model_uses_safe_default():
    c = CostTracker(budget_usd=10.0)
    c.end_call(model="future-model-x", in_tokens=1_000, out_tokens=500)
    assert c.total_usd > 0


def test_remaining_clamped():
    c = CostTracker(budget_usd=1.0)
    c.total_usd = 5.0  # simulate over
    assert c.remaining_usd() == 0.0
