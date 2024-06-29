#!/usr/bin/env python3

import sys
import json
import logging
from models import EventMessage, log_to_database

# Set up logging
logging.basicConfig(filename='/Users/josephcourtney/Dropbox/code/Python/scrapers/fotw/logfile.log', level=logging.DEBUG,
                    format='%(asctime)s %(levelname)s %(message)s')

logging.debug("Native app started")

def read_message():
    try:
        raw_length = sys.stdin.buffer.read(4)
        if len(raw_length) == 0:
            logging.debug("No input received, continuing to wait.")
            return None
        elif len(raw_length) != 4:
            logging.error("Did not receive proper length bytes")
            return None
        message_length = int.from_bytes(raw_length, byteorder='little')
        message = sys.stdin.buffer.read(message_length)
        logging.debug(f"Received raw message: {message}")
        return json.loads(message.decode('utf-8', errors='replace'))
    except json.JSONDecodeError as e:
        logging.error(f"JSON decode error: {e}")
        return None
    except Exception as e:
        logging.error(f"Error reading message: {e}")
        return None

def send_message(message):
    try:
        encoded_message = json.dumps(message).encode('utf-8')
        message_length = len(encoded_message).to_bytes(4, byteorder='little')
        sys.stdout.buffer.write(message_length)
        sys.stdout.buffer.write(encoded_message)
        sys.stdout.buffer.flush()
        logging.debug(f"Sent message: {message}")
    except Exception as e:
        logging.error(f"Error sending message: {e}")

if __name__ == "__main__":
    while True:
        raw_message = read_message()
        if raw_message:
            logging.debug(f"Processing message: {raw_message}")
            try:
                message = EventMessage(**raw_message)
                log_to_database(message.event, raw_message)
                send_message({"status": "success", "message": "Message logged successfully"})
            except Exception as e:
                logging.error(f"Validation error: {e}")
                send_message({"status": "error", "message": str(e)})
        else:
            # Log and continue listening for the next message
            logging.debug("Waiting for new messages.")
