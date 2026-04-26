"""
Aureum Genesis — orchestrator entry point.

Usage:
    python main.py --ticket "Add /api/v1/health/db endpoint, FastAPI, returns 200/503"
"""
from __future__ import annotations

import argparse
import asyncio
import logging
import sys
from typing import Final

from core.agent_runtime import AgentRunContext
from core.cost_tracker import CostTracker
from core.llm_router import LLMRouter
from core.vector_store import VectorStore
from core.tool_registry import ToolRegistry
from agents.researcher import ResearcherAgent
from agents.coder import CoderAgent
from agents.tester import TesterAgent
from agents.critic import CriticAgent
from agents.deployer import DeployerAgent

MAX_REVISIONS: Final[int] = 3
QUALITY_BAR: Final[int] = 8

log = logging.getLogger("genesis")


async def run_ticket(ticket: str, repo_path: str = ".", budget_usd: float = 5.0) -> dict:
    """Run the full 5-agent loop for a single ticket."""
    cost = CostTracker(budget_usd=budget_usd)
    router = LLMRouter()
    vstore = VectorStore.connect()
    tools = ToolRegistry.default(repo_path=repo_path)

    ctx = AgentRunContext(
        ticket=ticket,
        repo_path=repo_path,
        cost=cost,
        router=router,
        vstore=vstore,
        tools=tools,
    )

    log.info("[orchestrator] ticket=%r budget=$%.2f", ticket[:80], budget_usd)

    # 1. RESEARCH — typed ImplementationPlan
    plan = await ResearcherAgent().run(ctx)
    log.info("[researcher] scoped %d files, %d new", len(plan.touched_files), len(plan.new_files))

    # 2-3-4. CODE → TEST → CRITIQUE → loop
    diff, score = None, 0
    for revision in range(1, MAX_REVISIONS + 1):
        diff = await CoderAgent().run(ctx, plan=plan, prior_diff=diff, prior_score=score)
        log.info("[coder rev=%d] +%d -%d", revision, diff.lines_added, diff.lines_removed)

        test_result = await TesterAgent().run(ctx, diff=diff)
        if not test_result.passed:
            log.warning("[tester] %d/%d failed — sending to coder", test_result.failed, test_result.total)
            continue

        review = await CriticAgent().run(ctx, diff=diff, test_result=test_result)
        score = review.score
        log.info("[critic rev=%d] score=%d/10", revision, score)
        if score >= QUALITY_BAR:
            break
    else:
        log.error("[orchestrator] exhausted %d revisions, score=%d/10 — aborting", MAX_REVISIONS, score)
        return {"status": "failed", "reason": "quality_bar_not_met", "score": score, "cost": cost.total_usd}

    # 5. DEPLOY — open PR
    pr = await DeployerAgent().run(ctx, diff=diff, plan=plan)
    log.info("[deployer] PR #%d opened: %s", pr.number, pr.url)

    summary = {
        "status": "success",
        "ticket": ticket,
        "pr_url": pr.url,
        "pr_number": pr.number,
        "revisions": revision,
        "final_score": score,
        "cost_usd": round(cost.total_usd, 4),
        "tokens": cost.tokens,
        "wall_time_s": round(cost.wall_time_s, 1),
    }
    log.info("[orchestrator] DONE %s", summary)
    return summary


def main() -> int:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
    p = argparse.ArgumentParser(description="Aureum Genesis — autonomous AI software engineer")
    p.add_argument("--ticket", required=True, help="Natural-language ticket")
    p.add_argument("--repo", default=".", help="Repo path (default: cwd)")
    p.add_argument("--budget", type=float, default=5.0, help="USD cap per run")
    args = p.parse_args()

    result = asyncio.run(run_ticket(args.ticket, repo_path=args.repo, budget_usd=args.budget))
    return 0 if result.get("status") == "success" else 1


if __name__ == "__main__":
    sys.exit(main())
