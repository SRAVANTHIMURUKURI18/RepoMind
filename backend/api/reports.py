"""
Reports API – download Markdown and PDF reports.
"""
from __future__ import annotations

import logging
import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from services.database_service import get_analysis, get_report_path, save_report
from services.report_service import generate_markdown_report, generate_pdf_report

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{analysis_id}/markdown", summary="Download Markdown report")
async def download_markdown(analysis_id: str):
    record = await get_analysis(analysis_id)
    if not record or not record.results:
        raise HTTPException(status_code=404, detail="Analysis not found or not completed")

    path = await get_report_path(analysis_id, "markdown")
    if not path or not os.path.exists(path):
        path = generate_markdown_report(analysis_id, record.repo_name, record.results)
        await save_report(analysis_id, "markdown", path)

    return FileResponse(
        path,
        media_type="text/markdown",
        filename=f"{record.repo_name}_report.md",
    )


@router.get("/{analysis_id}/pdf", summary="Download PDF report")
async def download_pdf(analysis_id: str):
    record = await get_analysis(analysis_id)
    if not record or not record.results:
        raise HTTPException(status_code=404, detail="Analysis not found or not completed")

    path = await get_report_path(analysis_id, "pdf")
    if not path or not os.path.exists(path):
        path = generate_pdf_report(analysis_id, record.repo_name, record.results)
        await save_report(analysis_id, "pdf", path)

    media_type = "application/pdf" if path.endswith(".pdf") else "text/plain"
    return FileResponse(
        path,
        media_type=media_type,
        filename=f"{record.repo_name}_report.pdf",
    )
