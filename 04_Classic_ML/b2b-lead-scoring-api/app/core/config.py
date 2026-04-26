from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Milion Dolar B2B — Lead Scoring API"
    app_version: str = "1.0.0"
    debug: bool = False
    api_key: str = "dev-secret-change-in-production"

    # Model hyperparams (pot fi tuned fără cod)
    model_hidden_size: int = 16
    model_learning_rate: float = 0.1
    model_epochs: int = 1000

    # Path pentru model persistence
    model_path: str = "model.pkl"


settings = Settings()
