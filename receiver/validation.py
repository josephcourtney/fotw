from typing import Any

from pydantic import BaseModel, Field


class CommonData(BaseModel):
    """Common data structure for network events."""

    request_id: str | None = Field(None, alias="requestId")
    url: str | None = None
    time_stamp: float | None = Field(None, alias="timeStamp")
    details: dict[str, Any] | None = None

    class Config:
        populate_by_name = True


class EventData(BaseModel):
    """Data structure for generic events."""

    type: str
    timestamp: str | None = None
    tab_id: int | None = Field(None, alias="tabId")
    url: str | None = None
    initiator: str | None = None
    additional_data: dict[str, Any] | None = Field(None, alias="additionalData")

    class Config:
        populate_by_name = True


class NetworkRequestData(CommonData):
    """Data structure for network request events."""

    method: str
    initiator: str | None = None


class NetworkResponseData(CommonData):
    """Data structure for network response events."""

    status_code: int = Field(..., alias="statusCode")

    class Config:
        populate_by_name = True


class UserInteractionData(BaseModel):
    """Data structure for user interaction events."""

    event: str
    target: dict[str, str | None]
    additional_data: dict[str, Any] = Field(..., alias="additionalData")

    class Config:
        populate_by_name = True


class MouseEventData(BaseModel):
    """Data structure for mouse events."""

    client_x: int = Field(..., alias="clientX")
    client_y: int = Field(..., alias="clientY")
    button: int | None = None
    buttons: int | None = None
    ctrl_key: bool = Field(..., alias="ctrlKey")
    shift_key: bool = Field(..., alias="shiftKey")
    alt_key: bool = Field(..., alias="altKey")
    meta_key: bool = Field(..., alias="metaKey")

    class Config:
        populate_by_name = True


class KeyEventData(BaseModel):
    """Data structure for key events."""

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

    class Config:
        populate_by_name = True
