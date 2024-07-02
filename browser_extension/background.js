let socket = new WebSocket("ws://localhost:8080");

socket.onopen = function (event) {
  console.log("WebSocket is open now.");
};

socket.onclose = function (event) {
  console.log("WebSocket is closed now.");
};

socket.onerror = function (error) {
  console.log("WebSocket error: ", error);
};

function sendToServer(data) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
}

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
  function(details) {
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
  function(details) {
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
