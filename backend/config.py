"""
Application settings loaded from environment / .env file.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"
    EMBED_MODEL: str = "nomic-embed-text"
    MOCK_AI: bool = True
    PORT: int = 8000
    UPLOAD_DIR: str = "uploads"
    REPORTS_DIR: str = "reports"
    DB_PATH: str = "database/repomind.db"
    CHROMA_PATH: str = "database/chroma"
    MAX_FILE_SIZE_MB: int = 50
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
