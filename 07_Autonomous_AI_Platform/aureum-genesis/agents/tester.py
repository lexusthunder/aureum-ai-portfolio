"""TesterAgent — generates pytest cases from the plan, runs them, returns pass/fail."""
from __future__ import annotations

from pydantic import BaseModel

from core.agent_runtime import Agent, AgentRunContext
from agents.coder import CodeDiff


class TestResult(BaseModel):
    passed: bool
    total: int
    failed: int
    duration_s: float
    stdout_tail: str


SYSTEM_PROMPT = """You are the Tester in the Aureum Genesis pipeline.
Generate pytest tests for the diff. Cover happy path + the risks listed in the plan.
Return ONLY the python test file content (one file)."""


class TesterAgent(Agent):
    name = "tester"

    async def run(self, ctx: AgentRunContext, diff: CodeDiff, **_) -> TestResult:
        user = f"DIFF:\n{diff.unified_diff}\n\nGenerate tests/test_genesis_<slug>.py — one file, no markdown."
        test_code = await self.call_llm(ctx, system=SYSTEM_PROMPT, user=user, complexity="low")

        # Write + run in sandbox
        path = await ctx.tools.call("fs.write", path="tests/test_genesis_generated.py", content=test_code)
        result = await ctx.tools.call("shell.run", cmd=f"pytest -q {path}", timeout_s=120)

        return TestResult(
            passed=result["returncode"] == 0,
            total=result.get("collected", 0),
            failed=result.get("failed", 0),
            duration_s=result.get("duration_s", 0.0),
            stdout_tail=result.get("stdout", "")[-2000:],
        )
