"""
Agent 1 – Repository Scanner
Reads folder structure, detects language/framework, finds entry points.
"""
from __future__ import annotations

from typing import Any, Dict, List

from agents.base_agent import BaseAgent
from config import settings
from models.agents import (
    DependencyEdge,
    FileNode,
    RepositoryScanResult,
)


class RepositoryAgent(BaseAgent):
    agent_id   = "repository"
    agent_name = "Repository Scanner"

    async def run(self, context: Dict[str, Any]) -> Dict:
        files      = context["files"]
        languages  = context["languages"]
        frameworks = context["frameworks"]
        file_tree  = context["file_tree"]
        total_files = context["total_files"]
        total_lines = context["total_lines"]

        primary_lang = languages[0] if languages else "Unknown"

        # Detect entry points
        entry_points = _find_entry_points(files)

        # Build dependency edges (simple heuristic)
        dep_edges = _build_deps(files) if not settings.MOCK_AI else _mock_deps()

        if settings.MOCK_AI:
            summary = (
                f"This repository contains {total_files} files written primarily in "
                f"{primary_lang}. Detected frameworks: {', '.join(frameworks) or 'none'}. "
                f"Entry points found: {', '.join(entry_points[:3]) or 'none detected'}."
            )
        else:
            prompt = (
                f"Summarize this repository in 2-3 sentences.\n\n"
                f"Languages: {', '.join(languages)}\n"
                f"Frameworks: {', '.join(frameworks)}\n"
                f"Files: {total_files}, Lines: {total_lines}\n"
                f"Entry points: {', '.join(entry_points[:5])}"
            )
            summary = await self.llm(prompt)

        result = RepositoryScanResult(
            languages=languages,
            primary_language=primary_lang,
            frameworks=frameworks,
            entry_points=entry_points,
            file_tree=_dicts_to_nodes(file_tree),
            dependency_graph=dep_edges,
            total_files=total_files,
            total_lines=total_lines,
            summary=summary,
        )
        return result.model_dump()


def _find_entry_points(files: List[Dict]) -> List[str]:
    names = {"main.py", "app.py", "server.py", "index.js", "index.ts",
             "main.ts", "main.go", "App.tsx", "App.jsx", "manage.py",
             "wsgi.py", "asgi.py", "Program.cs"}
    return [f["path"] for f in files if f["path"].split("/")[-1] in names]


def _build_deps(files: List[Dict]) -> List[DependencyEdge]:
    edges = []
    for f in files[:30]:
        content = f.get("content", "")
        path = f["path"]
        for line in content.splitlines()[:20]:
            if "import" in line.lower():
                parts = line.split()
                if len(parts) >= 2:
                    target = parts[-1].strip("\"'").split(".")[0]
                    if target and len(target) < 30:
                        edges.append(DependencyEdge(source=path, target=target))
    return edges[:30]


def _mock_deps() -> List[DependencyEdge]:
    return [
        DependencyEdge(source="frontend/src/App.tsx",    target="react-router-dom"),
        DependencyEdge(source="frontend/src/App.tsx",    target="framer-motion"),
        DependencyEdge(source="backend/main.py",         target="fastapi"),
        DependencyEdge(source="backend/main.py",         target="uvicorn"),
        DependencyEdge(source="backend/agents/base_agent.py", target="ollama"),
    ]


def _dicts_to_nodes(tree: List[Dict]) -> List[FileNode]:
    nodes = []
    for item in tree:
        children = _dicts_to_nodes(item.get("children", []))
        nodes.append(FileNode(
            name=item["name"],
            path=item["path"],
            type=item["type"],
            children=children,
            size=item.get("size"),
        ))
    return nodes
