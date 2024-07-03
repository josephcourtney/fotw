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
  TRACKED_EVENTS: [
    "DeviceMotionEvent",
    "DeviceOrientationEvent",
    "abort",
    "addtrack",
    "animationcancel",
    "animationend",
    "animationiteration",
    "animationstart",
    "audioend",
    "audioprocess",
    "audiostart",
    "beforeinput",
    "beforeunload",
    "blur",
    "boundary",
    "canplay",
    "canplaythrough",
    "change",
    "chargingchange",
    "chargingtimechange",
    "click",
    "close",
    "complete",
    "compositionend",
    "compositionstart",
    "compositionupdate",
    "contextmenu",
    "controllerchange",
    "copy",
    "cut",
    "dblclick",
    "devicemotion",
    "deviceorientation",
    "deviceorientationabsolute",
    "dischargingtimechange",
    "drag",
    "dragend",
    "dragenter",
    "dragexit",
    "dragleave",
    "dragover",
    "dragstart",
    "drop",
    "durationchange",
    "end",
    "ended",
    "error",
    "focus",
    "focusin",
    "focusout",
    "formdata",
    "fullscreenchange",
    "fullscreenerror",
    "gamepadconnected",
    "gamepaddisconnected",
    "getCurrentPosition",
    "hashchange",
    "input",
    "invalid",
    "keydown",
    "keypress",
    "keyup",
    "levelchange",
    "load",
    "loadeddata",
    "loadedmetadata",
    "loadstart",
    "mark",
    "merchantvalidation",
    "message",
    "mousedown",
    "mouseenter",
    "mouseleave",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "nomatch",
    "open",
    "pagehide",
    "pageshow",
    "paste",
    "pause",
    "paymentmethodchange",
    "play",
    "playing",
    "popstate",
    "progress",
    "push",
    "ratechange",
    "readystatechange",
    "removetrack",
    "reset",
    "resize",
    "result",
    "scroll",
    "securitypolicyviolation",
    "seeked",
    "seeking",
    "select",
    "slotchange",
    "soundend",
    "soundprocess",
    "soundstart",
    "speechend",
    "speecherror",
    "speechstart",
    "stalled",
    "start",
    "statechange",
    "storage",
    "submit",
    "suspend",
    "sync",
    "timeupdate",
    "toggle",
    "touchcancel",
    "touchend",
    "touchmove",
    "touchstart",
    "transitioncancel",
    "transitionend",
    "transitionrun",
    "transitionstart",
    "unload",
    "visibilitychange",
    "volumechange",
    "waiting",
    "watchPosition",
    "wheel",
  ],
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
      TRACKED_EVENTS:
        storage[CONFIG_KEYS.TRACKED_EVENTS] || config.TRACKED_EVENTS,
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
  log(
    `WebSocket ${status}. Reconnecting...`,
    status === "error" ? "error" : "warn",
  );
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
    config.RECONNECT_INTERVAL_MS *
      Math.pow(config.EXPONENTIAL_BACKOFF_FACTOR, config.RECONNECT_ATTEMPTS),
    config.MAX_RECONNECT_INTERVAL_MS,
  );
}

function sendToWebSocketServer(data) {
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send(JSON.stringify(data));
  } else {
    log("WebSocket is not open. Message not sent.", "warn");
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

function handleRuntimeMessage(message, sender, sendResponse) {
  try {
    switch (message.type) {
      case "reconnect":
        connectWebSocket();
        sendResponse({ result: "reconnected" });
        break;
      case "options-changed":
        if (websocket) {
          websocket.close();
        }
        connectWebSocket();
        updateEventListeners();
        sendResponse({ result: "options-changed" });
        break;
      case "ws-status-check":
        sendResponse({
          type: "ws-status",
          status:
            websocket && websocket.readyState === WebSocket.OPEN
              ? "connected"
              : "disconnected",
        });
        break;
      default:
        sendToWebSocketServer(createMessage(message.type, message));
        sendResponse({ result: "message-sent" });
    }
  } catch (error) {
    console.error("Error handling message:", error);
    sendResponse({ error: error.message });
  }
  return true;
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleRuntimeMessage(message, sender, sendResponse);
  return true; // Ensures the sendResponse will be called asynchronously.
});

function handleTabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.url) {
    sendToWebSocketServer(
      createMessage("navigation", {
        tabId,
        url: changeInfo.url,
        tabTitle: tab.title,
      }),
    );
  }
}

function handleTabActivated(activeInfo) {
  browser.tabs.get(activeInfo.tabId).then((tab) => {
    sendToWebSocketServer(
      createMessage("tab-activated", {
        tabId: activeInfo.tabId,
        url: tab.url,
        tabTitle: tab.title,
      }),
    );
  });
}

function handleNetworkRequest(details) {
  sendToWebSocketServer(createMessage("network-request", details));
}

function handleNetworkResponse(details) {
  sendToWebSocketServer(createMessage("network-response", details));
}

function updateEventListeners() {
  browser.tabs.onUpdated.removeListener(handleTabUpdated);
  browser.tabs.onActivated.removeListener(handleTabActivated);

  if (config.TRACKED_EVENTS.includes("tabUpdated")) {
    browser.tabs.onUpdated.addListener(handleTabUpdated);
  }
  if (config.TRACKED_EVENTS.includes("tabActivated")) {
    browser.tabs.onActivated.addListener(handleTabActivated);
  }

  browser.webRequest.onBeforeRequest.removeListener(handleNetworkRequest);
  browser.webRequest.onCompleted.removeListener(handleNetworkResponse);

  if (config.TRACKED_EVENTS.includes("networkRequest")) {
    browser.webRequest.onBeforeRequest.addListener(handleNetworkRequest, {
      urls: ["<all_urls>"],
    });
  }
  if (config.TRACKED_EVENTS.includes("networkResponse")) {
    browser.webRequest.onCompleted.addListener(handleNetworkResponse, {
      urls: ["<all_urls>"],
    });
  }
}

connectWebSocket();

// Battery Events
if (navigator.getBattery) {
  navigator.getBattery().then((battery) => {
    const updateBatteryStatus = () => {
      const eventData = {
        type: "battery-status",
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
        level: battery.level,
        timestamp: new Date().toISOString(),
      };
      sendToWebSocketServer(eventData);
    };

    battery.addEventListener("chargingchange", updateBatteryStatus);
    battery.addEventListener("levelchange", updateBatteryStatus);
    battery.addEventListener("chargingtimechange", updateBatteryStatus);
    battery.addEventListener("dischargingtimechange", updateBatteryStatus);

    updateBatteryStatus();
  });
}

// Geolocation Events
const geolocationEventProps = (position) => ({
  coords: {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    altitude: position.coords.altitude,
    accuracy: position.coords.accuracy,
    altitudeAccuracy: position.coords.altitudeAccuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
  },
  timestamp: new Date(position.timestamp).toISOString(),
});

const geolocationErrorEventProps = (error) => ({
  code: error.code,
  message: error.message,
});

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const eventData = {
        type: "geolocation",
        ...geolocationEventProps(position),
        timestamp: new Date(position.timestamp).toISOString(),
      };
      sendToWebSocketServer(eventData);
    },
    (error) => {
      const eventData = {
        type: "geolocation-error",
        ...geolocationErrorEventProps(error),
        timestamp: new Date().toISOString(),
      };
      sendToWebSocketServer(eventData);
    },
  );
}

// Network Status Events
const networkStatusEventProps = () => ({
  downlink: navigator.connection.downlink,
  effectiveType: navigator.connection.effectiveType,
  rtt: navigator.connection.rtt,
  saveData: navigator.connection.saveData,
  type: navigator.connection.type,
});

if (navigator.connection) {
  const updateNetworkStatus = () => {
    const eventData = {
      type: "network-status",
      ...networkStatusEventProps(),
      timestamp: new Date().toISOString(),
    };
    sendToWebSocketServer(eventData);
  };

  navigator.connection.addEventListener("change", updateNetworkStatus);
  updateNetworkStatus();
}

// Speech Recognition Events
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();

  [
    "start",
    "end",
    "result",
    "error",
    "nomatch",
    "soundstart",
    "soundend",
    "speechstart",
    "speechend",
    "audiostart",
    "audioend",
    "audioprocess",
    "soundprocess",
    "mark",
    "boundary",
  ].forEach((event) =>
    recognition.addEventListener(event, (e) => {
      const eventData = createMessage(`speech-${event}`, {
        results: e.results,
        confidence: e.confidence,
        grammar: e.grammar,
        timestamp: new Date().toISOString(),
      });
      sendToWebSocketServer(eventData);
    }),
  );
}

// Service Worker Events
if (navigator.serviceWorker) {
  ["controllerchange", "message", "statechange"].forEach((event) => {
    navigator.serviceWorker.addEventListener(event, (e) => {
      const eventData = createMessage(`service-worker-${event}`, {
        timestamp: new Date().toISOString(),
      });
      sendToWebSocketServer(eventData);
    });
  });
}

// IndexedDB Events
if (window.indexedDB) {
  const request = indexedDB.open("test");

  ["success", "error", "upgradeneeded", "blocked"].forEach((event) => {
    request.addEventListener(event, (e) => {
      const eventData = createMessage(`indexeddb-${event}`, {
        timestamp: new Date().toISOString(),
      });
      sendToWebSocketServer(eventData);
    });
  });

  request.onsuccess = (event) => {
    const db = event.target.result;
    ["abort", "error"].forEach((event) =>
      db.addEventListener(event, (e) => {
        const eventData = createMessage(`indexeddb-${event}`, {
          timestamp: new Date().toISOString(),
        });
        sendToWebSocketServer(eventData);
      }),
    );
  };
}

// Browser Storage Events
window.addEventListener("storage", (e) => {
  const eventData = createMessage("storage", {
    key: e.key,
    oldValue: e.oldValue,
    newValue: e.newValue,
    url: e.url,
    timestamp: new Date().toISOString(),
  });
  sendToWebSocketServer(eventData);
});
