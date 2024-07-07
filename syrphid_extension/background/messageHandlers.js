import { connectWebSocket, sendToWebSocketServer, getSessionId } from "./websocket.js";
import { getConfig } from "./config.js";
import { environment, state } from "./state.js";
import { log, createMessage } from "./utils.js";

const handleRuntimeMessage = async (message, sender, sendResponse) => {
  log(`Handling runtime message: ${JSON.stringify(message)}`, "debug");
  try {
    switch (message.type) {
      case "reconnect":
        log("Reconnecting WebSocket", "info");
        connectWebSocket();
        sendResponse({ result: "reconnected" });
        break;

      case "options-changed":
        log("Options changed, reconnecting WebSocket", "info");
        connectWebSocket();
        sendResponse({ result: "options-changed" });
        break;

      case "ws-status-check":
        log("Checking WebSocket status", "info");
        sendResponse({
          type: "ws-status",
          status: getWebSocketStatus(),
        });
        break;

      case "query-environment":
        log("Querying environment", "debug");
        sendResponse({ type: "environment", data: environment });
        break;

      case "query-window-state":
        log(`Querying window state`, "debug");
        const windowState = await browser.windows.getCurrent();
        sendResponse({
          type: "window-state",
          data: state.windows[windowState.id],
        });
        break;

      case "query-tab-state":
        log("Querying tab state", "debug");
        const tabs = await browser.tabs.query({
          active: true,
          currentWindow: true,
        });
        sendResponse({ type: "tab-state", data: state.tabs[tabs[0].id] });
        break;

      case "query-config":
        log("Querying config", "debug");
        sendResponse({ type: "config", config: getConfig() });
        break;

      default:
        log(`Sending message to WebSocket server: ${JSON.stringify(message)}`, "debug");
        const messageDetails = { windowId: null, tabId: null, ...message.details };
        const wsMessage = createMessage(message.type, getSessionId(), messageDetails);
        if (wsMessage) {
          sendToWebSocketServer(wsMessage);
          sendResponse({ result: "message-sent" });
        } else {
          sendResponse({ error: "Failed to create message" });
        }
    }
  } catch (error) {
    log(`Error handling message: ${error.message}`, "error");
    sendResponse({ error: error.message });
  }
  return true;
};

const getWebSocketStatus = () => {
  return websocket && websocket.readyState === WebSocket.OPEN ? "connected" : "disconnected";
};

export { handleRuntimeMessage };
