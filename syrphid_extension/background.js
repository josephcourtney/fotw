const CONFIG_KEYS = {
  WS_SERVER: "wsServer",
  LOG_LEVEL: "logLevel",
  TRACKED_EVENTS: "trackedEvents",
};

const DEFAULT_CONFIG = {
  WS_SERVER: "ws://localhost:8080",
  LOG_LEVEL: "info",
  RECONNECT_INTERVAL_MS: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
  RECONNECT_ATTEMPTS: 0,
  EXPONENTIAL_BACKOFF_FACTOR: 2,
  MAX_RECONNECT_INTERVAL_MS: 30000,
  TRACKED_EVENTS: ["click", "mousemove", "keydown", "keyup", "scroll", "resize"],
};

let config = { ...DEFAULT_CONFIG };
let websocket;
const sessionId = generateSessionId();

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
    log(`Error loading config: ${error.message}`, "error");
  }
}

function log(message, level = "info") {
  const levels = ["debug", "info", "warn", "error"];
  if (levels.indexOf(level) >= levels.indexOf(config.LOG_LEVEL)) {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}

function generateSessionId() {
  return `_${Math.random().toString(36).substr(2, 9)}`;
}

async function connectWebSocket() {
  await loadConfig();
  websocket = new WebSocket(config.WS_SERVER);
  websocket.addEventListener("open", handleWebSocketOpen);
  websocket.addEventListener("close", handleWebSocketCloseOrError);
  websocket.addEventListener("error", handleWebSocketCloseOrError);
}

function handleWebSocketOpen() {
  log("WebSocket is open now.", "info");
  browser.runtime.sendMessage({ type: "ws-status", status: "connected" });
  resetReconnectAttempts();
}

function handleWebSocketCloseOrError(event) {
  const status = event.type === "close" ? "disconnected" : "error";
  log(`WebSocket ${status}. Reconnecting...`, status === "error" ? "error" : "warn");
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
    log("Max reconnect attempts reached. Giving up.", "error");
  }
}

function calculateReconnectInterval() {
  return Math.min(
    config.RECONNECT_INTERVAL_MS * Math.pow(config.EXPONENTIAL_BACKOFF_FACTOR, config.RECONNECT_ATTEMPTS),
    config.MAX_RECONNECT_INTERVAL_MS
  );
}

function sendToWebSocketServer(data) {
  if (websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(data));
  }
}

function createMessage(type, details = {}) {
  return {
    sessionId,
    userAgent: navigator.userAgent,
    operatingSystem: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    extensionVersion: browser.runtime.getManifest().version,
    type,
    timestamp: new Date().toISOString(),
    ...details,
  };
}

function handleRuntimeMessage(message) {
  switch (message.type) {
    case "reconnect":
      connectWebSocket();
      break;
    case "options-changed":
      websocket.close();
      connectWebSocket();
      updateEventListeners();
      break;
    case "ws-status-check":
      sendResponse({ type: "ws-status", status: websocket.readyState === WebSocket.OPEN ? "connected" : "disconnected" });
      break;
    default:
      sendToWebSocketServer(createMessage(message.type, message));
  }
}

function handleTabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    sendToWebSocketServer(createMessage("navigation", {
      tabId,
      url: changeInfo.url,
      tabTitle: tab.title,
    }));
  }
}

function handleTabActivated(activeInfo) {
  browser.tabs.get(activeInfo.tabId).then((tab) => {
    sendToWebSocketServer(createMessage("tab-activated", {
      tabId: activeInfo.tabId,
      url: tab.url,
      tabTitle: tab.title,
    }));
  });
}

function handleNetworkRequest(details) {
  sendToWebSocketServer(createMessage("network-request", details));
}

function handleNetworkResponse(details) {
  sendToWebSocketServer(createMessage("network-response", details));
}

function updateEventListeners() {
  if (config.TRACKED_EVENTS.includes("tabUpdated")) {
    browser.tabs.onUpdated.addListener(handleTabUpdated);
  } else {
    browser.tabs.onUpdated.removeListener(handleTabUpdated);
  }
  if (config.TRACKED_EVENTS.includes("tabActivated")) {
    browser.tabs.onActivated.addListener(handleTabActivated);
  } else {
    browser.tabs.onActivated.removeListener(handleTabActivated);
  }
  if (config.TRACKED_EVENTS.includes("networkRequest")) {
    browser.webRequest.onBeforeRequest.addListener(handleNetworkRequest, { urls: ["<all_urls>"] });
  } else {
    browser.webRequest.onBeforeRequest.removeListener(handleNetworkRequest);
  }
  if (config.TRACKED_EVENTS.includes("networkResponse")) {
    browser.webRequest.onCompleted.addListener(handleNetworkResponse, { urls: ["<all_urls>"] });
  } else {
    browser.webRequest.onCompleted.removeListener(handleNetworkResponse);
  }
}

browser.runtime.onMessage.addListener(handleRuntimeMessage);

connectWebSocket();

