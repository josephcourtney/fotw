import asyncio
import json
import logging

import websockets

from config import WEBSOCKET_HOST, WEBSOCKET_PORT
from database import get_session
from events import EventHandler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def handler(websocket):
    with get_session() as session:
        service = EventHandler(session)
        async for message in websocket:
            try:
                data = json.loads(message)
                await service.process_event(data)
            except json.JSONDecodeError:
                logger.exception("Error decoding JSON")
            except Exception as e:
                logger.exception("Error processing message: %s", e)


async def main():
    async with websockets.serve(handler, WEBSOCKET_HOST, WEBSOCKET_PORT):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
