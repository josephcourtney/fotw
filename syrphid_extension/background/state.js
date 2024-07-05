import { generateSessionId, logChanges, createMessage, log } from './utils.js';
import { sendToWebSocketServer, sessionId } from './websocket.js';
import { config } from './config.js';

let environment = {
  id: generateSessionId(),
  userAgent: navigator.userAgent,
  operatingSystem: navigator.platform,
  screenResolution: `${window.screen.width}x${window.screen.height}`,
  extensionVersion: browser.runtime.getManifest().version,
  geolocation: {},
  networkStatus: null,
  batteryStatus: null,
};

let state = {
  windows: {},
  tabs: {}
};

const GEOLOCATION_THRESHOLD_METERS = 10.0;

function calculateDistance({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 }) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
}

function updateState(part, key, value) {
  const oldState = { ...state[part] };
  state[part][key] = value;
  logChanges(state[part], oldState, part, config);
  sendStateMessage(part, key);
}

function sendStateMessage(part, key) {
  if (state[part] && state[part][key] !== undefined) {
    log(`Sending state message: ${part}-${key}`, config, "info");
    sendToWebSocketServer(
      createMessage(`${part}-state`, sessionId, state[part][key]),
    );
  }
}

function sendInitialStateMessages() {
  log("Sending initial state messages", config, "info");
  sendStateMessage("environment", "environment");
  Object.keys(state.windows).forEach((windowId) =>
    sendStateMessage("windows", windowId),
  );
  Object.keys(state.tabs).forEach((tabId) => sendStateMessage("tabs", tabId));
}

function updateGeolocation({ coords }) {
  log(`Updating geolocation: ${JSON.stringify(coords)}`, config, "info");
  const newGeolocation = { ...coords };

  if (
    !environment.geolocation.latitude ||
    calculateDistance(environment.geolocation, newGeolocation) >
      GEOLOCATION_THRESHOLD_METERS
  ) {
    log("Geolocation change detected, updating state", config, "info");
    environment.geolocation = newGeolocation;
    sendStateMessage("environment", "geolocation");
  }
}

function updateNetworkStatus() {
  log("Updating network status", config, "info");
  const { downlink, effectiveType, rtt, saveData, type } = navigator.connection;
  environment.networkStatus = { downlink, effectiveType, rtt, saveData, type };
  sendStateMessage("environment", "networkStatus");
}

function updateBatteryStatus({
  charging,
  chargingTime,
  dischargingTime,
  level,
}) {
  log("Updating battery status", config, "info");
  environment.batteryStatus = {
    charging,
    chargingTime,
    dischargingTime,
    level,
  };
  sendStateMessage("environment", "batteryStatus");
}

function updateWindowState(
  windowId,
  { innerWidth, innerHeight, outerWidth, outerHeight, devicePixelRatio },
) {
  log(`Updating window state for window ID: ${windowId}`, config, "info");
  const windowState = {
    innerWidth,
    innerHeight,
    outerWidth,
    outerHeight,
    devicePixelRatio,
  };
  updateState("windows", windowId, windowState);
}

function updateTabState(tabId, changeInfo, tab) {
  if (!tab) {
    return;
  }
  log(`Updating tab state for tab ID: ${tabId}`, config, "info");
  const { url, title, status } = tab;
  updateState("tabs", tabId, { url, title, status });
}

function handleWindowCreated(windowId) {
  if (!windowId || state.windows[windowId]) {
    log(`Invalid or existing window ID: ${windowId}`, config, "warn");
    return;
  }

  log(`Adding window: ${windowId}`, config, "info");
  state.windows[windowId] = { focused: false, tabs: [] };
}

function handleWindowRemoved(windowId) {
  log(`Removing window: ${windowId}`, config, "info");
  delete state.windows[windowId];
}

function handleWindowFocusChanged(windowId) {
  log(`Updating window focus: ${windowId}`, config, "info");
  Object.keys(state.windows).forEach((id) => {
    state.windows[id].focused = id === windowId;
  });
}

function initializeState() {
  log("Initializing state", config, "info");
  state = { windows: {}, tabs: {} };
}

export {
  environment,
  state,
  updateGeolocation,
  updateNetworkStatus,
  updateBatteryStatus,
  updateWindowState,
  updateTabState,
  sendInitialStateMessages,
  handleWindowCreated,
  handleWindowRemoved,
  handleWindowFocusChanged,
  initializeState,
};
