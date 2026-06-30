"""
GitHub repository loader using GitPython.
"""
from __future__ import annotations

import logging
import os
import shutil
from pathlib import Path
from typing import Optional

from config import settings

logger = logging.getLogger(__name__)


def clone_repo(github_url: str, dest_dir: str) -> str:
    """
    Clone a GitHub repository to dest_dir.
    Returns the path of the cloned repo directory.
    Raises RuntimeError if git or GitPython is unavailable.
    """
    try:
        import git  # type: ignore
    except ImportError:
        raise RuntimeError("GitPython is not installed. Run: pip install gitpython")

    try:
        logger.info("Cloning %s → %s", github_url, dest_dir)
        if os.path.exists(dest_dir):
            shutil.rmtree(dest_dir)
        git.Repo.clone_from(github_url, dest_dir, depth=1)
        logger.info("Clone completed: %s", dest_dir)
        return dest_dir
    except git.exc.GitCommandError as exc:
        raise RuntimeError(f"Git clone failed: {exc}") from exc
    except Exception as exc:
        raise RuntimeError(f"Unexpected error during clone: {exc}") from exc


def extract_repo_name(github_url: str) -> str:
    """Extract repository name from a GitHub URL."""
    url = github_url.rstrip("/")
    # Handle .git suffix
    if url.endswith(".git"):
        url = url[:-4]
    return url.split("/")[-1] or "unknown-repo"
