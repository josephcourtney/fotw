import { getConfig } from "./config.js";
import { environment, state } from "./state.js";

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
  return {
    sessionId,
    type,
    timestamp: new Date().toISOString(),
    environment: { ...environment },
    state: { ...state },
    ...details,
  };
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const GEOLOCATION_THRESHOLD_METERS = 10.0;

const calculateDistance = ({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 }) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
};

export { generateSessionId, log, logChanges, createMessage, debounce, calculateDistance };
