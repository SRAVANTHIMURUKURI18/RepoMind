# RepoMind AI

> **Understand any codebase in minutes using 8 specialized AI agents.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Overview

RepoMind AI is a production-ready full-stack web application that analyzes GitHub repositories using 8 specialized AI agents:

| Agent | Purpose |
|-------|---------|
| 🔍 Repository Scanner | Detects languages, frameworks, entry points |
| 🏛️ Architecture Explainer | Explains folder structure, request flow, API design |
| 📋 Code Reviewer | Finds code smells, duplicates, long functions |
| 🛡️ Security Reviewer | Detects SQLi, XSS, hardcoded secrets |
| ⚡ Performance Analyzer | Spots N+1 queries, async opportunities |
| 📚 Documentation Generator | Creates README, API docs, folder guides |
| 🎤 Interview Generator | Generates tiered interview questions |
| 📈 Project Scorer | Scores architecture, security, performance |

## 🛠️ Tech Stack

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion

**Backend:** Python + FastAPI + SQLite + ChromaDB + Ollama (Llama 3.2)

## ⚡ Quick Start

### 1. Clone & Navigate
```bash
git clone <repo-url>
cd "RepoMind AI"
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
```

### 3. Start Backend (Terminal 1)
```bash
cd backend
uvicorn main:app --reload --port 8000
```

Visit http://localhost:8000/docs for the Swagger API docs.

### 4. Frontend Setup (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## ⚙️ Configuration

Edit `backend/.env`:

```env
MOCK_AI=true          # true = use mock data (no Ollama needed)
OLLAMA_MODEL=llama3.2 # change to qwen2.5 if preferred
PORT=8000
```

### Using Real AI (Ollama)
1. [Install Ollama](https://ollama.ai)
2. Pull models: `ollama pull llama3.2` and `ollama pull nomic-embed-text`
3. Set `MOCK_AI=false` in `.env`

## 📁 Project Structure

```
RepoMind AI/
├── backend/
│   ├── agents/        # 8 AI agents
│   ├── api/           # FastAPI routes
│   ├── models/        # Pydantic models
│   ├── services/      # Business logic
│   ├── tools/         # File reader, git loader, vector store
│   ├── database/      # SQLite helpers
│   ├── main.py        # App entry point
│   └── .env           # Configuration
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI
│   │   ├── pages/      # Route pages
│   │   ├── hooks/      # useAnalysis hook
│   │   ├── lib/        # API client, utils
│   │   └── types/      # TypeScript types
│   └── package.json
└── README.md
```

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/analysis/upload` | Upload ZIP |
| `POST` | `/api/analysis/github` | Analyze GitHub URL |
| `GET` | `/api/analysis/{id}/status` | Poll progress |
| `GET` | `/api/analysis/{id}/results` | Get results |
| `GET` | `/api/reports/{id}/markdown` | Download report |
| `GET` | `/api/history/` | List past analyses |

## 📄 License

MIT
