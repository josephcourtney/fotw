import { connectWebSocket } from "./websocket.js";
import { addEventListeners } from "./listeners.js";
import { handleRuntimeMessage } from "./messageHandlers.js";
import { initializeState, handleWindowCreated, handleWindowRemoved, handleWindowFocusChanged, state } from "./state.js";
import { log } from "./logger.js";
import { loadConfig, getConfig } from "./config.js";  // Import getConfig function

const initializeExtension = async () => {
  log("Initializing state", "info");
  await loadConfig();  // Load the configuration
  await initializeState();
  log(`Initial state: ${JSON.stringify(state)}`, "debug");

  log("Connecting WebSocket", "info");
  connectWebSocket();

  log("Adding event listeners", "info");
  addEventListeners();
};

initializeExtension();

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "get-config") {
    sendResponse(getConfig());
  } else {
    log(`Received runtime message: ${JSON.stringify(message)}`, "debug");
    handleRuntimeMessage(message, sender, sendResponse);
  }
  return true;
});

browser.windows.onCreated.addListener((window) => {
  log(`Window created: ${window.id}`, "info");
  handleWindowCreated(window.id);
});

browser.windows.onRemoved.addListener((windowId) => {
  log(`Window removed: ${windowId}`, "info");
  handleWindowRemoved(windowId);
});

browser.windows.onFocusChanged.addListener((windowId) => {
  log(`Window focus changed: ${windowId}`, "info");
  handleWindowFocusChanged(windowId);
});
