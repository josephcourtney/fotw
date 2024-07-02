import logging
import os
from contextlib import contextmanager

from sqlalchemy.exc import OperationalError
from sqlmodel import Session, SQLModel, create_engine

from config import DATABASE_URL

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define the path to the database file
db_path = DATABASE_URL.split("///")[-1]


# Initialize the database
def initialize_database():
    engine = create_engine(DATABASE_URL)
    if not os.path.exists(db_path):
        logger.info("Database file not found, creating a new one.")
    else:
        logger.info("Database file found, verifying schema.")

    # Ensure the tables are created
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Schema creation/update successful.")
    except OperationalError as e:
        logger.exception("Failed to create the schema: %s", e)
        raise

    return engine


@contextmanager
def get_session():
    engine = initialize_database()
    with Session(engine) as session:
        yield session
