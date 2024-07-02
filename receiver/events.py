import json
import logging
from datetime import UTC, datetime

from config import EVENT_TYPES
from models import Event, KeyEventDetails, MouseEventDetails, NetworkRequest, NetworkResponse, UserInteraction
from validation import (
    EventData,
    KeyEventData,
    MouseEventData,
    NetworkRequestData,
    NetworkResponseData,
    UserInteractionData,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EventHandler:
    def __init__(self, session):
        self.session = session
        self.event_handlers = {
            EVENT_TYPES["NETWORK_REQUEST"]: self._handle_network_request,
            EVENT_TYPES["NETWORK_RESPONSE"]: self._handle_network_response,
            EVENT_TYPES["USER_INTERACTION"]: self._handle_user_interaction,
        }

    async def process_event(self, data):
        event_data = EventData(**data)
        timestamp = (
            datetime.strptime(event_data.timestamp, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=UTC)
            if event_data.timestamp
            else datetime.now(UTC)
        )

        event = Event(
            type=event_data.type,
            timestamp=timestamp,
            tab_id=event_data.tab_id,
            url=event_data.url,
            initiator=event_data.initiator,
            additional_data=json.dumps(event_data.additional_data),
        )
        self.session.add(event)
        self.session.commit()  # Remove await here

        handler = self.event_handlers.get(event_data.type, self._handle_generic_event)
        await handler(event, data)

    async def _handle_network_request(self, event, data):
        network_data = NetworkRequestData(**data)
        network_request = NetworkRequest(
            event_id=event.id,
            method=network_data.method,
            request_id=network_data.request_id,
            url=network_data.url,
            time_stamp=network_data.time_stamp,
            initiator=network_data.initiator,
            details=json.dumps(network_data.details),
        )
        self.session.add(network_request)
        self.session.commit()  # Remove await here

    async def _handle_network_response(self, event, data):
        network_data = NetworkResponseData(**data)
        network_response = NetworkResponse(
            event_id=event.id,
            status_code=network_data.status_code,
            request_id=network_data.request_id,
            url=network_data.url,
            time_stamp=network_data.time_stamp,
            details=json.dumps(network_data.details),
        )
        self.session.add(network_response)
        self.session.commit()  # Remove await here

    async def _handle_user_interaction(self, event, data):
        interaction_data = UserInteractionData(**data)
        target = interaction_data.target
        user_interaction = UserInteraction(
            event_id=event.id,
            event_type=interaction_data.event,
            target_tag=target.get("tagName", ""),
            target_id=target.get("id"),
            target_class=target.get("className"),
            target_name=target.get("name"),
            details=json.dumps(interaction_data.additional_data),
        )
        self.session.add(user_interaction)
        self.session.commit()  # Remove await here

        if interaction_data.event in EVENT_TYPES["MOUSE_EVENTS"]:
            await self._handle_mouse_event(user_interaction, interaction_data.additional_data)
        elif interaction_data.event in EVENT_TYPES["KEY_EVENTS"]:
            await self._handle_key_event(user_interaction, interaction_data.additional_data)

    async def _handle_mouse_event(self, user_interaction, additional_data):
        mouse_data = MouseEventData(**additional_data)
        mouse_event = MouseEventDetails(
            interaction_id=user_interaction.id,
            client_x=mouse_data.client_x,
            client_y=mouse_data.client_y,
            button=mouse_data.button,
            buttons=mouse_data.buttons,
            ctrl_key=mouse_data.ctrl_key,
            shift_key=mouse_data.shift_key,
            alt_key=mouse_data.alt_key,
            meta_key=mouse_data.meta_key,
        )
        self.session.add(mouse_event)
        self.session.commit()  # Remove await here

    async def _handle_key_event(self, user_interaction, additional_data):
        key_data = KeyEventData(**additional_data)
        key_event = KeyEventDetails(
            interaction_id=user_interaction.id,
            key=key_data.key,
            code=key_data.code,
            key_code=key_data.key_code,
            char_code=key_data.char_code,
            which=key_data.which,
            ctrl_key=key_data.ctrl_key,
            shift_key=key_data.shift_key,
            alt_key=key_data.alt_key,
            meta_key=key_data.meta_key,
            repeat=key_data.repeat,
        )
        self.session.add(key_event)
        self.session.commit()  # Remove await here

    async def _handle_generic_event(self, event, data):
        if event.type in EVENT_TYPES["GENERIC_EVENTS"]:
            event.additional_data = json.dumps(data)
            self.session.commit()  # Remove await here
