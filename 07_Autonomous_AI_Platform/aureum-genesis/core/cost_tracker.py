"""Cost tracker — hard budget cap per ticket, refuses to call LLM once exceeded."""
from __future__ import annotations

import time
from dataclasses import dataclass, field

# $/1M tokens — input/output. Refresh monthly from vendor pricing pages.
PRICES_USD_PER_1M: dict[str, tuple[float, float]] = {
    "claude-haiku-4-5":  (1.00,  5.00),
    "claude-sonnet-4-6": (3.00, 15.00),
    "claude-opus-4-6":  (15.00, 75.00),
    "gpt-4o-mini":       (0.15,  0.60),
    "gpt-4o":            (2.50, 10.00),
    "gemini-2-5-pro":    (1.25,  5.00),
}


class BudgetExceeded(RuntimeError):
    """Raised when running this ticket further would breach the budget cap."""


@dataclass
class CostTracker:
    budget_usd: float
    total_usd: float = 0.0
    tokens: dict[str, int] = field(default_factory=lambda: {"in": 0, "out": 0})
    started_at: float = field(default_factory=time.time)
    _call_started_at: float | None = None

    @property
    def wall_time_s(self) -> float:
        return time.time() - self.started_at

    def remaining_usd(self) -> float:
        return max(0.0, self.budget_usd - self.total_usd)

    def assert_can_spend(self, est_usd: float) -> None:
        if self.total_usd + est_usd > self.budget_usd:
            raise BudgetExceeded(
                f"would exceed cap: spent ${self.total_usd:.4f} + est ${est_usd:.4f} > ${self.budget_usd:.2f}"
            )

    def start_call(self, model: str) -> None:
        self._call_started_at = time.time()

    def end_call(self, model: str, in_tokens: int, out_tokens: int) -> float:
        in_price, out_price = PRICES_USD_PER_1M.get(model, (3.0, 15.0))
        cost = (in_tokens * in_price + out_tokens * out_price) / 1_000_000
        self.total_usd += cost
        self.tokens["in"] += in_tokens
        self.tokens["out"] += out_tokens
        self._call_started_at = None
        if self.total_usd > self.budget_usd:
            raise BudgetExceeded(f"after this call we are over: ${self.total_usd:.4f} > ${self.budget_usd:.2f}")
        return cost

    def abort_call(self) -> None:
        self._call_started_at = None
