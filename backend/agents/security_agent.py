"""
Agent 4 – Security Reviewer
"""
from __future__ import annotations

from typing import Any, Dict

from agents.base_agent import BaseAgent
from config import settings
from models.agents import SecurityResult, SecurityVulnerability


class SecurityAgent(BaseAgent):
    agent_id   = "security"
    agent_name = "Security Reviewer"

    async def run(self, context: Dict[str, Any]) -> Dict:
        if settings.MOCK_AI:
            result = _mock_result()
        else:
            chunks = context["chunks"]
            code_ctx = "\n".join(chunks[:2])
            prompt = (
                "You are a security expert. Audit this codebase for:\n"
                "- Hardcoded secrets/API keys\n"
                "- SQL injection vulnerabilities\n"
                "- XSS vulnerabilities\n"
                "- Missing input validation\n"
                "- Weak authentication\n"
                "- Unsafe dependencies\n\n"
                f"Code:\n{code_ctx}\n\n"
                "Return a JSON array of vulnerabilities with fields: "
                "vuln_type, severity, title, description, recommendation, file_path."
            )
            raw = await self.llm(prompt)
            result = _parse_result(raw)
        return result.model_dump()


def _mock_result() -> SecurityResult:
    vulns = [
        SecurityVulnerability(
            vuln_type="missing_rate_limiting",
            severity="high",
            title="No Rate Limiting on Upload Endpoint",
            description="The /api/analysis/upload endpoint has no rate limiting, allowing attackers to exhaust server resources by submitting thousands of requests.",
            file_path="backend/api/analysis.py",
            recommendation="Add slowapi rate limiting: @limiter.limit('10/minute') on upload endpoints.",
            cwe_id="CWE-770"
        ),
        SecurityVulnerability(
            vuln_type="cors_misconfiguration",
            severity="high",
            title="Overly Permissive CORS Configuration",
            description="CORS is configured to allow all localhost origins. In production, this should be locked to the specific frontend domain.",
            file_path="backend/main.py",
            recommendation="Set allow_origins to ['https://your-domain.com'] in production environments.",
            cwe_id="CWE-942"
        ),
        SecurityVulnerability(
            vuln_type="path_traversal",
            severity="critical",
            title="Potential Path Traversal in File Upload",
            description="Uploaded ZIP files could contain entries with paths like '../../etc/passwd' that extract outside the intended directory.",
            file_path="backend/services/analysis_service.py",
            recommendation="Validate all extracted paths: ensure they resolve within the target directory. Use zipfile's extractall with a filter.",
            cwe_id="CWE-22"
        ),
        SecurityVulnerability(
            vuln_type="missing_auth",
            severity="medium",
            title="Analysis Endpoints Lack Authentication",
            description="All /api/analysis/* endpoints are publicly accessible without authentication, allowing anyone to trigger analyses.",
            recommendation="Implement JWT middleware on analysis routes. Use FastAPI's Depends(get_current_user) pattern.",
            cwe_id="CWE-306"
        ),
        SecurityVulnerability(
            vuln_type="insecure_temp_files",
            severity="medium",
            title="Temporary Files Not Cleaned Up",
            description="Cloned repositories and extracted ZIPs in the uploads/ directory are not deleted after analysis, leading to data leakage.",
            file_path="backend/services/analysis_service.py",
            recommendation="Use try/finally blocks with shutil.rmtree() to clean up temp directories after analysis completes.",
            cwe_id="CWE-377"
        ),
        SecurityVulnerability(
            vuln_type="missing_validation",
            severity="low",
            title="GitHub URL Not Validated",
            description="GitHub URLs are passed directly to git.Repo.clone_from() without validating they are genuine GitHub URLs.",
            file_path="backend/tools/github_loader.py",
            recommendation="Validate URLs with a regex pattern: must match https://github.com/{owner}/{repo} format.",
            cwe_id="CWE-20"
        ),
    ]
    critical = sum(1 for v in vulns if v.severity == "critical")
    high = sum(1 for v in vulns if v.severity == "high")
    return SecurityResult(
        vulnerabilities=vulns,
        total_issues=len(vulns),
        critical_count=critical,
        high_count=high,
        risk_level="High",
        summary=(
            f"Security audit found {len(vulns)} issues including {critical} critical and {high} high severity. "
            "Most critical issue is a path traversal vulnerability in file upload handling. "
            "Immediate action required before production deployment."
        ),
        recommendations=[
            "Implement authentication on all analysis endpoints",
            "Add path traversal protection to ZIP extraction",
            "Configure rate limiting on all public endpoints",
            "Lock CORS to specific production domain",
            "Clean up temporary files after each analysis",
        ]
    )


def _parse_result(raw: str) -> SecurityResult:
    return SecurityResult(
        vulnerabilities=[],
        total_issues=0, critical_count=0, high_count=0,
        risk_level="Unknown", summary=raw[:300], recommendations=[],
    )
