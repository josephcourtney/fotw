import { log } from "./logger.js";
import { sendToWebSocketServer } from "./websocket.js";
import { generateSessionId, createMessage, calculateDistance, logChanges } from "./utils.js";
import { loadConfig, getConfig } from "./config.js";

const sessionId = generateSessionId();

let environment = null;

const initializeEnvironment = () => {
  log("Initializing environment", "info");
  environment = {
    id: sessionId,
    userAgent: navigator.userAgent,
    operatingSystem: navigator.platform,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    extensionVersion: browser.runtime.getManifest().version,
    geolocation: {},
    networkStatus: null,
    batteryStatus: null,
  };
};

initializeEnvironment();

let state = {
  windows: {},
  tabs: {},
};

let stateCache = {
  windows: {},
  tabs: {},
};

const initializeState = async () => {
  log("Initializing state", "info");
  await loadConfig();
};

const updateState = (part, key, value) => {
  const oldState = { ...state[part] };
  state[part][key] = value;
  logChanges(state[part], oldState, part);
  sendStateMessage(part, key);
};

const sendStateMessage = (part, key) => {
  if (state[part] && state[part][key] !== undefined) {
    const delta = calculateDelta(part, key);
    if (delta) {
      log(`Sending state message: ${part}-${key}`, "info");
      sendToWebSocketServer(createMessage(`${part}-state`, sessionId, delta));
      updateCache(part, key, state[part][key]);
    }
  }
};

const calculateDelta = (part, key) => {
  const current = state[part][key];
  const cached = stateCache[part][key] || {};
  const delta = {};
  let hasChanges = false;

  for (const prop in current) {
    if (current[prop] !== cached[prop]) {
      delta[prop] = current[prop];
      hasChanges = true;
    }
  }

  return hasChanges ? delta : null;
};

const updateCache = (part, key, value) => {
  stateCache[part][key] = { ...value };
};

const updateGeolocation = ({ coords: { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed } = {} }) => {
  if (latitude === undefined || longitude === undefined) {
    log("Geolocation could not be determined", "warn");
    return;
  }
  const newGeolocation = { latitude, longitude, accuracy, altitude, altitudeAccuracy, heading, speed };
  if (environment.geolocation.latitude === undefined || environment.geolocation.longitude === undefined) {
    log(`Geolocation determined [${latitude}, ${longitude}], updating state`, "info");
    environment.geolocation = newGeolocation;
    sendStateMessage("environment", "geolocation");
  } else if (calculateDistance(environment.geolocation, newGeolocation) > getConfig().GEOLOCATION_THRESHOLD_METERS) {
    const locationChange = calculateDistance(environment.geolocation, newGeolocation);
    log(`Geolocation change detected ([${environment.geolocation.latitude}, ${environment.geolocation.longitude}] to [${latitude}, ${longitude}] => ${locationChange} m), updating state`, "info");
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
  if (!tab) {
    return;
  }
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

const sendInitialStateMessages = () => {
  sendStateMessage("environment", "environment");
  Object.keys(state.windows).forEach(windowId => sendStateMessage("windows", windowId));
  Object.keys(state.tabs).forEach(tabId => sendStateMessage("tabs", tabId));
};

export {
  environment,
  state,
  initializeEnvironment,
  updateGeolocation,
  updateNetworkStatus,
  updateBatteryStatus,
  updateWindowState,
  updateTabState,
  sendStateMessage,
  handleWindowCreated,
  handleWindowRemoved,
  handleWindowFocusChanged,
  initializeState,
  sendInitialStateMessages
};
