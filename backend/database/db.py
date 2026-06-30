import aiosqlite
import logging
from contextlib import asynccontextmanager
from config import settings

logger = logging.getLogger(__name__)

_db_path = settings.DB_PATH


@asynccontextmanager
async def get_db():
    """Yield a configured aiosqlite connection and safely close it after."""
    conn = await aiosqlite.connect(_db_path)
    try:
        conn.row_factory = aiosqlite.Row
        await conn.execute("PRAGMA journal_mode=WAL")
        await conn.execute("PRAGMA foreign_keys=ON")
        yield conn
    finally:
        await conn.close()

