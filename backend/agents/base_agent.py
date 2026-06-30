"""
Abstract base class for all RepoMind AI agents.
"""
from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod
from typing import Any, Dict

from services.ollama_service import ollama_service

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Every agent must implement `run(context) -> dict`."""

    agent_id:   str = "base"
    agent_name: str = "Base Agent"

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Wrapper that adds timing and error handling around `run`."""
        t0 = time.monotonic()
        logger.info("[%s] starting …", self.agent_name)
        try:
            result = await self.run(context)
            elapsed = time.monotonic() - t0
            logger.info("[%s] completed in %.1fs", self.agent_name, elapsed)
            return {"status": "completed", "data": result, "elapsed_seconds": elapsed}
        except Exception as exc:
            elapsed = time.monotonic() - t0
            logger.error("[%s] failed after %.1fs: %s", self.agent_name, elapsed, exc)
            return {"status": "failed", "error": str(exc), "elapsed_seconds": elapsed}

    @abstractmethod
    async def run(self, context: Dict[str, Any]) -> Any:
        """
        Parameters
        ----------
        context : dict with keys:
            files       – list of {path, language, content, lines}
            languages   – list of detected language names
            frameworks  – list of detected frameworks
            file_tree   – nested tree structure
            repo_name   – repository name
            summary     – compact text summary of the repo
            chunks      – list of text chunks (for LLM context)
        """
        ...

    async def llm(self, prompt: str, system: str = "") -> str:
        """Shortcut to call the LLM."""
        return await ollama_service.generate(prompt, system=system)
