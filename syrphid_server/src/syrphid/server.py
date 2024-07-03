import asyncio
import json
import logging
import signal
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Any

import isodate
import websockets
from pydantic import BaseModel, Field, ValidationError
from pydantic_settings import BaseSettings
from sqlalchemy.engine.interfaces import Dialect
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker
from sqlalchemy.types import String, TypeDecorator
from sqlmodel import Field as SQLField
from sqlmodel import Relationship, Session, SQLModel, create_engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_MESSAGE_SIZE = 10 * 1024 * 1024  # Set maximum message size to 10 MB


class Settings(BaseSettings):
    database_url: str
    websocket_host: str
    websocket_port: int

    class Config:
        env_file = "config/.env"


settings = Settings()


def utcnow() -> datetime:
    """Return the current UTC time."""
    return datetime.now(tz=UTC)


class ISO8601UTCDateTime(TypeDecorator):
    """A custom SQLAlchemy type for storing datetime values in ISO 8601 format with UTC timezone."""

    impl = String
    cache_ok = True

    @staticmethod
    def process_bind_param(value: datetime | None, dialect: Dialect) -> str | None:
        if value is None:
            return None
        if value.utcoffset() is None:
            value = value.replace(tzinfo=UTC)
        return value.astimezone(UTC).isoformat()

    @staticmethod
    def process_result_value(value: str | None, dialect: Dialect) -> datetime | None:
        if value is None:
            return None
        try:
            dt = datetime.fromisoformat(value)
            if dt.utcoffset() is None:
                dt = dt.replace(tzinfo=UTC)
        except ValueError:
            return None
        else:
            return dt


class ISO8601Duration(TypeDecorator):
    """A custom SQLAlchemy type for storing timedelta values in ISO 8601 duration format."""

    impl = String
    cache_ok = True

    @staticmethod
    def process_bind_param(value: timedelta | None, dialect: Dialect) -> str | None:
        return None if value is None else isodate.duration_isoformat(value)

    @staticmethod
    def process_result_value(value: str | None, dialect: Dialect) -> timedelta | None:
        if value is None:
            return None
        try:
            return isodate.parse_duration(value)
        except (isodate.isoerror.ISO8601Error, ValueError):
            return None


def parse_iso8601_datetime(value: str) -> datetime:
    dt = datetime.fromisoformat(value)
    if dt.utcoffset() is None:
        dt = dt.replace(tzinfo=UTC)
    return dt


def parse_iso8601_duration(value: str) -> timedelta:
    return isodate.parse_duration(value)


class EventType(Enum):
    NETWORK_REQUEST = "network_request"
    NETWORK_RESPONSE = "network_response"
    USER_INTERACTION = "user_interaction"
    CLICK = "click"
    KEYBOARD = "keyboard"
    TOUCH = "touch"
    GENERIC_EVENT = "generic_event"
    NAVIGATION = "navigation"
    TAB_ACTIVATED = "tab_activated"
    AJAX_REQUEST = "ajax_request"
    FETCH_REQUEST = "fetch_request"
    VISIBILITYCHANGE = "visibilitychange"
    BATTERY_STATUS = "battery_status"
    GEOLOCATION = "geolocation"
    GEOLOCATION_ERROR = "geolocation_error"
    NETWORK_STATUS = "network_status"


class Base(SQLModel):
    id: int | None = SQLField(default=None, primary_key=True)


class Event(Base, table=True):
    type: str
    timestamp: datetime
    session_id: str
    sequence_number: int
    user_agent: str
    extension_version: str
    operating_system: str
    browser_version: str | None = None
    screen_resolution: str
    page_session_id: str | None = None
    tab_id: int | None = SQLField(default=None, index=True)
    url: str | None = None
    initiator: str | None = None
    target: str | None = None  # JSON serialized TargetData
    additional_data: str | None = None  # JSON serialized additionalData
    network_requests: list["NetworkRequest"] = Relationship(back_populates="event")
    network_responses: list["NetworkResponse"] = Relationship(back_populates="event")
    user_interactions: list["UserInteraction"] = Relationship(back_populates="event")


class NetworkRequest(Base, table=True):
    method: str
    url: str | None = None
    status: int | None = None
    response: str | None = None
    stack: str | None = None
    initiator: str | None = None
    headers: str | None = None
    body: str | None = None
    event_id: int = SQLField(foreign_key="event.id", index=True)
    event: "Event" = Relationship(back_populates="network_requests")


class NetworkResponse(Base, table=True):
    url: str | None = None
    status_code: int
    response: str | None = None
    event_id: int = SQLField(foreign_key="event.id", index=True)
    event: "Event" = Relationship(back_populates="network_responses")


class UserInteraction(Base, table=True):
    event_type: EventType
    target: str  # JSON serialized TargetData
    details: str | None = None  # JSON serialized additionalData
    event_id: int = SQLField(foreign_key="event.id", index=True)
    event: "Event" = Relationship(back_populates="user_interactions")
    mouse_events: list["MouseEventDetails"] = Relationship(back_populates="interaction")
    key_events: list["KeyEventDetails"] = Relationship(back_populates="interaction")
    touch_points: list["TouchPointDetails"] = Relationship(back_populates="interaction")


class MouseEventDetails(Base, table=True):
    interaction_id: int = SQLField(foreign_key="userinteraction.id", index=True)
    client_x: int
    client_y: int
    button: int | None = None
    buttons: int | None = None
    ctrl_key: bool
    shift_key: bool
    alt_key: bool
    meta_key: bool
    movement_x: float | None = None
    movement_y: float | None = None
    interaction: "UserInteraction" = Relationship(back_populates="mouse_events")


class KeyEventDetails(Base, table=True):
    interaction_id: int = SQLField(foreign_key="userinteraction.id", index=True)
    key: str
    code: str
    key_code: int
    char_code: int | None = None
    which: int
    ctrl_key: bool
    shift_key: bool
    alt_key: bool
    meta_key: bool
    repeat: bool
    is_composing: bool | None = None
    interaction: "UserInteraction" = Relationship(back_populates="key_events")


class TouchPointDetails(Base, table=True):
    interaction_id: int = SQLField(foreign_key="userinteraction.id", index=True)
    client_x: int
    client_y: int
    force: float
    identifier: int
    radius_x: float
    radius_y: float
    rotation_angle: float
    screen_x: int
    screen_y: int
    target: str
    interaction: "UserInteraction" = Relationship(back_populates="touch_points")


class TargetData(BaseModel):
    tag_name: str | None = Field(None, alias="tagName")
    id: str | None = None
    class_name: str | None = Field(None, alias="className")
    name: str | None = None
    inner_text: str | None = Field(None, alias="innerText")
    inner_html: str | None = Field(None, alias="innerHTML")
    outer_html: str | None = Field(None, alias="outerHTML")
    rect: dict[str, float | None] = {}


class EventData(BaseModel):
    type: str
    timestamp: str | None = None
    session_id: str
    sequence_number: int
    user_agent: str
    extension_version: str
    operating_system: str
    browser_version: str | None = None
    screen_resolution: dict[str, int]
    page_session_id: str | None = Field(None, alias="pageSessionId")
    tab_id: int | None = Field(None, alias="tabId")
    url: str | None = None
    initiator: str | None = None
    target: TargetData | None = None
    additional_data: dict[str, Any] | None = Field(None, alias="additionalData")


class NetworkRequestData(BaseModel):
    method: str
    url: str | None = None
    status: int | None = None
    response: str | None = None
    stack: str | None = None
    initiator: str | None = None
    headers: dict[str, Any] | None = None
    body: str | None = None


class NetworkResponseData(BaseModel):
    url: str | None = None
    status_code: int = Field(..., alias="statusCode")
    response: str | None = None


class UserInteractionData(BaseModel):
    event: str
    target: TargetData
    additional_data: dict[str, Any] = Field(None, alias="additionalData")


class MouseEventData(BaseModel):
    client_x: int = Field(..., alias="clientX")
    client_y: int = Field(..., alias="clientY")
    button: int | None = None
    buttons: int | None = None
    ctrl_key: bool = Field(..., alias="ctrlKey")
    shift_key: bool = Field(..., alias="shiftKey")
    alt_key: bool = Field(..., alias="altKey")
    meta_key: bool = Field(..., alias="metaKey")
    movement_x: float | None = Field(None, alias="movementX")
    movement_y: float | None = Field(None, alias="movementY")


class KeyEventData(BaseModel):
    key: str
    code: str
    key_code: int = Field(..., alias="keyCode")
    char_code: int | None = Field(None, alias="charCode")
    which: int
    ctrl_key: bool = Field(..., alias="ctrlKey")
    shift_key: bool = Field(..., alias="shiftKey")
    alt_key: bool = Field(..., alias="altKey")
    meta_key: bool = Field(..., alias="metaKey")
    repeat: bool
    is_composing: bool | None = Field(None, alias="isComposing")


class TouchPointData(BaseModel):
    client_x: int = Field(..., alias="clientX")
    client_y: int = Field(..., alias="clientY")
    force: float
    identifier: int
    radius_x: float = Field(..., alias="radiusX")
    radius_y: float = Field(..., alias="radiusY")
    rotation_angle: float = Field(..., alias="rotationAngle")
    screen_x: int = Field(..., alias="screenX")
    screen_y: int = Field(..., alias="screenY")
    target: str


class TouchEventData(BaseModel):
    touches: list[TouchPointData]


class EventHandler:
    def __init__(self, session: Session) -> None:
        self.session: Session = session
        self.event_handlers = {
            "network_request": self._handle_network_request,
            "network_response": self._handle_network_response,
            "user_interaction": self._handle_user_interaction,
            "navigation": self._handle_generic_event,
            "tab_activated": self._handle_generic_event,
            "ajax_request": self._handle_generic_event,
            "fetch_request": self._handle_generic_event,
            "visibilitychange": self._handle_generic_event,
            "battery_status": self._handle_generic_event,
            "geolocation": self._handle_generic_event,
            "geolocation_error": self._handle_generic_event,
            "network_status": self._handle_generic_event,
        }

    async def process_event(self, data: dict[str, Any]) -> None:
        try:
            event_data = EventData(**data)
        except ValidationError:
            logger.exception("Error processing event data: %s", data)
            return

        event = self.create_event(event_data)
        handler = self.event_handlers.get(event_data.type, self._handle_generic_event)
        await handler(event, data)

    def create_event(self, event_data: EventData) -> Event:
        timestamp = parse_iso8601_datetime(event_data.timestamp) if event_data.timestamp else utcnow()
        screen_resolution = json.dumps(event_data.screen_resolution)
        event = Event(
            type=event_data.type,
            timestamp=timestamp,
            session_id=event_data.session_id,
            sequence_number=event_data.sequence_number,
            user_agent=event_data.user_agent,
            extension_version=event_data.extension_version,
            operating_system=event_data.operating_system,
            browser_version=event_data.browser_version,
            screen_resolution=screen_resolution,
            page_session_id=event_data.page_session_id,
            tab_id=event_data.tab_id,
            url=event_data.url,
            initiator=event_data.initiator,
            target=event_data.target.json() if event_data.target else None,
            additional_data=json.dumps(event_data.additional_data) if event_data.additional_data else None,
        )
        self.session.add(event)
        self.session.commit()
        self.session.refresh(event)
        return event

    async def _handle_generic_event(self, event: Event, data: dict[str, Any]) -> None:
        if event.type in {"user_interaction", "generic_event"}:
            event.additional_data = json.dumps(data)
            self.session.commit()

    async def _handle_network_request(self, event: Event, data: dict[str, Any]) -> None:
        await self._handle_event(NetworkRequestData, NetworkRequest, event, data)

    async def _handle_network_response(self, event: Event, data: dict[str, Any]) -> None:
        if isinstance(data.get("headers"), list):
            data["headers"] = {header["name"]: header["value"] for header in data["headers"]}
        await self._handle_event(NetworkResponseData, NetworkResponse, event, data)

    async def _handle_user_interaction(self, event: Event, data: dict[str, Any]) -> None:
        interaction_data = UserInteractionData(**data)
        user_interaction = UserInteraction(
            event_id=event.id,
            event_type=interaction_data.event,
            target=interaction_data.target.json(),
            details=json.dumps(interaction_data.additional_data)
            if interaction_data.additional_data
            else None,
        )
        self.session.add(user_interaction)
        self.session.commit()
        self.session.refresh(user_interaction)
        if interaction_data.event in {"click", "dblclick", "mousemove"}:
            await self._handle_mouse_event(user_interaction, interaction_data.additional_data)
        elif interaction_data.event in {"keydown", "keypress", "keyup"}:
            await self._handle_key_event(user_interaction, interaction_data.additional_data)
        elif interaction_data.event in {"touchstart", "touchmove", "touchend"}:
            await self._handle_touch_event(user_interaction, interaction_data.additional_data)

    async def _handle_mouse_event(
        self, user_interaction: UserInteraction, additional_data: dict[str, Any]
    ) -> None:
        await self._handle_event(MouseEventData, MouseEventDetails, user_interaction, additional_data)

    async def _handle_key_event(
        self, user_interaction: UserInteraction, additional_data: dict[str, Any]
    ) -> None:
        await self._handle_event(KeyEventData, KeyEventDetails, user_interaction, additional_data)

    async def _handle_touch_event(
        self, user_interaction: UserInteraction, additional_data: dict[str, Any]
    ) -> None:
        touch_data = TouchEventData(**additional_data)
        for touch_point in touch_data.touches:
            touch_event = TouchPointDetails(
                interaction_id=user_interaction.id,
                client_x=touch_point.client_x,
                client_y=touch_point.client_y,
                force=touch_point.force,
                identifier=touch_point.identifier,
                radius_x=touch_point.radius_x,
                radius_y=touch_point.radius_y,
                rotation_angle=touch_point.rotation_angle,
                screen_x=touch_point.screen_x,
                screen_y=touch_point.screen_y,
                target=touch_point.target,
            )
            self.session.add(touch_event)
        self.session.commit()

    async def _handle_event(
        self,
        data_class: type[BaseModel],
        model_class: type[SQLModel],
        parent_event: Event,
        data: dict[str, Any],
    ) -> None:
        try:
            event_data = data_class(**data)
            event_instance = model_class(event_id=parent_event.id, **event_data.dict(exclude_unset=True))
            self.session.add(event_instance)
            self.session.commit()
        except Exception:
            logger.exception("Error handling %s event", model_class.__name__.lower())


class Database:
    _engine = None
    _Session = None

    @classmethod
    def initialize_database(cls) -> None:
        if cls._engine is None:
            cls._engine = create_engine(settings.database_url)
            cls._Session = sessionmaker(bind=cls._engine)
            db_path = settings.database_url.split("///")[-1]
            if not Path(db_path).exists():
                logger.info("Database file not found, creating a new one.")
            else:
                logger.info("Database file found, verifying schema.")
            try:
                SQLModel.metadata.create_all(cls._engine)
                logger.info("Schema creation/update successful.")
            except OperationalError:
                logger.exception("Error connecting to database %s", db_path)
                raise
        return cls._engine

    @classmethod
    @asynccontextmanager
    async def get_session(cls) -> AsyncGenerator[Session, None]:
        if cls._engine is None:
            cls.initialize_database()
        session = cls._Session()
        try:
            yield session
        finally:
            session.close()


# Initialize the database at the start
Database.initialize_database()


async def handler(websocket):
    async with Database.get_session() as session:
        service = EventHandler(session)
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await service.process_event(data)
                    ack_message = json.dumps({"type": "ack", "id": data.get("id")})
                    await websocket.send(ack_message)
                except json.JSONDecodeError:
                    logger.exception("Error decoding JSON")
                except Exception:
                    logger.exception("Error processing message")
        except websockets.ConnectionClosed:
            logger.info("Connection closed")
        except Exception:
            logger.exception("Unexpected error")


async def main(stop_event):
    async with websockets.serve(
        handler, settings.websocket_host, settings.websocket_port, max_size=MAX_MESSAGE_SIZE
    ):
        await stop_event.wait()


def run():
    loop = asyncio.get_event_loop()
    stop_event = asyncio.Event()

    # Define a function to handle the shutdown signal
    def shutdown():
        logger.info("Shutting down server gracefully...")
        stop_event.set()

    # Add signal handlers for SIGINT and SIGTERM
    for sig in [signal.SIGINT, signal.SIGTERM]:
        loop.add_signal_handler(sig, shutdown)

    try:
        loop.run_until_complete(main(stop_event))
    finally:
        loop.close()


if __name__ == "__main__":
    run()
