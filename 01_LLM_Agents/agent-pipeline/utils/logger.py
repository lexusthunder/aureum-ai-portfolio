from __future__ import annotations

from datetime import datetime
from typing import Any

from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.style import Style
from rich.table import Table

console = Console()

AGENT_STYLES = {
    "researcher": Style(color="bright_blue", bold=True),
    "analyzer":   Style(color="bright_green", bold=True),
    "writer":     Style(color="bright_yellow", bold=True),
    "critic":     Style(color="bright_red", bold=True),
    "pipeline":   Style(color="bright_magenta", bold=True),
}

AGENT_ICONS = {
    "researcher": "🔍",
    "analyzer":   "📊",
    "writer":     "✍️ ",
    "critic":     "🎯",
    "pipeline":   "⚡",
}

AGENT_COLORS = {
    "researcher": "bright_blue",
    "analyzer":   "bright_green",
    "writer":     "bright_yellow",
    "critic":     "bright_red",
    "pipeline":   "bright_magenta",
}


class AgentLogger:
    def __init__(self, agent_name: str) -> None:
        self.agent_name = agent_name.lower()
        self.style = AGENT_STYLES.get(self.agent_name, Style(color="white", bold=True))
        self.icon = AGENT_ICONS.get(self.agent_name, "•")
        self.color = AGENT_COLORS.get(self.agent_name, "white")

    def _timestamp(self) -> str:
        return datetime.now().strftime("%H:%M:%S")

    def _prefix(self) -> Text:
        t = Text()
        t.append(f"[{self._timestamp()}] ", style="dim white")
        t.append(f"{self.icon} ", style="bold")
        t.append(f"[{self.agent_name.upper()}]", style=self.style)
        return t

    def info(self, message: str) -> None:
        prefix = self._prefix()
        prefix.append(f"  {message}", style=f"{self.color}")
        console.print(prefix)

    def success(self, message: str) -> None:
        prefix = self._prefix()
        prefix.append(f"  ✅ {message}", style=f"bold {self.color}")
        console.print(prefix)

    def warning(self, message: str) -> None:
        prefix = self._prefix()
        prefix.append(f"  ⚠️  {message}", style="bold yellow")
        console.print(prefix)

    def error(self, message: str) -> None:
        prefix = self._prefix()
        prefix.append(f"  ❌ {message}", style="bold red")
        console.print(prefix)

    def panel(self, title: str, content: Any, expand: bool = False) -> None:
        console.print(
            Panel(
                str(content),
                title=f"[{self.color}]{self.icon} {title}[/{self.color}]",
                border_style=self.color,
                expand=expand,
                padding=(0, 1),
            )
        )

    def score_table(self, scores: dict[str, int]) -> None:
        table = Table(
            title=f"[bold {self.color}]{self.icon} Critic Scores[/bold {self.color}]",
            border_style=self.color,
            show_header=True,
            header_style=f"bold {self.color}",
        )
        table.add_column("Metric", style="bold white", min_width=20)
        table.add_column("Score", justify="center", min_width=10)
        table.add_column("Bar", min_width=20)

        for metric, score in scores.items():
            bar = "█" * score + "░" * (10 - score)
            color = "green" if score >= 7 else "yellow" if score >= 5 else "red"
            table.add_row(
                metric,
                f"[bold {color}]{score}/10[/bold {color}]",
                f"[{color}]{bar}[/{color}]",
            )
        console.print(table)

    def divider(self) -> None:
        console.rule(style=f"dim {self.color}")
