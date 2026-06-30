"""
Reads code files from a repository directory, respecting limits.
"""
from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# Extensions to index
CODE_EXTENSIONS = {
    ".py", ".js", ".ts", ".tsx", ".jsx", ".java", ".go", ".rs",
    ".cpp", ".c", ".h", ".cs", ".rb", ".php", ".swift", ".kt",
    ".vue", ".svelte", ".html", ".css", ".scss", ".sql",
    ".yaml", ".yml", ".toml", ".json", ".md", ".env.example",
    ".dockerfile", "Dockerfile", ".sh", ".bash",
}

# Directories to skip
SKIP_DIRS = {
    "node_modules", ".git", "__pycache__", ".venv", "venv", "env",
    "dist", "build", ".next", ".nuxt", "coverage", ".pytest_cache",
    "vendor", "target", ".idea", ".vscode", "*.egg-info",
}

MAX_FILE_CHARS = 8_000   # per file
MAX_TOTAL_CHARS = 200_000  # across all files


def read_repository(root_dir: str) -> Tuple[List[Dict], int, int]:
    """
    Walk the repo and return:
      - list of { path, language, content } dicts
      - total file count
      - total line count
    Truncates files larger than MAX_FILE_CHARS.
    """
    root = Path(root_dir)
    files: List[Dict] = []
    total_chars = 0
    total_lines = 0

    for dirpath, dirnames, filenames in os.walk(root):
        # Prune skipped dirs in-place
        dirnames[:] = [
            d for d in dirnames
            if d not in SKIP_DIRS and not d.startswith(".")
        ]

        for fname in filenames:
            fpath = Path(dirpath) / fname
            suffix = fpath.suffix.lower()

            if suffix not in CODE_EXTENSIONS and fname not in CODE_EXTENSIONS:
                continue

            try:
                content = fpath.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue

            if total_chars >= MAX_TOTAL_CHARS:
                break

            content = content[:MAX_FILE_CHARS]
            total_chars += len(content)
            lines = content.count("\n")
            total_lines += lines

            rel_path = str(fpath.relative_to(root)).replace("\\", "/")
            files.append({
                "path": rel_path,
                "language": _detect_language(suffix),
                "content": content,
                "lines": lines,
            })

    return files, len(files), total_lines


def build_file_tree(root_dir: str, max_depth: int = 5) -> List[Dict]:
    """Return a nested file tree structure."""
    root = Path(root_dir)

    def _walk(p: Path, depth: int) -> Optional[Dict]:
        if depth > max_depth:
            return None
        if p.name in SKIP_DIRS or p.name.startswith("."):
            return None
        if p.is_file():
            return {"name": p.name, "path": str(p.relative_to(root)).replace("\\", "/"),
                    "type": "file", "size": p.stat().st_size, "children": []}
        children = []
        try:
            for child in sorted(p.iterdir(), key=lambda x: (x.is_file(), x.name)):
                node = _walk(child, depth + 1)
                if node:
                    children.append(node)
        except PermissionError:
            pass
        return {"name": p.name, "path": str(p.relative_to(root)).replace("\\", "/"),
                "type": "directory", "children": children}

    result = []
    try:
        for item in sorted(root.iterdir(), key=lambda x: (x.is_file(), x.name)):
            node = _walk(item, 1)
            if node:
                result.append(node)
    except Exception:
        pass
    return result


def detect_languages_and_frameworks(files: List[Dict]) -> Tuple[List[str], str, List[str]]:
    """Detect languages and frameworks from file list."""
    lang_counts: Dict[str, int] = {}
    frameworks: List[str] = []
    all_content = " ".join(f.get("content", "")[:500] for f in files)

    for f in files:
        lang = f.get("language")
        if lang:
            lang_counts[lang] = lang_counts.get(lang, 0) + 1

    # Framework detection
    _fw_signals = {
        "React": ["react", "jsx", "tsx", "useState", "useEffect"],
        "Next.js": ["next/router", "next/image", "getServerSideProps"],
        "Vue": ["vue", "defineComponent", "createApp"],
        "FastAPI": ["fastapi", "from fastapi", "APIRouter"],
        "Django": ["django", "urlpatterns", "INSTALLED_APPS"],
        "Flask": ["from flask", "Flask(__name__)"],
        "Express": ["express()", "app.get(", "app.post("],
        "Docker": ["dockerfile", "FROM ", "RUN ", "EXPOSE"],
        "MongoDB": ["mongoose", "MongoClient", "mongodb"],
        "PostgreSQL": ["psycopg2", "pg.Pool", "asyncpg"],
        "SQLite": ["sqlite3", "aiosqlite"],
        "Redis": ["redis", "aioredis"],
        "Tailwind": ["tailwindcss", "tailwind.config"],
        "TypeScript": [".ts", ".tsx"],
        "Pytest": ["pytest", "def test_"],
    }
    content_lower = all_content.lower()
    for fw, signals in _fw_signals.items():
        if any(s.lower() in content_lower for s in signals):
            frameworks.append(fw)

    langs = sorted(lang_counts.keys(), key=lambda l: -lang_counts[l])
    primary = langs[0] if langs else "Unknown"
    return langs, primary, frameworks


def _detect_language(suffix: str) -> str:
    _map = {
        ".py": "Python", ".js": "JavaScript", ".ts": "TypeScript",
        ".tsx": "TypeScript", ".jsx": "JavaScript", ".java": "Java",
        ".go": "Go", ".rs": "Rust", ".cpp": "C++", ".c": "C",
        ".cs": "C#", ".rb": "Ruby", ".php": "PHP", ".swift": "Swift",
        ".kt": "Kotlin", ".vue": "Vue", ".svelte": "Svelte",
        ".html": "HTML", ".css": "CSS", ".scss": "SCSS",
        ".sql": "SQL", ".yaml": "YAML", ".yml": "YAML",
        ".toml": "TOML", ".json": "JSON", ".md": "Markdown",
        ".sh": "Shell", ".bash": "Shell",
    }
    return _map.get(suffix, "Text")
