import { connectWebSocket, sendToWebSocketServer, sessionId, config } from './websocket.js';
import { environment, windowState, tabState } from './state.js';
import { log, createMessage } from './utils.js';

function handleRuntimeMessage(message, sender, sendResponse) {
  try {
    switch (message.type) {
      case "reconnect":
        connectWebSocket();
        sendResponse({ result: "reconnected" });
        break;
      case "options-changed":
        if (websocket) {
          websocket.close();
        }
        connectWebSocket();
        updateEventListeners();
        sendResponse({ result: "options-changed" });
        break;
      case "ws-status-check":
        sendResponse({
          type: "ws-status",
          status: websocket && websocket.readyState === WebSocket.OPEN ? "connected" : "disconnected",
        });
        break;
      case "query-environment":
        sendResponse({ type: "environment", data: environment });
        break;
      case "query-window-state":
        sendResponse({ type: "window-state", data: windowState });
        break;
      case "query-tab-state":
        sendResponse({ type: "tab-state", data: tabState });
        break;
      default:
        sendToWebSocketServer(createMessage(message.type, sessionId, message));
        sendResponse({ result: "message-sent" });
    }
  } catch (error) {
    console.error("Error handling message:", error);
    sendResponse({ error: error.message });
  }
  return true;
}

export { handleRuntimeMessage };
