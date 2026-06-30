"""
Agent 2 – Architecture Explainer
"""
from __future__ import annotations

from typing import Any, Dict

from agents.base_agent import BaseAgent
from config import settings
from models.agents import ArchitectureResult, ArchitectureSection


class ArchitectureAgent(BaseAgent):
    agent_id   = "architecture"
    agent_name = "Architecture Explainer"

    async def run(self, context: Dict[str, Any]) -> Dict:
        frameworks = context["frameworks"]
        summary    = context["summary"]
        chunks     = context["chunks"]

        if settings.MOCK_AI:
            result = _mock_result(context)
        else:
            code_ctx = chunks[0] if chunks else ""
            prompt = (
                f"You are a senior software architect. Analyze this codebase and explain its architecture "
                f"clearly, like explaining to a junior developer.\n\n"
                f"Context:\n{summary}\n\nCode sample:\n{code_ctx}\n\n"
                f"Explain: 1) Folder structure 2) Request flow 3) API design "
                f"4) Database design 5) Authentication pattern. Be specific and helpful."
            )
            raw = await self.llm(prompt)
            result = _parse_result(raw, frameworks)

        return result.model_dump()


def _mock_result(ctx: Dict) -> ArchitectureResult:
    frameworks = ctx.get("frameworks", [])
    languages  = ctx.get("languages", ["Python"])
    return ArchitectureResult(
        overview=(
            "This is a well-structured full-stack web application using a clean separation of concerns pattern. "
            "The backend exposes a RESTful API consumed by a modern React frontend, with data persisted in "
            "a relational database. The architecture is designed for scalability and maintainability."
        ),
        tech_stack=languages + frameworks,
        request_flow=(
            "1. User interacts with the React frontend (browser)\n"
            "2. Axios sends HTTP requests to the FastAPI backend\n"
            "3. FastAPI validates inputs via Pydantic models\n"
            "4. Business logic executes in the service layer\n"
            "5. Data is persisted to SQLite/ChromaDB\n"
            "6. JSON response is serialized and returned to the client\n"
            "7. React state updates and re-renders the UI"
        ),
        sections=[
            ArchitectureSection(
                title="📁 Folder Structure",
                description="The project follows a domain-driven directory layout with clear separation between frontend and backend concerns.",
                details=[
                    "frontend/ – React/TypeScript UI with components, pages, hooks",
                    "backend/ – FastAPI REST API with modular router architecture",
                    "agents/ – 8 specialized AI agents each in their own module",
                    "tools/ – Shared utilities (file reader, git loader, vector store)",
                    "services/ – Business logic layer separating API from data access",
                    "models/ – Pydantic data models for request/response validation",
                ]
            ),
            ArchitectureSection(
                title="🔄 Request Flow",
                description="Requests follow a clean unidirectional flow from client to database and back.",
                details=[
                    "Client → React component triggers user action",
                    "API layer → Axios HTTP call to FastAPI endpoint",
                    "Validation → Pydantic models validate request body/params",
                    "Service layer → Business logic, orchestrates agents",
                    "Data layer → SQLite for records, ChromaDB for embeddings",
                ]
            ),
            ArchitectureSection(
                title="🌐 API Design",
                description="RESTful API with resource-based URL structure and consistent JSON responses.",
                details=[
                    "POST /api/analysis/upload – Submit ZIP for analysis",
                    "POST /api/analysis/github – Submit GitHub URL",
                    "GET  /api/analysis/{id}/status – Poll agent progress",
                    "GET  /api/analysis/{id}/results – Fetch full results",
                    "GET  /api/reports/{id}/markdown – Download report",
                    "GET  /api/history – List past analyses",
                ]
            ),
            ArchitectureSection(
                title="🗄️ Database Design",
                description="Two-database strategy: relational for structured data, vector for semantic search.",
                details=[
                    "SQLite – analyses, reports, history tables with WAL mode",
                    "ChromaDB – per-analysis vector collections for code embeddings",
                    "Automatic migration on startup via init_db()",
                ]
            ),
            ArchitectureSection(
                title="🔐 Authentication",
                description="Stateless JWT-based authentication suitable for horizontal scaling.",
                details=[
                    "JWT tokens with configurable expiry",
                    "bcrypt password hashing (never stored in plain text)",
                    "FastAPI Depends() middleware for route protection",
                    "Refresh token pattern for seamless re-authentication",
                ]
            ),
        ],
        api_design="RESTful with versioned endpoints, Pydantic validation, async handlers.",
        auth_pattern="JWT Bearer token in Authorization header. Tokens signed with HS256.",
        database_design="SQLite (relational) + ChromaDB (vectors) dual-database strategy.",
    )


def _parse_result(raw: str, frameworks: list) -> ArchitectureResult:
    return ArchitectureResult(
        overview=raw[:500],
        tech_stack=frameworks,
        request_flow=raw,
        sections=[
            ArchitectureSection(title="Analysis", description=raw[:800], details=[]),
        ],
    )
