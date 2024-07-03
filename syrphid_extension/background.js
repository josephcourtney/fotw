import { connectWebSocket } from './background/websocket.js';
import { addEventListeners } from './background/listeners.js';
import { handleRuntimeMessage } from './background/handlers.js';

connectWebSocket();
addEventListeners();

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleRuntimeMessage(message, sender, sendResponse);
  return true;
});
