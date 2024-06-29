// Track user interactions
document.addEventListener('click', (event) => {
  const message = {
    event: 'click',
    element: event.target.tagName,
    timeStamp: event.timeStamp
  };
  console.log("User click event detected:", message);
  sendMessageToBackground(message);
});

// Send message to background script
function sendMessageToBackground(message) {
  console.log("Preparing to send message to background script:", message);
  browser.runtime.sendMessage(message).then(response => {
    console.log("Message sent to background script successfully. Response:", response);
  }).catch(error => {
    console.error("Error sending message to background script:", error);
  });
}

// Test connection on load
function testConnection() {
  const testMessage = { event: "test", timeStamp: Date.now() };
  console.log("Testing connection to background script with message:", testMessage);
  sendMessageToBackground(testMessage);
}

// Run the test on load
testConnection();
