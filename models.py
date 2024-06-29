from pydantic import BaseModel
from sqlmodel import SQLModel, Field, create_engine, Session
import json

class EventMessage(BaseModel):
    event: str
    url: str = None
    element: str = None
    timeStamp: float

class Interaction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    event: str
    data: str

# Database connection
engine = create_engine('sqlite:///user_data.db')

# Create tables
SQLModel.metadata.create_all(engine)

def log_to_database(event: str, data: dict):
    with Session(engine) as session:
        interaction = Interaction(event=event, data=json.dumps(data))
        session.add(interaction)
        session.commit()
