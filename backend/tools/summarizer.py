"""
Text summarizer / chunker for large codebases.
"""
from __future__ import annotations

from typing import List


def chunk_files(files: List[dict], max_chars: int = 12_000) -> List[str]:
    """
    Concatenate file contents into chunks no larger than max_chars.
    Each chunk is a formatted string ready to pass to the LLM.
    """
    chunks: List[str] = []
    current = ""

    for f in files:
        block = f"### {f['path']} ({f['language']})\n```\n{f['content']}\n```\n\n"
        if len(current) + len(block) > max_chars and current:
            chunks.append(current)
            current = block
        else:
            current += block

    if current:
        chunks.append(current)

    return chunks


def build_context_summary(files: List[dict], languages: List[str], frameworks: List[str]) -> str:
    """Build a compact context string describing the repository."""
    file_list = "\n".join(f"  - {f['path']} ({f['language']})" for f in files[:40])
    return (
        f"Repository Overview:\n"
        f"Languages: {', '.join(languages)}\n"
        f"Frameworks/Libraries: {', '.join(frameworks)}\n"
        f"Files ({len(files)} total):\n{file_list}\n"
    )
