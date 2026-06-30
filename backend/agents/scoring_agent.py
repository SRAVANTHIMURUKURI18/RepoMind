"""
Agent 8 – Project Scoring Agent
"""
from __future__ import annotations

from typing import Any, Dict

from agents.base_agent import BaseAgent
from config import settings
from models.agents import CategoryScore, ProjectScoreResult


class ScoringAgent(BaseAgent):
    agent_id   = "scoring"
    agent_name = "Project Score"

    async def run(self, context: Dict[str, Any]) -> Dict:
        if settings.MOCK_AI:
            result = _mock_result(context)
        else:
            results = context.get("agent_results", {})
            summary = context["summary"]
            prompt = (
                "You are a technical evaluator. Score this repository 0-10 in each category.\n"
                f"Repository: {summary}\n"
                f"Review findings: {str(results.get('review', {}))[:500]}\n"
                f"Security findings: {str(results.get('security', {}))[:500]}\n"
                f"Performance findings: {str(results.get('performance', {}))[:500]}\n\n"
                "Score: architecture, security, performance, documentation, maintainability.\n"
                "Return JSON with fields: architecture, security, performance, documentation, "
                "maintainability (each with score 0-10, reasoning, improvements list)."
            )
            raw = await self.llm(prompt, json_mode=True)
            result = _parse_result(raw)
        return result.model_dump()


def _mock_result(ctx: Dict) -> ProjectScoreResult:
    # Pull from other agents' results for coherence
    agent_results = ctx.get("agent_results", {})
    security_data = agent_results.get("security", {})
    review_data = agent_results.get("review", {})

    sec_critical = security_data.get("critical_count", 1)
    sec_total    = security_data.get("total_issues", 6)
    sec_score    = max(3.0, 10.0 - sec_critical * 2 - (sec_total - sec_critical) * 0.5)

    rev_critical = review_data.get("critical_count", 1)
    rev_score    = max(4.0, 9.5 - rev_critical * 1.5)

    arch  = CategoryScore(category="Architecture",    score=8.7,
        reasoning="Well-structured with clear separation of concerns. Modular agent design is excellent.",
        improvements=["Add OpenAPI docs", "Consider gRPC for agent communication", "Add service mesh for production"])
    sec   = CategoryScore(category="Security",        score=round(sec_score, 1),
        reasoning=f"Found {sec_total} issues including {sec_critical} critical. Path traversal vulnerability is highest priority.",
        improvements=["Add authentication middleware", "Fix path traversal in ZIP extraction", "Implement rate limiting"])
    perf  = CategoryScore(category="Performance",     score=7.9,
        reasoning="Good async foundation with FastAPI. N+1 queries and synchronous file I/O need attention.",
        improvements=["Fix N+1 query patterns", "Add Redis caching", "Use asyncio.to_thread for file I/O"])
    docs  = CategoryScore(category="Documentation",   score=5.5,
        reasoning="Basic documentation exists but lacks API reference, deployment guide, and contribution guidelines.",
        improvements=["Add OpenAPI schema docs", "Write deployment guide", "Add contributing.md", "Add inline code comments"])
    maint = CategoryScore(category="Maintainability", score=round(rev_score, 1),
        reasoning="Clean code structure with consistent patterns. Some functions are too long and need decomposition.",
        improvements=["Break down long functions", "Add unit test coverage", "Set up linting CI/CD", "Add type hints throughout"])

    scores = [arch.score, sec.score, perf.score, docs.score, maint.score]
    overall = round(sum(scores) / len(scores), 1)

    def _grade(s: float) -> str:
        if s >= 9.0: return "A+"
        if s >= 8.5: return "A"
        if s >= 8.0: return "A-"
        if s >= 7.5: return "B+"
        if s >= 7.0: return "B"
        if s >= 6.0: return "C"
        return "D"

    return ProjectScoreResult(
        architecture=arch, security=sec, performance=perf,
        documentation=docs, maintainability=maint,
        overall=overall, grade=_grade(overall),
        summary=(
            f"Overall grade: {_grade(overall)} ({overall}/10). "
            "Strong architecture and maintainability; security needs immediate attention. "
            "Documentation is the weakest area requiring significant improvement."
        ),
    )


def _parse_result(raw: dict) -> ProjectScoreResult:
    def _cat(key: str) -> CategoryScore:
        d = raw.get(key, {})
        return CategoryScore(category=key.title(), score=float(d.get("score", 5.0)),
                             reasoning=d.get("reasoning", ""), improvements=d.get("improvements", []))
    arch = _cat("architecture"); sec = _cat("security"); perf = _cat("performance")
    docs = _cat("documentation"); maint = _cat("maintainability")
    overall = round(sum(c.score for c in [arch, sec, perf, docs, maint]) / 5, 1)
    return ProjectScoreResult(architecture=arch, security=sec, performance=perf,
                              documentation=docs, maintainability=maint,
                              overall=overall, grade="B", summary=f"Overall: {overall}/10")
