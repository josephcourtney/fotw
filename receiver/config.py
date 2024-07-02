import json
import logging
import os
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Config:
    def __init__(self, config_file: str):
        config_path = Path(config_file)
        if not config_path.exists():
            logger.error("Config file not found: %s", config_file)
            msg = f"No such file or directory: '{config_file}'"
            raise FileNotFoundError(msg)
        self.config = json.loads(config_path.read_text())

    def get(self, key: str, default: str | None = None) -> str:
        return os.getenv(key, self.config.get(key, default))


config = Config("config.json")

DATABASE_URL = config.get("DATABASE_URL")
WEBSOCKET_HOST = config.get("WEBSOCKET_HOST")
WEBSOCKET_PORT = int(config.get("WEBSOCKET_PORT"))
EVENT_TYPES = config.get("EVENT_TYPES")
