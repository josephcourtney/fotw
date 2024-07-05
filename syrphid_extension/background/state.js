import { log } from "./logger.js";
import { sendToWebSocketServer } from "./websocket.js";
import { generateSessionId, createMessage, calculateDistance, logChanges } from "./utils.js";
import { loadConfig } from "./config.js";

const sessionId = generateSessionId();

let environment = {
  id: sessionId,
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
  tabs: {},
};

const updateState = (part, key, value) => {
  const oldState = { ...state[part] };
  state[part][key] = value;
  logChanges(state[part], oldState, part);
  sendStateMessage(part, key);
};

const sendStateMessage = (part, key) => {
  if (state[part] && state[part][key] !== undefined) {
    log(`Sending state message: ${part}-${key}`, "info");
    sendToWebSocketServer(createMessage(`${part}-state`, sessionId, state[part][key]));
  }
};

const sendInitialStateMessages = () => {
  log("Sending initial state messages", "info");
  sendStateMessage("environment", "environment");
  Object.keys(state.windows).forEach((windowId) => sendStateMessage("windows", windowId));
  Object.keys(state.tabs).forEach((tabId) => sendStateMessage("tabs", tabId));
};

const updateGeolocation = ({ coords }) => {
  log(`Updating geolocation: ${JSON.stringify(coords)}`, "info");
  const newGeolocation = { ...coords };

  if (!environment.geolocation.latitude || calculateDistance(environment.geolocation, newGeolocation) > GEOLOCATION_THRESHOLD_METERS) {
    log("Geolocation change detected, updating state", "info");
    environment.geolocation = newGeolocation;
    sendStateMessage("environment", "geolocation");
  }
};

const updateNetworkStatus = () => {
  log("Updating network status", "info");
  const { downlink, effectiveType, rtt, saveData, type } = navigator.connection;
  environment.networkStatus = { downlink, effectiveType, rtt, saveData, type };
  sendStateMessage("environment", "networkStatus");
};

const updateBatteryStatus = ({ charging, chargingTime, dischargingTime, level }) => {
  log("Updating battery status", "info");
  environment.batteryStatus = { charging, chargingTime, dischargingTime, level };
  sendStateMessage("environment", "batteryStatus");
};

const updateWindowState = (windowId, { innerWidth, innerHeight, outerWidth, outerHeight, devicePixelRatio }) => {
  log(`Updating window state for window ID: ${windowId}`, "info");
  const windowState = { innerWidth, innerHeight, outerWidth, outerHeight, devicePixelRatio };
  updateState("windows", windowId, windowState);
};

const updateTabState = (tabId, changeInfo, tab) => {
  if (!tab) return;
  log(`Updating tab state for tab ID: ${tabId}`, "info");
  const { url, title, status } = tab;
  updateState("tabs", tabId, { url, title, status });
};

const handleWindowCreated = (windowId) => {
  if (!windowId || state.windows[windowId]) {
    log(`Invalid or existing window ID: ${windowId}`, "warn");
    return;
  }
  log(`Adding window: ${windowId}`, "info");
  state.windows[windowId] = { focused: false, tabs: [] };
};

const handleWindowRemoved = (windowId) => {
  log(`Removing window: ${windowId}`, "info");
  delete state.windows[windowId];
};

const handleWindowFocusChanged = (windowId) => {
  log(`Updating window focus: ${windowId}`, "info");
  Object.keys(state.windows).forEach((id) => {
    state.windows[id].focused = id === windowId;
  });
};

const initializeState = async () => {
  log("Initializing state", "info");
  state = { windows: {}, tabs: {} };
  await loadConfig();
};

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
