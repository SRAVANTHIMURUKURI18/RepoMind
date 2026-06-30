"""
Analysis API routes – upload ZIP, GitHub URL, status polling, results.
"""
from __future__ import annotations

import os
import uuid
import logging
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from config import settings
from models.analysis import GithubAnalysisRequest, AnalysisStatusResponse
from services import analysis_service
from services.database_service import get_analysis

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/upload", summary="Upload a ZIP repository for analysis")
async def upload_zip(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are accepted")

    file_size = 0
    analysis_id = str(uuid.uuid4())
    upload_dir = os.path.join(settings.UPLOAD_DIR, analysis_id)
    os.makedirs(upload_dir, exist_ok=True)

    zip_path = os.path.join(upload_dir, file.filename)
    try:
        with open(zip_path, "wb") as f:
            while chunk := await file.read(1024 * 1024):  # 1 MB chunks
                file_size += len(chunk)
                if file_size > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds {settings.MAX_FILE_SIZE_MB}MB limit",
                    )
                f.write(chunk)

        repo_name = Path(file.filename).stem
        extract_dir = os.path.join(upload_dir, "repo")
        analysis_service.extract_zip(zip_path, extract_dir)
        os.remove(zip_path)

        await analysis_service.start_analysis(
            analysis_id=analysis_id,
            repo_name=repo_name,
            repo_dir=extract_dir,
            source_type="zip",
        )
        logger.info("Started analysis %s for ZIP: %s", analysis_id, file.filename)
        return {"analysis_id": analysis_id, "status": "running", "repo_name": repo_name}

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Upload failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/github", summary="Analyze a GitHub repository by URL")
async def analyze_github(request: GithubAnalysisRequest):
    from tools.github_loader import clone_repo, extract_repo_name

    analysis_id = str(uuid.uuid4())
    repo_name   = request.repo_name or extract_repo_name(request.github_url)
    clone_dir   = os.path.join(settings.UPLOAD_DIR, analysis_id, "repo")

    try:
        await __import__("asyncio").to_thread(clone_repo, request.github_url, clone_dir)
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    await analysis_service.start_analysis(
        analysis_id=analysis_id,
        repo_name=repo_name,
        repo_dir=clone_dir,
        source_type="github",
        repo_url=request.github_url,
    )
    logger.info("Started analysis %s for GitHub: %s", analysis_id, request.github_url)
    return {"analysis_id": analysis_id, "status": "running", "repo_name": repo_name}


@router.get("/{analysis_id}/status", response_model=AnalysisStatusResponse,
            summary="Poll analysis progress")
async def get_status(analysis_id: str):
    # Check live cache first
    record = analysis_service.get_live(analysis_id)
    if not record:
        record = await get_analysis(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return AnalysisStatusResponse(
        id=record.id,
        status=record.status,
        repo_name=record.repo_name,
        agents=record.agents,
        created_at=record.created_at,
        error=record.error,
    )


@router.get("/{analysis_id}/results", summary="Get full analysis results")
async def get_results(analysis_id: str):
    record = analysis_service.get_live(analysis_id)
    if not record:
        record = await get_analysis(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    if not record.results:
        raise HTTPException(status_code=202, detail="Analysis still running")
    return {
        "id": record.id,
        "repo_name": record.repo_name,
        "status": record.status,
        "language": record.language,
        "framework": record.framework,
        "file_count": record.file_count,
        "results": record.results,
        "created_at": record.created_at,
    }


@router.delete("/{analysis_id}", summary="Delete an analysis")
async def delete_analysis(analysis_id: str):
    import shutil
    record = await get_analysis(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found")
    upload_dir = os.path.join(settings.UPLOAD_DIR, analysis_id)
    if os.path.exists(upload_dir):
        shutil.rmtree(upload_dir, ignore_errors=True)
    return {"deleted": True}
