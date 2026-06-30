"""
Agent 6 – Documentation Generator
"""
from __future__ import annotations

from typing import Any, Dict

from agents.base_agent import BaseAgent
from config import settings
from models.agents import DocumentationResult


class DocumentationAgent(BaseAgent):
    agent_id   = "documentation"
    agent_name = "Documentation Generator"

    async def run(self, context: Dict[str, Any]) -> Dict:
        repo_name  = context["repo_name"]
        languages  = context["languages"]
        frameworks = context["frameworks"]

        if settings.MOCK_AI:
            result = _mock_result(repo_name, languages, frameworks)
        else:
            summary   = context["summary"]
            chunks    = context["chunks"]
            code_ctx  = chunks[0] if chunks else ""
            prompt = (
                f"Generate comprehensive documentation for this repository called '{repo_name}'.\n"
                f"Languages: {', '.join(languages)}\n"
                f"Frameworks: {', '.join(frameworks)}\n\n"
                f"Code sample:\n{code_ctx[:3000]}\n\n"
                "Generate: 1) A professional README.md 2) Installation guide 3) Folder structure guide. "
                "Use markdown format."
            )
            raw = await self.llm(prompt)
            result = DocumentationResult(
                readme=raw,
                folder_guide="See README above.",
                installation_guide="See README above.",
                summary="Documentation generated successfully.",
            )
        return result.model_dump()


def _mock_result(repo_name: str, languages: list, frameworks: list) -> DocumentationResult:
    lang_str = ", ".join(languages[:3]) if languages else "Multiple languages"
    fw_str = ", ".join(frameworks[:4]) if frameworks else "Various frameworks"

    readme = f"""# {repo_name}

> A modern, production-ready application built with {lang_str}.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![{languages[0] if languages else 'Code'}](https://img.shields.io/badge/language-{languages[0] if languages else 'code'}-blue)](/)

## 🚀 Overview

**{repo_name}** is a full-stack web application leveraging {fw_str} to deliver a robust, scalable solution. It follows clean architecture principles with clear separation between the frontend UI, backend API, and data persistence layers.

## ✨ Features

- ⚡ **High Performance** — Async backend with FastAPI for high throughput
- 🔒 **Secure** — JWT authentication, input validation, CORS protection
- 📱 **Responsive UI** — Mobile-first design with React and Tailwind CSS
- 🧪 **Testable** — Clean architecture enables comprehensive unit and integration testing
- 📦 **Docker Ready** — Containerized for easy deployment

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic |
| Database | SQLite, ChromaDB |
| AI/ML | Ollama, Llama 3.2 |

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- Ollama (optional, for AI features)

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/{repo_name.lower().replace(' ', '-')}.git
cd {repo_name.lower().replace(' ', '-')}

# 2. Backend setup
cd backend
python -m venv venv
.\\venv\\Scripts\\activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cp .env.example .env

# 3. Start the backend
uvicorn main:app --reload --port 8000

# 4. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## 📁 Project Structure

```
{repo_name}/
├── backend/
│   ├── agents/          # 8 specialized AI agents
│   ├── api/             # FastAPI route handlers
│   ├── models/          # Pydantic data models
│   ├── services/        # Business logic layer
│   ├── tools/           # Shared utilities
│   ├── database/        # SQLite + ChromaDB
│   └── main.py          # Application entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
│   └── package.json
└── README.md
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| OLLAMA_BASE_URL | http://localhost:11434 | Ollama server URL |
| OLLAMA_MODEL | llama3.2 | LLM model to use |
| MOCK_AI | true | Use mock responses (no Ollama needed) |
| PORT | 8000 | Backend server port |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
"""

    installation_guide = """# Installation Guide

## System Requirements

- **OS**: Windows 10+, macOS 12+, Ubuntu 20.04+
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **RAM**: 4GB minimum (8GB recommended with Ollama)
- **Storage**: 2GB free space

## Step-by-Step Installation

### 1. Install Python Dependencies

```bash
cd backend
python -m venv venv
.\\venv\\Scripts\\activate   # Windows PowerShell
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Edit `.env` and set your configuration.

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. (Optional) Setup Ollama for Real AI

```bash
# Install Ollama from https://ollama.ai
ollama pull llama3.2
ollama pull nomic-embed-text
```

Then set `MOCK_AI=false` in your `.env`.

### 5. Run the Application

Terminal 1 (Backend):
```bash
cd backend
uvicorn main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```
"""

    folder_guide = """# Folder Structure Guide

## Backend

```
backend/
├── main.py              # FastAPI app, CORS, router registration
├── config.py            # Pydantic settings (reads .env)
├── agents/              # AI analysis agents
│   ├── base_agent.py    # Abstract BaseAgent class
│   ├── repository_agent.py   # Agent 1: Scans file structure
│   ├── architecture_agent.py # Agent 2: Explains architecture
│   ├── review_agent.py       # Agent 3: Code quality review
│   ├── security_agent.py     # Agent 4: Security audit
│   ├── performance_agent.py  # Agent 5: Performance analysis
│   ├── documentation_agent.py # Agent 6: Docs generation
│   ├── interview_agent.py    # Agent 7: Interview questions
│   └── scoring_agent.py      # Agent 8: Project scoring
├── api/                 # Route handlers
│   ├── analysis.py      # Upload, GitHub URL, status, results
│   ├── reports.py       # Download Markdown/PDF
│   └── history.py       # Past analyses list
├── models/              # Pydantic data models
│   ├── analysis.py      # AnalysisRecord, Status enums
│   └── agents.py        # Per-agent result models
├── services/            # Business logic
│   ├── analysis_service.py   # Orchestrates full pipeline
│   ├── ollama_service.py     # LLM API wrapper
│   ├── database_service.py   # SQLite operations
│   └── report_service.py     # Markdown/PDF generation
├── tools/               # Shared utilities
│   ├── file_reader.py   # Read and detect languages
│   ├── github_loader.py # Clone GitHub repos
│   ├── vector_store.py  # ChromaDB integration
│   └── summarizer.py    # Chunk text for LLM
└── database/            # Data layer
    └── db.py            # aiosqlite connection
```

## Frontend

```
frontend/src/
├── pages/               # Route-level components
│   ├── LandingPage.tsx  # Hero, features, CTA
│   ├── DashboardPage.tsx # Upload + recent projects
│   ├── ResultsPage.tsx  # 8-tab analysis results
│   └── ReportPage.tsx   # Printable report + download
├── components/          # Reusable UI components
│   ├── layout/          # Sidebar, Navbar
│   ├── upload/          # UploadCard with drag-drop
│   ├── agents/          # AgentProgressPanel
│   ├── results/         # One component per tab
│   └── ui/              # Shared UI primitives
├── hooks/               # Custom React hooks
│   └── useAnalysis.ts   # Analysis polling hook
├── lib/                 # Utilities
│   ├── api.ts           # Axios API client
│   └── utils.ts         # Helper functions
└── types/               # TypeScript interfaces
    └── index.ts
```
"""

    return DocumentationResult(
        readme=readme,
        api_docs=None,
        folder_guide=folder_guide,
        installation_guide=installation_guide,
        summary=f"Generated comprehensive documentation for {repo_name} including README, installation guide, and folder structure guide.",
    )
