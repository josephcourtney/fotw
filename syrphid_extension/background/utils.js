import { getConfig } from "./config.js";
import { environment, state } from "./state.js";

const mouseEventProps = (event) => ({
  clientX: event.clientX,
  clientY: event.clientY,
  screenX: event.screenX,
  screenY: event.screenY,
  movementX: event.movementX,
  movementY: event.movementY,
  button: event.button,
  buttons: event.buttons,
  ctrlKey: event.ctrlKey,
  shiftKey: event.shiftKey,
  altKey: event.altKey,
  metaKey: event.metaKey,
  timeStamp: event.timeStamp,
});

function generateSessionId() {
  return `_${Math.random().toString(36).substr(2, 9)}`;
}

function log(message, level = "info") {
  const levels = ["debug", "info", "warn", "error"];
  if (levels.indexOf(level) >= levels.indexOf(getConfig().LOG_LEVEL)) {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}

function logChanges(newState, oldState, stateName) {
  for (const key in newState) {
    if (newState[key] !== oldState[key]) {
      log(`${stateName} changed: ${key} from ${oldState[key]} to ${newState[key]}`, "info");
    }
  }
}

function createMessage(type, sessionId, details = {}) {
  if (!environment) {
    log("Environment is undefined in createMessage", "error");
    return null; // Return null or handle this case appropriately
  }

  const windowState = state.windows ? state.windows[details.windowId] || {} : {};
  const tabState = state.tabs ? state.tabs[details.tabId] || {} : {};
  const eventData = details ? {
    clientX: details.clientX,
    clientY: details.clientY,
    screenX: details.screenX,
    screenY: details.screenY,
    movementX: details.movementX,
    movementY: details.movementY,
    button: details.button,
    buttons: details.buttons,
    ctrlKey: details.ctrlKey,
    shiftKey: details.shiftKey,
    altKey: details.altKey,
    metaKey: details.metaKey,
    timeStamp: details.timeStamp
  } : {};

  const message = {
    sessionId,
    type,
    timestamp: new Date().toISOString(),
    environment: environment || {},
    windowState,
    tabState,
    eventData
  };

  log(`Created message: ${JSON.stringify(message)}`, "debug");

  if (!message.windowState) {
    log("windowState is undefined", "error");
  }

  if (!message.tabState) {
    log("tabState is undefined", "error");
  }

  if (!message.eventData) {
    log("eventData is undefined", "error");
  }

  return message;
}

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const GEOLOCATION_THRESHOLD_METERS = 10.0;

const calculateDistance = ({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 }) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
};


const createBaseEventData = (event, state) => {
  const eventProps = getEventProps(event);
  return {
    type: event.type,
    timestamp: new Date().toISOString(),
    ...eventProps,
    state,
  };
};


export { generateSessionId, log, logChanges, createMessage, debounce, calculateDistance };
