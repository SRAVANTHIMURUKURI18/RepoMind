"""
Pydantic models for analysis records and agent progress.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ─── Enums ────────────────────────────────────────────────────────────────────

class AnalysisStatus(str, Enum):
    PENDING   = "pending"
    RUNNING   = "running"
    COMPLETED = "completed"
    FAILED    = "failed"


class AgentStatus(str, Enum):
    PENDING   = "pending"
    RUNNING   = "running"
    COMPLETED = "completed"
    FAILED    = "failed"
    SKIPPED   = "skipped"


# ─── Agent progress ───────────────────────────────────────────────────────────

class AgentProgress(BaseModel):
    agent_id:     str
    agent_name:   str
    status:       AgentStatus = AgentStatus.PENDING
    progress:     int = 0          # 0-100
    started_at:   Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error:        Optional[str] = None


# ─── Analysis record ──────────────────────────────────────────────────────────

class AnalysisRecord(BaseModel):
    id:          str = Field(default_factory=lambda: str(uuid.uuid4()))
    repo_name:   str
    repo_url:    Optional[str] = None
    source_type: str = "zip"       # "zip" | "github"
    created_at:  datetime = Field(default_factory=datetime.utcnow)
    updated_at:  datetime = Field(default_factory=datetime.utcnow)
    status:      AnalysisStatus = AnalysisStatus.PENDING
    agents:      List[AgentProgress] = []
    results:     Optional[Dict[str, Any]] = None
    error:       Optional[str] = None
    file_count:  int = 0
    language:    Optional[str] = None
    framework:   Optional[str] = None


# ─── Request / response schemas ───────────────────────────────────────────────

class GithubAnalysisRequest(BaseModel):
    github_url: str
    repo_name:  Optional[str] = None


class AnalysisStatusResponse(BaseModel):
    id:        str
    status:    AnalysisStatus
    repo_name: str
    agents:    List[AgentProgress]
    created_at: datetime
    error:     Optional[str] = None


class HistoryItem(BaseModel):
    id:         str
    repo_name:  str
    repo_url:   Optional[str]
    source_type: str
    status:     AnalysisStatus
    created_at: datetime
    language:   Optional[str]
    framework:  Optional[str]
    overall_score: Optional[float] = None
