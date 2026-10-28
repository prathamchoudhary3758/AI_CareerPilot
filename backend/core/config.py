import os
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="allow")
    
    app_name: str = "AI Career Co-Pilot API"
    app_version: str = "0.1.0"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # LLM & Embedding provider keys
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    
    # Storage / DB Paths
    chroma_db_dir: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "chroma")

@lru_cache()
def get_settings() -> Settings:
    return Settings()
