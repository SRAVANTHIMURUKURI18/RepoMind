"""
Agent 3 – Code Reviewer
"""
from __future__ import annotations

from typing import Any, Dict

from agents.base_agent import BaseAgent
from config import settings
from models.agents import CodeIssue, CodeReviewResult


class ReviewAgent(BaseAgent):
    agent_id   = "review"
    agent_name = "Code Reviewer"

    async def run(self, context: Dict[str, Any]) -> Dict:
        if settings.MOCK_AI:
            result = _mock_result()
        else:
            chunks = context["chunks"]
            code_ctx = "\n".join(chunks[:2])
            prompt = (
                "You are a senior code reviewer. Review this codebase for:\n"
                "- Naming conventions (variables, functions, classes)\n"
                "- Code duplication / DRY violations\n"
                "- Long functions (>50 lines)\n"
                "- Dead code\n"
                "- Code smells\n\n"
                f"Code:\n{code_ctx}\n\n"
                "Return a JSON array of issues with fields: "
                "severity (critical/high/medium/low), category, title, description, suggestion."
            )
            raw = await self.llm(prompt)
            result = _parse_result(raw)

        return result.model_dump()


def _mock_result() -> CodeReviewResult:
    issues = [
        CodeIssue(severity="high", category="complexity",
                  title="Long function detected",
                  description="The `process_analysis` function in analysis_service.py spans 87 lines, making it hard to understand and test.",
                  file_path="backend/services/analysis_service.py", line_number=45,
                  suggestion="Break it into smaller, single-responsibility functions like `_extract_files`, `_run_agents`, `_save_results`."),
        CodeIssue(severity="high", category="duplication",
                  title="Duplicate validation logic",
                  description="Input validation for GitHub URLs is duplicated in 3 different route handlers.",
                  file_path="backend/api/analysis.py", line_number=23,
                  suggestion="Extract into a shared `validate_github_url(url: str)` utility function."),
        CodeIssue(severity="medium", category="naming",
                  title="Inconsistent naming convention",
                  description="Mix of camelCase and snake_case in frontend component props.",
                  file_path="frontend/src/components/upload/UploadCard.tsx",
                  suggestion="Standardize on camelCase for all TypeScript/JavaScript identifiers."),
        CodeIssue(severity="medium", category="smell",
                  title="Magic numbers in configuration",
                  description="Hardcoded values like `50`, `8000`, `200000` appear inline without named constants.",
                  file_path="backend/tools/file_reader.py", line_number=12,
                  suggestion="Move to named constants or environment variables: `MAX_FILE_CHARS = 8_000`."),
        CodeIssue(severity="medium", category="dead_code",
                  title="Unused import detected",
                  description="`Optional` imported but not used in architecture_agent.py.",
                  file_path="backend/agents/architecture_agent.py", line_number=3,
                  suggestion="Remove the unused import to keep modules clean."),
        CodeIssue(severity="low", category="naming",
                  title="Non-descriptive variable name",
                  description="Variable `d` used in loop iterating over dependency edges.",
                  file_path="backend/agents/repository_agent.py", line_number=67,
                  suggestion="Rename to `edge` or `dep` for clarity."),
        CodeIssue(severity="low", category="smell",
                  title="Missing docstrings",
                  description="Several public functions lack docstrings, reducing discoverability.",
                  file_path="backend/tools/file_reader.py",
                  suggestion="Add Google-style docstrings to all public functions."),
        CodeIssue(severity="critical", category="complexity",
                  title="Nested loops in file indexing",
                  description="Triple-nested loops in the vector store indexing function create O(n³) complexity.",
                  file_path="backend/tools/vector_store.py", line_number=58,
                  suggestion="Flatten the loops and use list comprehensions for O(n) equivalent logic."),
    ]
    critical = sum(1 for i in issues if i.severity == "critical")
    high = sum(1 for i in issues if i.severity == "high")
    medium = sum(1 for i in issues if i.severity == "medium")
    low = sum(1 for i in issues if i.severity == "low")
    return CodeReviewResult(
        issues=issues,
        total_issues=len(issues),
        critical_count=critical,
        high_count=high,
        medium_count=medium,
        low_count=low,
        summary=(
            f"Found {len(issues)} code quality issues: {critical} critical, {high} high, "
            f"{medium} medium, {low} low. Primary concerns are function complexity and code duplication. "
            "The codebase follows generally good practices but needs refactoring in key areas."
        ),
        overall_quality="Good",
    )


def _parse_result(raw: str) -> CodeReviewResult:
    return CodeReviewResult(
        issues=[CodeIssue(severity="medium", category="general", title="Review Complete",
                          description=raw[:300], suggestion="See full analysis above.")],
        total_issues=1, critical_count=0, high_count=0, medium_count=1, low_count=0,
        summary=raw[:200], overall_quality="Fair",
    )
