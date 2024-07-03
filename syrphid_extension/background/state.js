import { generateSessionId, logChanges, createMessage } from './utils.js';
import { sendToWebSocketServer, sessionId, config } from './websocket.js';

let environment = {
  id: generateSessionId(),
  userAgent: navigator.userAgent,
  operatingSystem: navigator.platform,
  screenResolution: `${window.screen.width}x${window.screen.height}`,
  extensionVersion: browser.runtime.getManifest().version,
  geolocation: null,
  networkStatus: null,
  batteryStatus: null,
};

let windowState = {
  id: generateSessionId(),
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  outerWidth: window.outerWidth,
  outerHeight: window.outerHeight,
  devicePixelRatio: window.devicePixelRatio,
};

let tabState = {};

const GEOLOCATION_THRESHOLD = 0.0001; // 0.0001 degrees ~ 32 feet in connecticut

function calculateDistance(coord1, coord2) {
  const { latitude: lat1, longitude: lon1 } = coord1;
  const { latitude: lat2, longitude: lon2 } = coord2;

  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371; // Radius of the Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function sendEnvironmentMessage() {
  sendToWebSocketServer(createMessage('environment', sessionId, environment));
}

function sendWindowStateMessage() {
  sendToWebSocketServer(createMessage('window-state', sessionId, windowState));
}

function sendTabStateMessage() {
  sendToWebSocketServer(createMessage('tab-state', sessionId, tabState));
}

// Initial state messages
function sendInitialStateMessages() {
  sendEnvironmentMessage();
  sendWindowStateMessage();
  sendTabStateMessage();
}

function updateGeolocation(position) {
  const oldGeolocation = environment.geolocation;
  const newGeolocation = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    altitude: position.coords.altitude,
    accuracy: position.coords.accuracy,
    altitudeAccuracy: position.coords.altitudeAccuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
  };

  if (!oldGeolocation || calculateDistance(oldGeolocation, newGeolocation) > GEOLOCATION_THRESHOLD) {
    const oldEnvironment = { ...environment };
    environment.geolocation = newGeolocation;
    logChanges(environment, oldEnvironment, 'Environment', config);
    sendEnvironmentMessage();
  }
}

function updateNetworkStatus() {
  const oldEnvironment = { ...environment };
  environment.networkStatus = {
    downlink: navigator.connection.downlink,
    effectiveType: navigator.connection.effectiveType,
    rtt: navigator.connection.rtt,
    saveData: navigator.connection.saveData,
    type: navigator.connection.type,
  };
  logChanges(environment, oldEnvironment, 'Environment', config);
  sendEnvironmentMessage();
}

function updateBatteryStatus(battery) {
  const oldEnvironment = { ...environment };
  environment.batteryStatus = {
    charging: battery.charging,
    chargingTime: battery.chargingTime,
    dischargingTime: battery.dischargingTime,
    level: battery.level,
  };
  logChanges(environment, oldEnvironment, 'Environment', config);
  sendEnvironmentMessage();
}

function updateWindowState() {
  const oldWindowState = { ...windowState };
  windowState = {
    id: windowState.id,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
    devicePixelRatio: window.devicePixelRatio,
  };
  logChanges(windowState, oldWindowState, 'Window state', config);
  sendWindowStateMessage();
}

function updateTabState(tabId, changeInfo, tab) {
  if (!tab) return;
  const oldTabState = { ...tabState[tabId] };
  tabState[tabId] = {
    url: tab.url,
    title: tab.title,
    status: tab.status,
  };
  logChanges(tabState[tabId], oldTabState, 'Tab state', config);
  sendTabStateMessage();
}

export {
  environment,
  windowState,
  tabState,
  updateGeolocation,
  updateNetworkStatus,
  updateBatteryStatus,
  updateWindowState,
  updateTabState,
  sendEnvironmentMessage,
  sendWindowStateMessage,
  sendTabStateMessage,
  sendInitialStateMessages,
};
