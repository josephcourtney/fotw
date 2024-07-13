import { getConfig } from "./config.js";

class WebSocketManager {
  constructor() {
    const config = getConfig();
    this.websocket = null;
    this.retryTimeout = null;
    this.retryInterval = config.RECONNECT_INTERVAL_MS;
    this.onOpenCallbacks = [];
    this.messageQueue = [];
    this.isConnected = false;
  }

  setConnectionStatus = (status) => {
    browser.storage.local.set({ connectionStatus: status });
  };

  connect = () => {
    const { WS_SERVER } = getConfig();
    console.info(`Connecting to WebSocket server at ${WS_SERVER}`);

    this.websocket = new WebSocket(WS_SERVER);

    this.websocket.onopen = this.handleOpen;
    this.websocket.onclose = this.handleClose;
    this.websocket.onerror = this.handleError;
    this.websocket.onmessage = this.handleMessage;
  };

  handleOpen = () => {
    console.info("WebSocket connection opened");
    clearTimeout(this.retryTimeout);
    this.isConnected = true;
    this.setConnectionStatus("Connected");
    this.onOpenCallbacks.forEach((callback) => callback());

    while (this.messageQueue.length > 0) {
      const { label, message } = this.messageQueue.shift();
      this.send({ label, message });
    }
  };

  handleClose = () => {
    console.info("WebSocket connection closed");
    this.isConnected = false;
    this.scheduleReconnect();
    this.setConnectionStatus("Disconnected");
  };

  handleError = (error) => {
    console.error(`WebSocket error: ${error.message}`);
    this.isConnected = false;
    this.scheduleReconnect();
    this.setConnectionStatus("Error");
  };

  handleMessage = (event) => {
    // handle incoming messages if needed
  };

  scheduleReconnect = () => {
    if (!this.retryTimeout) {
      console.info(
        `Attempting to reconnect in ${this.retryInterval / 1000} seconds`,
      );
      this.retryTimeout = setTimeout(() => {
        const config = getConfig();
        this.retryInterval = Math.min(
          this.retryInterval * config.EXPONENTIAL_BACKOFF_FACTOR,
          config.MAX_RECONNECT_INTERVAL_MS,
        );
        this.connect();
      }, this.retryInterval);
    }
  };

  send = (message) => {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  };

  onOpen = (callback) => {
    this.onOpenCallbacks.push(callback);
  };
}

const webSocketManager = new WebSocketManager();

browser.runtime.onMessage.addListener((message) => {
  if (message.type === "reconnect") {
    webSocketManager.connect();
  }
});

export { webSocketManager };
