import { generateSessionId, log, createMessage } from './utils.js';
import { sendInitialStateMessages } from './state.js';
import { CONFIG_KEYS, DEFAULT_CONFIG } from './constants.js';

let config = { ...DEFAULT_CONFIG };
let websocket;
const sessionId = generateSessionId();  // Generate a unique session ID when extension is loaded

async function loadConfig() {
  try {
    const storage = await browser.storage.local.get(Object.values(CONFIG_KEYS));
    config = {
      ...config,
      WS_SERVER: storage[CONFIG_KEYS.WS_SERVER] || config.WS_SERVER,
      LOG_LEVEL: storage[CONFIG_KEYS.LOG_LEVEL] || config.LOG_LEVEL,
      TRACKED_EVENTS: storage[CONFIG_KEYS.TRACKED_EVENTS] || config.TRACKED_EVENTS,
    };
  } catch (error) {
    log(`Error loading config: ${error.message}`, config, "error");
  }
}

function connectWebSocket() {
  loadConfig().then(() => {
    websocket = new WebSocket(config.WS_SERVER);
    websocket.addEventListener("open", () => {
      handleWebSocketOpen();
      sendInitialStateMessages();
    });
    websocket.addEventListener("close", handleWebSocketCloseOrError);
    websocket.addEventListener("error", handleWebSocketCloseOrError);
  });
}

function handleWebSocketOpen() {
  log("WebSocket is open now.", config, "info");
  browser.runtime.sendMessage({ type: "ws-status", status: "connected" });
  resetReconnectAttempts();
}

function handleWebSocketCloseOrError(event) {
  const status = event.type === "close" ? "disconnected" : "error";
  log(`WebSocket ${status}. Reconnecting...`, config, status === "error" ? "error" : "warn");
  browser.runtime.sendMessage({ type: "ws-status", status });
  scheduleReconnect();
}

function resetReconnectAttempts() {
  config.RECONNECT_ATTEMPTS = 0;
}

function scheduleReconnect() {
  if (config.RECONNECT_ATTEMPTS < config.MAX_RECONNECT_ATTEMPTS) {
    const reconnectInterval = calculateReconnectInterval();
    setTimeout(connectWebSocket, reconnectInterval);
    config.RECONNECT_ATTEMPTS++;
  } else {
    log("Max reconnect attempts reached. Giving up.", config, "error");
  }
}

function calculateReconnectInterval() {
  return Math.min(
    config.RECONNECT_INTERVAL_MS * Math.pow(config.EXPONENTIAL_BACKOFF_FACTOR, config.RECONNECT_ATTEMPTS),
    config.MAX_RECONNECT_INTERVAL_MS
  );
}

function sendToWebSocketServer(data) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(data));
  } else {
    log("WebSocket is not open. Message not sent.", config, "warn");
  }
}

export { connectWebSocket, sendToWebSocketServer, handleWebSocketOpen, handleWebSocketCloseOrError, sessionId, config };
