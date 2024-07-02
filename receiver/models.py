from datetime import datetime

from sqlmodel import Field, Relationship, SQLModel


class Event(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    type: str
    timestamp: datetime
    tab_id: int | None = None
    url: str | None = None
    initiator: str | None = None
    additional_data: str | None = None
    network_requests: list["NetworkRequest"] = Relationship(back_populates="event")
    network_responses: list["NetworkResponse"] = Relationship(back_populates="event")
    user_interactions: list["UserInteraction"] = Relationship(back_populates="event")


class NetworkRequest(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    method: str
    request_id: str | None = None
    url: str | None = None
    time_stamp: float | None = None
    initiator: str | None = None
    details: str | None = None
    event_id: int = Field(foreign_key="event.id")
    event: "Event" = Relationship(back_populates="network_requests")


class NetworkResponse(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    status_code: int
    request_id: str | None = None
    url: str | None = None
    time_stamp: float | None = None
    details: str | None = None
    event_id: int = Field(foreign_key="event.id")
    event: "Event" = Relationship(back_populates="network_responses")


class UserInteraction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    event_type: str
    target_tag: str
    target_id: str | None = None
    target_class: str | None = None
    target_name: str | None = None
    details: str | None = None
    event_id: int = Field(foreign_key="event.id")
    event: "Event" = Relationship(back_populates="user_interactions")


class MouseEventDetails(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    interaction_id: int = Field(foreign_key="userinteraction.id")
    client_x: int
    client_y: int
    button: int | None = None
    buttons: int | None = None
    ctrl_key: bool
    shift_key: bool
    alt_key: bool
    meta_key: bool


class KeyEventDetails(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    interaction_id: int = Field(foreign_key="userinteraction.id")
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
