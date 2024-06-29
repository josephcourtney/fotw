// Track navigation events
browser.webNavigation.onCompleted.addListener((details) => {
  const message = {
    event: 'navigation',
    url: details.url,
    timeStamp: details.timeStamp
  };
  console.log("Navigation event detected:", message);
  sendMessageToNativeApp(message);
});

// Send message to native app
function sendMessageToNativeApp(message) {
  console.log("Preparing to send message to native app:", message);
  const port = browser.runtime.connectNative("com.josephcourtney.fotw");

  if (!port) {
    console.error("Failed to connect to native app");
    return;
  }

  console.log("Connected to native app with port:", port);

  port.onMessage.addListener((response) => {
    console.log("Received response from native app:", response);
  });

  port.onDisconnect.addListener((port) => {
    if (port.error) {
      console.error("Disconnected from native app due to error:", port.error);
    } else {
      console.error("Disconnected from native app: port is null");
    }
  });

  try {
    console.log("Message to be sent:", JSON.stringify(message));
    port.postMessage(message);
    console.log("Message sent to native app:", message);
  } catch (error) {
    console.error("Error sending message to native app:", error);
  }
}

// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message from content script:", message);
  sendMessageToNativeApp(message);
  sendResponse({ status: "received" });
  console.log("Sent response back to content script: status received");
});

// Test connection with native app
function testNativeAppConnection() {
  const testMessage = { event: "test", timeStamp: Date.now() };
  console.log("Testing native app connection with message:", testMessage);
  sendMessageToNativeApp(testMessage);
}

// Run the test on startup
testNativeAppConnection();
