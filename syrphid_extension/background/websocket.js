import { generateSessionId, log, createMessage } from "./utils.js";
import { sendInitialStateMessages } from "./state.js";
import { loadConfig, getConfig, setConfig } from "./config.js";

let websocket;
const sessionId = generateSessionId();

const connectWebSocket = () => {
  loadConfig().then(() => {
    log(`Connecting to WebSocket server at ${getConfig().WS_SERVER}`, "info");
    websocket = new WebSocket(getConfig().WS_SERVER);
    setupWebSocketEventListeners();
  });
};

const setupWebSocketEventListeners = () => {
  websocket.addEventListener("open", handleWebSocketOpen);
  websocket.addEventListener("close", handleWebSocketCloseOrError);
  websocket.addEventListener("error", handleWebSocketCloseOrError);
};

const handleWebSocketOpen = () => {
  log("WebSocket is open now.", "info");
  browser.runtime.sendMessage({ type: "ws-status", status: "connected" });
  resetReconnectAttempts();
  sendInitialStateMessages();
};

const handleWebSocketCloseOrError = (event) => {
  const status = event.type === "close" ? "disconnected" : "error";
  log(`WebSocket ${status}. Reconnecting...`, status === "error" ? "error" : "warn");
  browser.runtime.sendMessage({ type: "ws-status", status });
  scheduleReconnect();
};

const resetReconnectAttempts = () => {
  log("Resetting reconnect attempts", "info");
  setConfig({ RECONNECT_ATTEMPTS: 0 });
};

const scheduleReconnect = () => {
  const maxJitter = getConfig().RECONNECT_INTERVAL_MS / 2;
  const jitter = Math.floor(Math.random() * maxJitter);
  const reconnectInterval = Math.min(
    getConfig().RECONNECT_INTERVAL_MS * Math.pow(getConfig().EXPONENTIAL_BACKOFF_FACTOR, getConfig().RECONNECT_ATTEMPTS) + jitter,
    getConfig().MAX_RECONNECT_INTERVAL_MS
  );
  log(`Scheduling reconnect in ${reconnectInterval}ms`, "info");
  setTimeout(connectWebSocket, reconnectInterval);
  setConfig({ RECONNECT_ATTEMPTS: getConfig().RECONNECT_ATTEMPTS + 1 });
};

const sendToWebSocketServer = (data) => {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    log(`Sending data to WebSocket server: ${JSON.stringify(data)}`, "debug");
    websocket.send(JSON.stringify(data));
  } else {
    log("WebSocket is not open. Message not sent.", "warn");
  }
};

const getSessionId = () => sessionId;

export {
  connectWebSocket,
  sendToWebSocketServer,
  handleWebSocketOpen,
  handleWebSocketCloseOrError,
  getSessionId, // Ensure this is correctly exported
  websocket,
};
