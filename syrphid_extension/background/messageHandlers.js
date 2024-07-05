import {
  connectWebSocket,
  sendToWebSocketServer,
  sessionId,
  websocket,
} from "./websocket.js";
import { config } from "./config.js";
import { environment, state } from "./state.js";
import { log, createMessage } from "./utils.js";

const logAndRespond = (message, config, level, response, sendResponse) => {
  log(message, config, level);
  sendResponse(response);
};

const getWebSocketStatus = () => {
  return websocket && websocket.readyState === WebSocket.OPEN
    ? "connected"
    : "disconnected";
};

const handleRuntimeMessage = async (message, sender, sendResponse) => {
  log(`Handling runtime message: ${JSON.stringify(message)}`, config, "debug");
  try {
    switch (message.type) {
      case "reconnect":
        log("Reconnecting WebSocket", config, "info");
        connectWebSocket();
        sendResponse({ result: "reconnected" });
        break;
      case "options-changed":
        log("Options changed, reconnecting WebSocket", config, "info");
        if (websocket) {
          websocket.close();
        }
        connectWebSocket();
        updateEventListeners();
        sendResponse({ result: "options-changed" });
        break;
      case "ws-status-check":
        log("Checking WebSocket status", config, "info");
        sendResponse({
          type: "ws-status",
          status:
            websocket && websocket.readyState === WebSocket.OPEN
              ? "connected"
              : "disconnected",
        });
        break;
      case "query-environment":
        log("Querying environment", config, "debug");
        sendResponse({ type: "environment", data: environment });
        break;
      case "query-window-state":
        log(`Querying window state`, config, "debug");
        browser.windows.getCurrent().then((window) => {
          sendResponse({
            type: "window-state",
            data: state.windows[window.id],
          });
        });
        break;
      case "query-tab-state":
        log("Querying tab state", config, "debug");
        const tabs = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        sendResponse({ type: "tab-state", data: state.tabs[tabs[0].id] });
        break;
      case "query-config":
        log("Querying config", config, "debug");
        sendResponse({ type: "config", config });
        break;
      default:
        log(
          `Sending message to WebSocket server: ${JSON.stringify(message)}`,
          config,
          "debug",
        );
        sendToWebSocketServer(createMessage(message.type, sessionId, message));
        sendResponse({ result: "message-sent" });
    }
  } catch (error) {
    log(`Error handling message: ${error.message}`, config, "error");
    sendResponse({ error: error.message });
  }
  return true;
};

export { handleRuntimeMessage };
