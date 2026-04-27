import os
from pydantic_settings import BaseSettings

# Resolve the backend root directory (one level up from this file's directory)
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings(BaseSettings):
    FRONTEND_URL: str = "http://localhost:5173"
    # Default to absolute path so models load regardless of CWD
    MODEL_DIR: str = os.path.join(_BACKEND_DIR, "trained_models")
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
