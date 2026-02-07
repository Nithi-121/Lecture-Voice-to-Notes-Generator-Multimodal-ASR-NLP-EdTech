"""
Configuration management using Pydantic Settings.
Loads environment variables from .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # MongoDB Configuration
    mongodb_uri: str
    database_name: str = "lecture_notes"
    
    # File Upload Configuration
    upload_dir: str = "./uploads"
    max_file_size: int = 104857600  # 100MB
    
    # Optional API Keys
    openai_api_key: Optional[str] = None
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )


# Global settings instance
settings = Settings()
