"""ToolRegistry — pluggable tools every agent can call (sandboxed where it matters)."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Awaitable, Callable, Protocol


class Tool(Protocol):
    name: str
    async def __call__(self, **kwargs: object) -> object: ...


@dataclass
class ToolRegistry:
    """Name → callable. Coder + Tester get sandboxed shells; Researcher gets read-only fs."""
    tools: dict[str, Callable[..., Awaitable[object]]] = field(default_factory=dict)
    repo_path: str = "."

    @classmethod
    def default(cls, repo_path: str = ".") -> "ToolRegistry":
        from .tools import shell, fs, git, web
        r = cls(repo_path=repo_path)
        r.register("shell.run", shell.run_sandboxed)
        r.register("fs.read", fs.read)
        r.register("fs.write", fs.write_sandboxed)
        r.register("git.diff", git.diff)
        r.register("git.apply", git.apply_patch)
        r.register("web.search", web.search)
        return r

    def register(self, name: str, fn: Callable[..., Awaitable[object]]) -> None:
        self.tools[name] = fn

    async def call(self, name: str, **kwargs: object) -> object:
        if name not in self.tools:
            raise KeyError(f"tool not registered: {name}")
        return await self.tools[name](**kwargs)
