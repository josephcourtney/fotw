# Syrphid Server

## Description

Syrphid Server is a Python-based server that receives browser activity extracted and transmitted by the syrphid browser extension, including network requests, user interactions, and various events.

## Features

- WebSocket server to handle incoming events

## Setup

### Prerequisites

- Python 3.12 or higher

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/syrphid_server.git
   cd syrphid_server
   ```

2. Install dependencies:

   ```bash
    pip install -r requirements.txt
   ```

3. Configure the server by editing config/config.json or setting up environment variables.

### Usage

Run the server:

```bash
python -m syrphid
```

### Configuration

### Contributing

Feel free to submit issues or pull requests. For major changes, please open an issue first to discuss what you would like to change.

### License

This project is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike (CC BY-NC-SA) License.
