"""
RepoMind AI – FastAPI Backend Entry Point
"""
import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.analysis import router as analysis_router
from api.reports import router as reports_router
from api.history import router as history_router
from services.database_service import init_db
from config import settings

# ─── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s  %(levelname)-8s  %(name)s – %(message)s",
)
logger = logging.getLogger("repomind")


# ─── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 RepoMind AI backend starting …")
    # Ensure required directories exist
    for d in [settings.UPLOAD_DIR, settings.REPORTS_DIR, "database"]:
        os.makedirs(d, exist_ok=True)
    # Initialize SQLite database
    await init_db()
    logger.info("✅ Database initialized")
    if settings.MOCK_AI:
        logger.info("⚠️  MOCK_AI=true – AI responses will be simulated")
    yield
    logger.info("👋 RepoMind AI backend shutting down")


# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="RepoMind AI",
    description="Multi-Agent GitHub Repository Analyzer",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS – allow the Vite dev server and any localhost port
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(analysis_router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(reports_router,  prefix="/api/reports",  tags=["Reports"])
app.include_router(history_router,  prefix="/api/history",  tags=["History"])


@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "mock_ai": settings.MOCK_AI,
        "ollama_model": settings.OLLAMA_MODEL,
    }

# ─── Serve Frontend Static Files (Render / Production) ────────────────────────
frontend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "dist")

if os.path.exists(frontend_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dir, "assets")), name="assets")

    from fastapi.responses import FileResponse

    @app.get("/{path:path}")
    async def serve_frontend(path: str):
        file_path = os.path.join(frontend_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dir, "index.html"))

