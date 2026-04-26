"""VectorStore — pgvector-backed RAG over the target repo."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class RetrievedChunk:
    file_path: str
    line_start: int
    line_end: int
    content: str
    score: float


class VectorStore:
    """Wraps pgvector. Each row = a code chunk + commit-aware embedding."""

    def __init__(self, dsn: str = "postgresql://localhost/aureum_genesis") -> None:
        self.dsn = dsn

    @classmethod
    def connect(cls, dsn: str = "postgresql://localhost/aureum_genesis") -> "VectorStore":
        # Real impl: psycopg + pgvector. Skeleton stub here for portfolio review.
        return cls(dsn=dsn)

    async def search(self, query: str, k: int = 8, file_glob: str | None = None) -> list[RetrievedChunk]:
        """Top-k nearest chunks. file_glob narrows to a subtree."""
        raise NotImplementedError("hydrate with text-embedding-3-large + pgvector cosine search")

    async def index_repo(self, repo_path: str) -> int:
        """Embed the entire repo. Idempotent — only re-embeds changed files."""
        raise NotImplementedError("walk repo, hash files, embed deltas, upsert with commit_sha")
