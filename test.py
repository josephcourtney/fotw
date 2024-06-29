import sys
import json
import logging

logging.basicConfig(filename='./test_logfile.log', level=logging.DEBUG, format='%(asctime)s %(levelname)s %(message)s')
logging.debug("Native app started")

def read_message():
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        sys.exit(0)
    message_length = int.from_bytes(raw_length, byteorder='little')
    message = sys.stdin.buffer.read(message_length)
    return json.loads(message.decode('utf-8'))

def send_message(message):
    encoded_message = json.dumps(message).encode('utf-8')
    sys.stdout.buffer.write(len(encoded_message).to_bytes(4, byteorder='little'))
    sys.stdout.buffer.write(encoded_message)
    sys.stdout.buffer.flush()

if __name__ == "__main__":
    logging.debug("Waiting for messages")
    while True:
        message = read_message()
        logging.debug(f"Received message: {message}")
        response = {"status": "success", "message": "Message received"}
        send_message(response)
