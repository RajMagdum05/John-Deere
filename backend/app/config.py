from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = Field(
        default="postgresql://jd_user:jd_password_2026@localhost:5432/john_deere_efficiency",
        description="PostgreSQL Database Connection URL",
    )
    JOHN_DEERE_CLIENT_ID: str = Field(
        default="your_client_id",
        description="John Deere OAuth Client ID",
    )
    JOHN_DEERE_CLIENT_SECRET: str = Field(
        default="your_client_secret",
        description="John Deere OAuth Client Secret",
    )
    JOHN_DEERE_ORG_ID: str = Field(
        default="your_org_id",
        description="John Deere Organization ID",
    )
    JOHN_DEERE_SANDBOX_URL: str = Field(
        default="https://sandboxapi.deere.com",
        description="John Deere Sandbox API Base URL",
    )
    JOHN_DEERE_AUTH_URL: str = Field(
        default="https://sandboxapi.deere.com/oauth/authorize",
        description="John Deere OAuth Authorization URL",
    )
    JWT_SECRET_KEY: str = Field(
        default="your_secret_key",
        description="JWT Secret Key for authentication",
    )
    GEMINI_API_KEY: str = Field(
        default="",
        description="Google Gemini API Key",
    )
    GEMINI_MODEL: str = Field(
        default="gemini-1.5-flash",
        description="Google Gemini Model Name",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Direct export aliases for convenience
GEMINI_API_KEY = settings.GEMINI_API_KEY
GEMINI_MODEL = settings.GEMINI_MODEL

