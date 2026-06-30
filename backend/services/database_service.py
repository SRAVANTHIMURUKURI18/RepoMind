"""
SQLite database service – initialise schema and CRUD operations.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime
from typing import List, Optional

from database.db import get_db
from models.analysis import AnalysisRecord, AnalysisStatus, HistoryItem

logger = logging.getLogger(__name__)

# ─── Schema ───────────────────────────────────────────────────────────────────

_CREATE_ANALYSES = """
CREATE TABLE IF NOT EXISTS analyses (
    id           TEXT PRIMARY KEY,
    repo_name    TEXT NOT NULL,
    repo_url     TEXT,
    source_type  TEXT NOT NULL DEFAULT 'zip',
    status       TEXT NOT NULL DEFAULT 'pending',
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL,
    language     TEXT,
    framework    TEXT,
    file_count   INTEGER DEFAULT 0,
    agents_json  TEXT,
    results_json TEXT,
    error        TEXT
);
"""

_CREATE_REPORTS = """
CREATE TABLE IF NOT EXISTS reports (
    id          TEXT PRIMARY KEY,
    analysis_id TEXT NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    format      TEXT NOT NULL,
    path        TEXT NOT NULL,
    created_at  TEXT NOT NULL
);
"""


async def init_db() -> None:
    """Create tables if they don't exist."""
    async with get_db() as conn:
        await conn.execute(_CREATE_ANALYSES)
        await conn.execute(_CREATE_REPORTS)
        await conn.commit()
    logger.info("Database schema ready")


# ─── Analyses ─────────────────────────────────────────────────────────────────

async def save_analysis(record: AnalysisRecord) -> None:
    async with get_db() as conn:
        await conn.execute(
            """
            INSERT OR REPLACE INTO analyses
                (id, repo_name, repo_url, source_type, status, created_at,
                 updated_at, language, framework, file_count, agents_json, results_json, error)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                record.id,
                record.repo_name,
                record.repo_url,
                record.source_type,
                record.status.value,
                record.created_at.isoformat(),
                record.updated_at.isoformat(),
                record.language,
                record.framework,
                record.file_count,
                json.dumps([a.model_dump(mode="json") for a in record.agents]),
                json.dumps(record.results) if record.results else None,
                record.error,
            ),
        )
        await conn.commit()


async def get_analysis(analysis_id: str) -> Optional[AnalysisRecord]:
    async with get_db() as conn:
        async with conn.execute(
            "SELECT * FROM analyses WHERE id = ?", (analysis_id,)
        ) as cur:
            row = await cur.fetchone()
    if not row:
        return None
    return _row_to_record(row)


async def list_analyses(limit: int = 50) -> List[HistoryItem]:
    async with get_db() as conn:
        async with conn.execute(
            """
            SELECT id, repo_name, repo_url, source_type, status,
                   created_at, language, framework, results_json
            FROM analyses
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        ) as cur:
            rows = await cur.fetchall()

    items = []
    for row in rows:
        results = json.loads(row["results_json"]) if row["results_json"] else None
        overall = None
        if results and "scoring" in results:
            overall = results["scoring"].get("overall")
        items.append(
            HistoryItem(
                id=row["id"],
                repo_name=row["repo_name"],
                repo_url=row["repo_url"],
                source_type=row["source_type"],
                status=AnalysisStatus(row["status"]),
                created_at=datetime.fromisoformat(row["created_at"]),
                language=row["language"],
                framework=row["framework"],
                overall_score=overall,
            )
        )
    return items


# ─── Reports ──────────────────────────────────────────────────────────────────

async def save_report(analysis_id: str, fmt: str, path: str) -> None:
    import uuid
    async with get_db() as conn:
        await conn.execute(
            "INSERT OR REPLACE INTO reports (id, analysis_id, format, path, created_at) VALUES (?,?,?,?,?)",
            (str(uuid.uuid4()), analysis_id, fmt, path, datetime.utcnow().isoformat()),
        )
        await conn.commit()


async def get_report_path(analysis_id: str, fmt: str) -> Optional[str]:
    async with get_db() as conn:
        async with conn.execute(
            "SELECT path FROM reports WHERE analysis_id=? AND format=?",
            (analysis_id, fmt),
        ) as cur:
            row = await cur.fetchone()
    return row["path"] if row else None


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _row_to_record(row) -> AnalysisRecord:
    from models.analysis import AgentProgress
    agents_raw = json.loads(row["agents_json"]) if row["agents_json"] else []
    agents = [AgentProgress(**a) for a in agents_raw]
    results = json.loads(row["results_json"]) if row["results_json"] else None
    return AnalysisRecord(
        id=row["id"],
        repo_name=row["repo_name"],
        repo_url=row["repo_url"],
        source_type=row["source_type"],
        status=AnalysisStatus(row["status"]),
        created_at=datetime.fromisoformat(row["created_at"]),
        updated_at=datetime.fromisoformat(row["updated_at"]),
        language=row["language"],
        framework=row["framework"],
        file_count=row["file_count"] or 0,
        agents=agents,
        results=results,
        error=row["error"],
    )
