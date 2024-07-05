import { config } from "./config.js";
import { connectWebSocket } from "./websocket.js";
import { addEventListeners } from "./listeners.js";
import { handleRuntimeMessage } from "./messageHandlers.js";
import {
  initializeState,
  handleWindowCreated,
  handleWindowRemoved,
  handleWindowFocusChanged,
} from "./state.js";
import { log } from "./utils.js";

log("Initializing state", config, "info");
initializeState();

log("Connecting WebSocket", config, "info");
connectWebSocket();

log("Adding event listeners", config, "info");
addEventListeners();

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "get-config") {
    sendResponse(config);
  } else {
    log(
      `Received runtime message: ${JSON.stringify(message)}`,
      config,
      "debug",
    );
    handleRuntimeMessage(message, sender, sendResponse);
  }
  return true;
});

browser.windows.onCreated.addListener((window) => {
  log(`Window created: ${window.id}`, config, "info");
  handleWindowCreated(window.id);
});

browser.windows.onRemoved.addListener((windowId) => {
  log(`Window removed: ${windowId}`, config, "info");
  handleWindowRemoved(windowId);
});

browser.windows.onFocusChanged.addListener((windowId) => {
  log(`Window focus changed: ${windowId}`, config, "info");
  handleWindowFocusChanged(windowId);
});
