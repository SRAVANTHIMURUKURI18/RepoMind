"""
ChromaDB vector store wrapper for semantic code search.
"""
from __future__ import annotations

import logging
from typing import List, Dict

from config import settings

logger = logging.getLogger(__name__)


class VectorStore:
    """Manages ChromaDB collections for repository code chunks."""

    def __init__(self, analysis_id: str):
        self.analysis_id = analysis_id
        self._client = None
        self._collection = None

    def _get_client(self):
        if self._client is None:
            try:
                import chromadb  # type: ignore
                self._client = chromadb.PersistentClient(path=settings.CHROMA_PATH)
            except ImportError:
                logger.warning("ChromaDB not installed; vector search disabled")
                return None
        return self._client

    def index_files(self, files: List[Dict]) -> bool:
        """Embed and store code files. Returns True on success."""
        client = self._get_client()
        if not client or settings.MOCK_AI:
            logger.info("Skipping ChromaDB indexing (mock mode or not available)")
            return False
        try:
            import chromadb.utils.embedding_functions as ef  # type: ignore
            embed_fn = ef.OllamaEmbeddingFunction(
                url=f"{settings.OLLAMA_BASE_URL}/api/embeddings",
                model_name=settings.EMBED_MODEL,
            )
            coll = client.get_or_create_collection(
                name=f"repo_{self.analysis_id}",
                embedding_function=embed_fn,
            )
            docs, ids, metas = [], [], []
            for i, f in enumerate(files):
                chunk = f"{f['path']}\n{f['content']}"[:4000]
                docs.append(chunk)
                ids.append(f"{self.analysis_id}_{i}")
                metas.append({"path": f["path"], "language": f["language"]})

            if docs:
                coll.add(documents=docs, ids=ids, metadatas=metas)
            self._collection = coll
            return True
        except Exception as exc:
            logger.error("ChromaDB indexing failed: %s", exc)
            return False

    def search(self, query: str, n_results: int = 5) -> List[Dict]:
        """Semantic search over indexed code."""
        if not self._collection:
            return []
        try:
            results = self._collection.query(query_texts=[query], n_results=n_results)
            docs = results.get("documents", [[]])[0]
            metas = results.get("metadatas", [[]])[0]
            return [{"content": d, "metadata": m} for d, m in zip(docs, metas)]
        except Exception as exc:
            logger.error("ChromaDB search failed: %s", exc)
            return []
