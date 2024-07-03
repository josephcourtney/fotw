let socket;
let reconnectInterval = 5000;

function connectWebSocket() {
  browser.storage.local.get('wsServer', ({ wsServer }) => {
    socket = new WebSocket(wsServer || "ws://localhost:8080");

    socket.onopen = function () {
      console.log("WebSocket is open now.");
      browser.runtime.sendMessage({ type: 'ws-status', status: 'connected' });
    };

    socket.onclose = function () {
      console.log("WebSocket is closed now. Reconnecting...");
      browser.runtime.sendMessage({ type: 'ws-status', status: 'disconnected' });
      setTimeout(connectWebSocket, reconnectInterval);
    };

    socket.onerror = function (error) {
      console.log("WebSocket error: ", error);
      browser.runtime.sendMessage({ type: 'ws-status', status: 'error' });
    };
  });
}

connectWebSocket();

function sendToServer(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'reconnect') {
    connectWebSocket();
  }
  if (message.type === 'options-changed') {
    socket.close();
    connectWebSocket();
  }
});

// Track tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    sendToServer({
      type: "navigation",
      tabId: tabId,
      url: changeInfo.url,
    });
  }
});

// Track tab activation
browser.tabs.onActivated.addListener((activeInfo) => {
  browser.tabs.get(activeInfo.tabId, (tab) => {
    sendToServer({
      type: "tab-activated",
      tabId: activeInfo.tabId,
      url: tab.url,
    });
  });
});

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message) => {
  sendToServer(message);
});

// Capture network requests
browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    sendToServer({
      type: "network-request",
      url: details.url,
      method: details.method,
      tabId: details.tabId,
      requestId: details.requestId,
      timeStamp: details.timeStamp,
      initiator: details.initiator || "unknown"
    });
  },
  { urls: ["<all_urls>"] }
);

// Capture network responses
browser.webRequest.onCompleted.addListener(
  function (details) {
    sendToServer({
      type: "network-response",
      url: details.url,
      statusCode: details.statusCode,
      tabId: details.tabId,
      requestId: details.requestId,
      timeStamp: details.timeStamp
    });
  },
  { urls: ["<all_urls>"] }
);

