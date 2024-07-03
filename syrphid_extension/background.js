let socket;
let reconnectInterval = 5000;
let sessionId = generateSessionId();

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

function generateSessionId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

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
      sessionId: sessionId,
      type: "navigation",
      tabId: tabId,
      url: changeInfo.url,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      operatingSystem: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      extensionVersion: browser.runtime.getManifest().version,
      tabTitle: tab.title
    });
  }
});

// Track tab activation
browser.tabs.onActivated.addListener((activeInfo) => {
  browser.tabs.get(activeInfo.tabId, (tab) => {
    sendToServer({
      sessionId: sessionId,
      type: "tab-activated",
      tabId: activeInfo.tabId,
      url: tab.url,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      operatingSystem: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      extensionVersion: browser.runtime.getManifest().version,
      tabTitle: tab.title
    });
  });
});

// Listen for messages from content scripts
browser.runtime.onMessage.addListener((message) => {
  message.sessionId = sessionId;
  message.userAgent = navigator.userAgent;
  message.operatingSystem = navigator.platform;
  message.screenResolution = `${window.screen.width}x${window.screen.height}`;
  message.extensionVersion = browser.runtime.getManifest().version;
  sendToServer(message);
});

// Capture network requests
browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    sendToServer({
      sessionId: sessionId,
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
      sessionId: sessionId,
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

connectWebSocket();
