import asyncio
import json
import logging
import os

from rich.console import Console
from websockets.server import WebSocketServerProtocol, serve

console = Console()

# Configure logging
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
log_file = os.getenv("LOG_FILE", "syrphid_server.log")

logging.basicConfig(
    level=log_level, format=log_format, handlers=[logging.FileHandler(log_file), logging.StreamHandler()]
)

logger = logging.getLogger(__name__)


async def websocket_endpoint(websocket: WebSocketServerProtocol) -> None:
    async for message in websocket:
        data = json.loads(message)
        console.print(data)


async def run() -> None:
    async with serve(websocket_endpoint, "localhost", 8080):
        logger.info("Server listening on ws://localhost:8080")
        await asyncio.Future()  # Run forever


if __name__ == "__main__":
    asyncio.run(run())
