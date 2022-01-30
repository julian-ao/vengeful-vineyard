"""
Application settings.

Values can be overridden by environment variables.
VENGEFUL_DATABASE=test.db will set vengeful_database="test.db"
"""
from pydantic import BaseSettings


class Settings(BaseSettings):
    vengeful_database: str = ":memory:"
    max_punishment_types: int = 10
    max_groups_per_user: int = 20
    max_active_punishments_per_group: int = 1000
    max_group_members: int = 300
    schema_file: str = "schema.sql"
    debug: bool = True


settings = Settings()
