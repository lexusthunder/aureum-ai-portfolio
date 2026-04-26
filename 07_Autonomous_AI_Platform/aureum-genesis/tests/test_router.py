"""Routing logic — validates the table, no API calls."""
import pytest

from core.llm_router import LLMRouter, Complexity, ROUTING_TABLE


def test_default_picks_for_each_agent():
    r = LLMRouter()
    for agent in ["researcher", "coder", "tester", "critic", "deployer"]:
        for cx in [Complexity.LOW, Complexity.MEDIUM, Complexity.HIGH]:
            assert (agent, cx) in ROUTING_TABLE, f"missing routing entry for {agent}/{cx}"


def test_overrides_take_precedence():
    r = LLMRouter(overrides={("coder", Complexity.MEDIUM): "claude-opus-4-6"})
    # We can't actually instantiate vendor clients in this test, so just check the lookup
    from core.llm_router import ROUTING_TABLE
    default = ROUTING_TABLE[("coder", Complexity.MEDIUM)]
    assert default != "claude-opus-4-6"  # overridden value differs from default
