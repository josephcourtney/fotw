import { sessionId } from "./websocket.js"; // Ensure sessionId is imported from websocket.js

function generateSessionId() {
  return `_${Math.random().toString(36).substr(2, 9)}`;
}

function log(message, config, level = "info") {
  const levels = ["debug", "info", "warn", "error"];
  if (levels.indexOf(level) >= levels.indexOf(config.LOG_LEVEL)) {
    console.log(`[${level.toUpperCase()}] ${message}`);
  }
}

function logChanges(newState, oldState, stateName, config) {
  for (const key in newState) {
    if (newState[key] !== oldState[key]) {
      log(
        `${stateName} changed: ${key} from ${oldState[key]} to ${newState[key]}`,
        config,
        "info",
      );
    }
  }
}

function createMessage(type, sessionId, details = {}) {
  return {
    sessionId,
    type,
    timestamp: new Date().toISOString(),
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

export { generateSessionId, log, logChanges, createMessage, debounce };
