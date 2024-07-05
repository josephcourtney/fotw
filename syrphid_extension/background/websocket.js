import { generateSessionId, log, createMessage } from "./utils.js";
import { sendInitialStateMessages } from "./state.js";
import { config } from "./config.js";

let websocket;

const sessionId = generateSessionId(); // Generate a unique session ID when the extension is loaded

const loadConfig = async () => {
  try {
    const storage = await browser.storage.local.get(Object.keys(config));
    Object.keys(config).forEach((key) => {
      config[key] = storage[key] || config[key];
    });
    log("Configuration loaded", config, "info");
  } catch (error) {
    log(`Error loading config: ${error.message}`, config, "error");
  }
};

const connectWebSocket = () => {
  loadConfig().then(() => {
    log(
      `Connecting to WebSocket server at ${config.WS_SERVER}`,
      config,
      "info",
    );
    websocket = new WebSocket(config.WS_SERVER);
    setupWebSocketEventListeners();
  });
};

const setupWebSocketEventListeners = () => {
  websocket.addEventListener("open", () => {
    handleWebSocketOpen();
    sendInitialStateMessages();
  });
  websocket.addEventListener("close", handleWebSocketCloseOrError);
  websocket.addEventListener("error", handleWebSocketCloseOrError);
};

const handleWebSocketOpen = () => {
  log("WebSocket is open now.", config, "info");
  browser.runtime.sendMessage({ type: "ws-status", status: "connected" });
  resetReconnectAttempts();
};

const handleWebSocketCloseOrError = (event) => {
  const status = event.type === "close" ? "disconnected" : "error";
  log(
    `WebSocket ${status}. Reconnecting...`,
    config,
    status === "error" ? "error" : "warn",
  );
  browser.runtime.sendMessage({ type: "ws-status", status });
  scheduleReconnect();
};

const resetReconnectAttempts = () => {
  log("Resetting reconnect attempts", config, "info");
  config.RECONNECT_ATTEMPTS = 0;
};

const scheduleReconnect = () => {
  const reconnectInterval = Math.min(
    config.RECONNECT_INTERVAL_MS *
      Math.pow(config.EXPONENTIAL_BACKOFF_FACTOR, config.RECONNECT_ATTEMPTS),
    config.MAX_RECONNECT_INTERVAL_MS,
  );
  log(`Scheduling reconnect in ${reconnectInterval}ms`, config, "info");
  setTimeout(connectWebSocket, reconnectInterval);
  config.RECONNECT_ATTEMPTS++;
};

const sendToWebSocketServer = (data) => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    log(
      `Sending data to WebSocket server: ${JSON.stringify(data)}`,
      config,
      "debug",
    );
    websocket.send(JSON.stringify(data));
  } else {
    log("WebSocket is not open. Message not sent.", config, "warn");
  }
};

export {
  connectWebSocket,
  sendToWebSocketServer,
  handleWebSocketOpen,
  handleWebSocketCloseOrError,
  sessionId,
  websocket,
};
