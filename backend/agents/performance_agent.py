"""
Agent 5 – Performance Analyzer
"""
from __future__ import annotations

from typing import Any, Dict

from agents.base_agent import BaseAgent
from config import settings
from models.agents import PerformanceFinding, PerformanceResult


class PerformanceAgent(BaseAgent):
    agent_id   = "performance"
    agent_name = "Performance Analyzer"

    async def run(self, context: Dict[str, Any]) -> Dict:
        if settings.MOCK_AI:
            result = _mock_result()
        else:
            chunks = context["chunks"]
            code_ctx = "\n".join(chunks[:2])
            prompt = (
                "You are a performance optimization expert. Analyze this codebase for:\n"
                "- Nested loops / O(n²) or worse algorithms\n"
                "- Memory leaks or excessive memory usage\n"
                "- Expensive database queries (N+1 problem)\n"
                "- Missed async/await opportunities (blocking I/O)\n"
                "- Missing caching for expensive computations\n\n"
                f"Code:\n{code_ctx}\n\n"
                "Return a JSON array of findings with fields: "
                "category, impact (high/medium/low), title, description, suggestion."
            )
            raw = await self.llm(prompt)
            result = _parse_result(raw)
        return result.model_dump()


def _mock_result() -> PerformanceResult:
    findings = [
        PerformanceFinding(
            category="database",
            impact="high",
            title="N+1 Query Pattern in Analysis Listing",
            description="The history endpoint fetches all analyses then makes individual queries for reports in a loop, causing N+1 database hits.",
            file_path="backend/services/database_service.py",
            suggestion="Use a single JOIN query: SELECT a.*, r.path FROM analyses a LEFT JOIN reports r ON a.id=r.analysis_id"
        ),
        PerformanceFinding(
            category="algorithm",
            impact="high",
            title="Nested Loop in Dependency Graph Builder",
            description="The dependency graph builder iterates over files then imports in O(n×m) nested loops for each analysis.",
            file_path="backend/agents/repository_agent.py",
            suggestion="Pre-build an import lookup dictionary once, then do O(1) lookups instead of scanning all files per import."
        ),
        PerformanceFinding(
            category="async",
            impact="high",
            title="Synchronous File I/O Blocks Event Loop",
            description="ZIP extraction and file reading use synchronous pathlib/shutil calls inside async endpoints, blocking the uvicorn event loop.",
            file_path="backend/services/analysis_service.py",
            suggestion="Use asyncio.to_thread() or aiofiles for all file I/O operations inside async functions."
        ),
        PerformanceFinding(
            category="caching",
            impact="medium",
            title="No Caching for Repeated Analysis Results",
            description="Agent results are recomputed on every status poll. Results should be cached in Redis or an in-memory store.",
            suggestion="Use functools.lru_cache for pure computations. Store completed analysis results in memory with an LRU eviction policy."
        ),
        PerformanceFinding(
            category="memory",
            impact="medium",
            title="Large File Contents Held in Memory",
            description="All repository files are loaded into memory simultaneously. A 50MB repo could consume significant RAM.",
            file_path="backend/tools/file_reader.py",
            suggestion="Process files in streaming batches. Only load one chunk at a time when passing to agents."
        ),
        PerformanceFinding(
            category="database",
            impact="low",
            title="Missing Database Indexes",
            description="The analyses table lacks indexes on created_at and status columns used in frequent ORDER BY and WHERE clauses.",
            file_path="backend/database/db.py",
            suggestion="Add: CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);"
        ),
    ]
    high_count = sum(1 for f in findings if f.impact == "high")
    return PerformanceResult(
        findings=findings,
        total_findings=len(findings),
        high_impact=high_count,
        summary=(
            f"Identified {len(findings)} performance issues, {high_count} with high impact. "
            "Critical areas: N+1 database queries, blocking I/O in async context, and nested loop complexity. "
            "Addressing these could improve response times by 60-80%."
        ),
        top_recommendations=[
            "Fix N+1 query with JOIN in list_analyses()",
            "Move file I/O to asyncio.to_thread()",
            "Add database indexes for common query patterns",
            "Implement result caching with TTL",
            "Stream file processing instead of full memory load",
        ]
    )


def _parse_result(raw: str) -> PerformanceResult:
    return PerformanceResult(
        findings=[], total_findings=0, high_impact=0,
        summary=raw[:300], top_recommendations=[],
    )
