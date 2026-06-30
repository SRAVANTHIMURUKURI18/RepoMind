"""
Ollama LLM service with mock mode support.
"""
from __future__ import annotations

import json
import logging
from typing import Any, Dict, Optional

import httpx

from config import settings

logger = logging.getLogger(__name__)


class OllamaService:
    """Thin wrapper around the Ollama REST API with mock fallback."""

    def __init__(self) -> None:
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.mock = settings.MOCK_AI

    # ─── Public API ───────────────────────────────────────────────────────────

    async def generate(self, prompt: str, system: str = "", json_mode: bool = False) -> str:
        """Return a text completion. Falls back to mock if MOCK_AI=true."""
        if self.mock:
            return self._mock_response(prompt)

        payload: Dict[str, Any] = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.3, "num_predict": 2048},
        }
        if system:
            payload["system"] = system
        if json_mode:
            payload["format"] = "json"

        try:
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(f"{self.base_url}/api/generate", json=payload)
                resp.raise_for_status()
                data = resp.json()
                return data.get("response", "")
        except Exception as exc:
            logger.error("Ollama error: %s", exc)
            raise RuntimeError(f"Ollama request failed: {exc}") from exc

    async def generate_json(self, prompt: str, system: str = "") -> Dict[str, Any]:
        """Return parsed JSON from LLM."""
        raw = await self.generate(prompt, system=system, json_mode=True)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # Try to extract JSON block from markdown
            import re
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL)
            if match:
                return json.loads(match.group(1))
            logger.warning("Could not parse JSON from LLM response")
            return {}

    # ─── Mock responses ───────────────────────────────────────────────────────

    def _mock_response(self, prompt: str) -> str:
        """Return a plausible mock response based on prompt keywords."""
        prompt_lower = prompt.lower()
        if "security" in prompt_lower:
            return _MOCK_SECURITY
        if "performance" in prompt_lower:
            return _MOCK_PERFORMANCE
        if "architecture" in prompt_lower:
            return _MOCK_ARCHITECTURE
        if "interview" in prompt_lower:
            return _MOCK_INTERVIEW
        if "documentation" in prompt_lower or "readme" in prompt_lower:
            return _MOCK_DOCS
        if "score" in prompt_lower or "rating" in prompt_lower:
            return _MOCK_SCORE
        return _MOCK_REVIEW


# ─── Mock data strings ────────────────────────────────────────────────────────

_MOCK_ARCHITECTURE = """
## Architecture Overview

This is a well-structured full-stack web application following a clean separation of concerns pattern.

### Folder Structure
The project is organized into distinct layers:
- **frontend/** – React/TypeScript UI with component-based architecture
- **backend/** – FastAPI REST API server
- **database/** – Data persistence layer

### Request Flow
1. User interacts with React frontend
2. Axios sends HTTP requests to FastAPI backend
3. FastAPI validates requests via Pydantic models
4. Business logic executes in service layer
5. Data persisted to SQLite/ChromaDB
6. Response serialized and returned to client

### API Design
RESTful API with versioned endpoints (`/api/v1/`). Uses async handlers throughout for high throughput. Pydantic models ensure strict input validation.

### Authentication
JWT-based authentication with refresh tokens. Passwords hashed using bcrypt. Middleware validates tokens on protected routes.

### Database Design
SQLite for relational data (users, analyses, reports). ChromaDB for vector embeddings enabling semantic code search.
"""

_MOCK_SECURITY = """
Found several security considerations that should be addressed:

1. **Hardcoded API Keys** – Found potential API keys in configuration files that should be moved to environment variables.
2. **Missing Input Validation** – Some endpoints lack strict input sanitization which could lead to injection attacks.
3. **CORS Configuration** – CORS is currently set to allow all origins in development; should be restricted in production.
4. **SQL Injection Risk** – Raw string interpolation found in one database query; use parameterized queries instead.
5. **Missing Rate Limiting** – No rate limiting on authentication endpoints, leaving them vulnerable to brute force.
"""

_MOCK_PERFORMANCE = """
Performance analysis identified several optimization opportunities:

1. **N+1 Query Problem** – Database queries inside loops detected in user listing endpoint.
2. **Missing Caching** – Frequently accessed data (config, user roles) re-fetched on every request.
3. **Synchronous File I/O** – Some file operations block the event loop; should use aiofiles.
4. **No Connection Pooling** – Database connections opened per-request; implement a connection pool.
5. **Unoptimized Bundle** – Frontend bundle not code-split; large initial load time expected.
"""

_MOCK_REVIEW = """
Code review completed. The codebase follows generally good practices with some areas for improvement:

1. **Long Functions** – Several functions exceed 50 lines and should be decomposed.
2. **Magic Numbers** – Numeric constants used inline without named variables.
3. **Inconsistent Naming** – Mix of camelCase and snake_case in some modules.
4. **Missing Error Handling** – Some async operations lack try/catch blocks.
5. **Duplicate Logic** – Validation logic repeated across multiple route handlers.
"""

_MOCK_INTERVIEW = """
Generated interview questions covering multiple difficulty levels:

**Beginner:**
- What is the difference between GET and POST HTTP methods?
- What is a REST API?
- What is the purpose of a package.json file?

**Intermediate:**
- Explain how JWT authentication works end-to-end.
- What are the advantages of using async/await over callbacks?
- How does React's virtual DOM improve performance?

**Advanced:**
- How would you implement horizontal scaling for this application?
- Explain the CAP theorem and how it applies to the database choices made here.
- How would you add real-time features using WebSockets?

**System Design:**
- How would you redesign this to handle 1 million concurrent users?
- Design a caching strategy for the most expensive database queries.
"""

_MOCK_DOCS = """
# Project Documentation

## Overview
This project is a full-stack web application built with modern technologies providing a robust, scalable solution.

## Installation

```bash
# Clone repository
git clone <repo-url>
cd project

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend setup
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /health  | Health check |
| POST   | /api/analysis/upload | Upload ZIP for analysis |
| GET    | /api/analysis/:id/status | Poll analysis status |

## Environment Variables

Copy `.env.example` to `.env` and configure as needed.
"""

_MOCK_SCORE = """
Project scoring complete based on comprehensive analysis:

- Architecture: 8.7/10 – Well-structured with clear separation of concerns
- Security: 6.8/10 – Some vulnerabilities need addressing
- Performance: 7.9/10 – Good async usage, some optimization opportunities
- Documentation: 5.5/10 – Basic docs present but needs expansion
- Maintainability: 8.2/10 – Clean code with consistent style
- Overall: 7.4/10 – Solid project with room for improvement
"""


# Singleton
ollama_service = OllamaService()
