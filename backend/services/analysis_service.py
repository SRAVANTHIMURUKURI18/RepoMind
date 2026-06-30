"""
Analysis orchestration service – coordinates the full 8-agent pipeline.
"""
from __future__ import annotations

import asyncio
import logging
import os
import shutil
import uuid
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional

from config import settings
from models.analysis import AgentProgress, AgentStatus, AnalysisRecord, AnalysisStatus
from services.database_service import save_analysis
from tools.file_reader import (
    build_file_tree,
    detect_languages_and_frameworks,
    read_repository,
)
from tools.summarizer import build_context_summary, chunk_files
from tools.vector_store import VectorStore

logger = logging.getLogger(__name__)

# In-memory store for live status (keyed by analysis_id)
_live: Dict[str, AnalysisRecord] = {}

AGENT_DEFS = [
    ("repository",    "Repository Scanner"),
    ("architecture",  "Architecture Explainer"),
    ("review",        "Code Reviewer"),
    ("security",      "Security Reviewer"),
    ("performance",   "Performance Analyzer"),
    ("documentation", "Documentation Generator"),
    ("interview",     "Interview Generator"),
    ("scoring",       "Project Score"),
]


def get_live(analysis_id: str) -> Optional[AnalysisRecord]:
    return _live.get(analysis_id)


async def start_analysis(
    analysis_id: str,
    repo_name: str,
    repo_dir: str,
    source_type: str = "zip",
    repo_url: Optional[str] = None,
) -> None:
    """
    Kick off background analysis. Does NOT block the API handler.
    """
    record = AnalysisRecord(
        id=analysis_id,
        repo_name=repo_name,
        repo_url=repo_url,
        source_type=source_type,
        status=AnalysisStatus.RUNNING,
        agents=[AgentProgress(agent_id=aid, agent_name=aname) for aid, aname in AGENT_DEFS],
    )
    _live[analysis_id] = record
    await save_analysis(record)

    asyncio.create_task(_run_pipeline(record, repo_dir))


async def _run_pipeline(record: AnalysisRecord, repo_dir: str) -> None:
    analysis_id = record.id
    results: Dict = {}

    try:
        # ── Step 1: Read files ──────────────────────────────────────────────
        logger.info("[%s] Reading repository files …", analysis_id)
        files, total_files, total_lines = await asyncio.to_thread(read_repository, repo_dir)
        languages, primary_lang, frameworks = detect_languages_and_frameworks(files)
        file_tree = await asyncio.to_thread(build_file_tree, repo_dir)
        chunks = chunk_files(files)
        summary = build_context_summary(files, languages, frameworks)

        record.file_count = total_files
        record.language   = primary_lang
        record.framework  = frameworks[0] if frameworks else None

        # ── Step 2: Index in ChromaDB ───────────────────────────────────────
        vs = VectorStore(analysis_id)
        await asyncio.to_thread(vs.index_files, files)

        # ── Step 3: Run agents sequentially ────────────────────────────────
        context = {
            "files": files,
            "languages": languages,
            "primary_language": primary_lang,
            "frameworks": frameworks,
            "file_tree": file_tree,
            "total_files": total_files,
            "total_lines": total_lines,
            "repo_name": record.repo_name,
            "summary": summary,
            "chunks": chunks,
            "agent_results": results,
        }

        from agents.repository_agent    import RepositoryAgent
        from agents.architecture_agent  import ArchitectureAgent
        from agents.review_agent        import ReviewAgent
        from agents.security_agent      import SecurityAgent
        from agents.performance_agent   import PerformanceAgent
        from agents.documentation_agent import DocumentationAgent
        from agents.interview_agent     import InterviewAgent
        from agents.scoring_agent       import ScoringAgent

        agents = [
            RepositoryAgent(), ArchitectureAgent(), ReviewAgent(),
            SecurityAgent(), PerformanceAgent(), DocumentationAgent(),
            InterviewAgent(), ScoringAgent(),
        ]

        for agent, prog in zip(agents, record.agents):
            prog.status     = AgentStatus.RUNNING
            prog.started_at = datetime.utcnow()
            prog.progress   = 10
            await save_analysis(record)

            result = await agent.execute(context)

            prog.completed_at = datetime.utcnow()
            prog.progress     = 100

            if result["status"] == "completed":
                prog.status = AgentStatus.COMPLETED
                results[agent.agent_id] = result["data"]
                # Feed results into context for downstream agents
                context["agent_results"] = results
            else:
                prog.status = AgentStatus.FAILED
                prog.error  = result.get("error", "Unknown error")

            await save_analysis(record)
            # Tiny delay so progress updates are visible in UI
            await asyncio.sleep(0.1)

        # ── Step 4: Finalize ────────────────────────────────────────────────
        record.results = results
        record.status  = AnalysisStatus.COMPLETED
        record.updated_at = datetime.utcnow()
        await save_analysis(record)
        logger.info("[%s] Analysis completed successfully", analysis_id)

    except Exception as exc:
        logger.exception("[%s] Pipeline failed: %s", analysis_id, exc)
        record.status = AnalysisStatus.FAILED
        record.error  = str(exc)
        for prog in record.agents:
            if prog.status == AgentStatus.RUNNING:
                prog.status = AgentStatus.FAILED
        record.updated_at = datetime.utcnow()
        await save_analysis(record)

    finally:
        # Clean up the repo directory
        try:
            if os.path.exists(repo_dir):
                shutil.rmtree(repo_dir, ignore_errors=True)
        except Exception:
            pass


def extract_zip(zip_path: str, extract_to: str) -> str:
    """Extract a ZIP file. Returns path of the extracted directory."""
    os.makedirs(extract_to, exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as zf:
        # Security: filter out path traversal entries
        for member in zf.infolist():
            member_path = os.path.realpath(os.path.join(extract_to, member.filename))
            if not member_path.startswith(os.path.realpath(extract_to)):
                logger.warning("Skipping suspicious zip entry: %s", member.filename)
                continue
            zf.extract(member, extract_to)
    return extract_to
