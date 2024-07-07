import { generateSessionId, log, createMessage } from "./utils.js";
import { sendInitialStateMessages, initializeState, initializeEnvironment } from "./state.js";
import { loadConfig, getConfig, setConfig } from "./config.js";

let websocket;
const sessionId = generateSessionId();
const messageQueue = [];

const connectWebSocket = async () => {
  try {
    initializeEnvironment(); // Ensure environment is initialized
    await initializeState();
    await loadConfig();
    log(`Connecting to WebSocket server at ${getConfig().WS_SERVER}`, "info");
    websocket = new WebSocket(getConfig().WS_SERVER);
    setupWebSocketEventListeners();
  } catch (error) {
    log(`Error initializing environment or state: ${error.message}`, "error");
  }
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
  flushMessageQueue();
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
    log("WebSocket is not open. Queuing message.", "warn");
    queueMessage(data);
  }
};

const queueMessage = (data) => {
  messageQueue.push(data);
};

const flushMessageQueue = () => {
  while (messageQueue.length > 0 && websocket.readyState === WebSocket.OPEN) {
    const data = messageQueue.shift();
    sendToWebSocketServer(data);
  }
};

const getSessionId = () => sessionId;

export {
  connectWebSocket,
  sendToWebSocketServer,
  handleWebSocketOpen,
  handleWebSocketCloseOrError,
  getSessionId,
  websocket,
};
