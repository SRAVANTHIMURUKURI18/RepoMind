"""
Agent-specific result models.
"""
from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel, Field
import uuid


def _id() -> str:
    return str(uuid.uuid4())[:8]


# ─── Repository Scanner ───────────────────────────────────────────────────────

class FileNode(BaseModel):
    name:     str
    path:     str
    type:     Literal["file", "directory"]
    children: List["FileNode"] = []
    size:     Optional[int] = None
    language: Optional[str] = None


class DependencyEdge(BaseModel):
    source: str
    target: str
    kind:   str = "imports"


class RepositoryScanResult(BaseModel):
    languages:       List[str]
    primary_language: str
    frameworks:      List[str]
    entry_points:    List[str]
    file_tree:       List[FileNode]
    dependency_graph: List[DependencyEdge]
    total_files:     int
    total_lines:     int
    summary:         str


# ─── Architecture Explainer ───────────────────────────────────────────────────

class ArchitectureSection(BaseModel):
    title:       str
    description: str
    details:     List[str] = []


class ArchitectureResult(BaseModel):
    overview:     str
    sections:     List[ArchitectureSection]
    tech_stack:   List[str]
    request_flow: str
    api_design:   Optional[str] = None
    auth_pattern: Optional[str] = None
    database_design: Optional[str] = None


# ─── Code Reviewer ────────────────────────────────────────────────────────────

class CodeIssue(BaseModel):
    id:          str = Field(default_factory=_id)
    severity:    Literal["critical", "high", "medium", "low"]
    category:    str  # naming, duplication, complexity, dead_code, smell
    title:       str
    description: str
    file_path:   Optional[str] = None
    line_number: Optional[int] = None
    suggestion:  str


class CodeReviewResult(BaseModel):
    issues:        List[CodeIssue]
    total_issues:  int
    critical_count: int
    high_count:    int
    medium_count:  int
    low_count:     int
    summary:       str
    overall_quality: str  # "Excellent" | "Good" | "Fair" | "Poor"


# ─── Security Reviewer ────────────────────────────────────────────────────────

class SecurityVulnerability(BaseModel):
    id:             str = Field(default_factory=_id)
    vuln_type:      str  # hardcoded_secret, sql_injection, xss, etc.
    severity:       Literal["critical", "high", "medium", "low"]
    title:          str
    description:    str
    file_path:      Optional[str] = None
    line_number:    Optional[int] = None
    recommendation: str
    cwe_id:         Optional[str] = None


class SecurityResult(BaseModel):
    vulnerabilities:  List[SecurityVulnerability]
    total_issues:     int
    critical_count:   int
    high_count:       int
    risk_level:       str   # "Critical" | "High" | "Medium" | "Low"
    summary:          str
    recommendations:  List[str]


# ─── Performance Analyzer ─────────────────────────────────────────────────────

class PerformanceFinding(BaseModel):
    id:          str = Field(default_factory=_id)
    category:    str  # algorithm, database, memory, async, caching
    impact:      Literal["high", "medium", "low"]
    title:       str
    description: str
    file_path:   Optional[str] = None
    suggestion:  str


class PerformanceResult(BaseModel):
    findings:       List[PerformanceFinding]
    total_findings: int
    high_impact:    int
    summary:        str
    top_recommendations: List[str]


# ─── Documentation Generator ─────────────────────────────────────────────────

class DocumentationResult(BaseModel):
    readme:            str   # Markdown
    api_docs:          Optional[str] = None   # Markdown
    folder_guide:      str   # Markdown
    installation_guide: str  # Markdown
    summary:           str


# ─── Interview Generator ──────────────────────────────────────────────────────

class InterviewQuestion(BaseModel):
    id:       str = Field(default_factory=_id)
    level:    Literal["beginner", "intermediate", "advanced", "system_design", "coding"]
    topic:    str
    question: str
    hint:     Optional[str] = None


class InterviewResult(BaseModel):
    questions:    List[InterviewQuestion]
    total:        int
    by_level:     dict  # { "beginner": [...], ... }
    focus_areas:  List[str]


# ─── Project Score ────────────────────────────────────────────────────────────

class CategoryScore(BaseModel):
    category:     str
    score:        float   # 0.0 – 10.0
    reasoning:    str
    improvements: List[str] = []


class ProjectScoreResult(BaseModel):
    architecture:    CategoryScore
    security:        CategoryScore
    performance:     CategoryScore
    documentation:   CategoryScore
    maintainability: CategoryScore
    overall:         float
    grade:           str   # A+, A, B+, B, C, D, F
    summary:         str
