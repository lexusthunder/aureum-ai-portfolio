"""Genesis eval runner — runs frozen tickets, scores against goldens, blocks regressions."""
from __future__ import annotations

import argparse
import asyncio
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path

import yaml

# Ensure project root is on sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import run_ticket  # noqa: E402


HERE = Path(__file__).resolve().parent


@dataclass
class TicketResult:
    id: str
    name: str
    status: str  # success | failed | budget_exceeded
    final_score: int = 0
    cost_usd: float = 0.0
    duration_s: float = 0.0
    pr_url: str = ""
    notes: list[str] = field(default_factory=list)


async def run_one(ticket: dict, budget_override: float | None = None) -> TicketResult:
    expected = ticket.get("expected", {})
    budget = budget_override if budget_override is not None else expected.get("max_budget_usd", 5.0)
    res = TicketResult(id=ticket["id"], name=ticket["name"], status="failed")
    try:
        # Each ticket runs against an ephemeral test repo seeded by tests/fixtures/
        result = await run_ticket(ticket["ticket"], repo_path="tests/fixtures/eval_repo", budget_usd=budget)
        res.status = result.get("status", "failed")
        res.final_score = result.get("final_score", 0)
        res.cost_usd = result.get("cost_usd", 0.0)
        res.duration_s = result.get("wall_time_s", 0.0)
        res.pr_url = result.get("pr_url", "")
        if res.final_score < expected.get("min_quality_score", 8):
            res.notes.append(f"score {res.final_score} below bar {expected['min_quality_score']}")
            res.status = "failed"
    except Exception as e:
        res.notes.append(f"exception: {type(e).__name__}: {e}")
    return res


async def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--against", default="main", help="branch / tag / SHA we are evaluating against")
    p.add_argument("--max-budget", type=float, default=10.0, help="hard total cap, USD")
    p.add_argument("--filter", default=None, help="run only tickets whose id matches this prefix")
    p.add_argument("--out", default="eval/last_run.json")
    args = p.parse_args()

    with open(HERE / "tickets.yaml") as f:
        suite = yaml.safe_load(f)
    tickets = suite["tickets"]
    if args.filter:
        tickets = [t for t in tickets if t["id"].startswith(args.filter)]

    print(f"[eval] running {len(tickets)} tickets against {args.against} (cap ${args.max_budget})")

    results: list[TicketResult] = []
    total_cost = 0.0
    for i, t in enumerate(tickets, 1):
        if total_cost >= args.max_budget:
            print(f"[eval] hard budget cap hit at ticket {i}, skipping rest")
            break
        print(f"  [{i}/{len(tickets)}] {t['id']} · {t['name']} ...")
        res = await run_one(t)
        total_cost += res.cost_usd
        results.append(res)
        marker = "✅" if res.status == "success" else "❌"
        print(f"     {marker} status={res.status} score={res.final_score}/10 cost=${res.cost_usd:.4f}")
        for n in res.notes:
            print(f"     ↳ {n}")

    passed = sum(1 for r in results if r.status == "success")
    summary = {
        "against": args.against,
        "total_tickets": len(results),
        "passed": passed,
        "failed": len(results) - passed,
        "total_cost_usd": round(total_cost, 4),
        "results": [r.__dict__ for r in results],
    }
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    with open(args.out, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n[eval] {passed}/{len(results)} passed · total ${total_cost:.4f} · saved → {args.out}")

    # Exit non-zero if not all green — CI blocks prompt-change PRs on this
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
