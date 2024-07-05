document.addEventListener("DOMContentLoaded", () => {
  const wsServerElement = document.getElementById("wsServer");
  const connectionStatusElement = document.getElementById("connectionStatus");
  const eventsSentElement = document.getElementById("eventsSent");
  const eventsPendingElement = document.getElementById("eventsPending");
  const openOptionsButton = document.getElementById("openOptions");
  const reconnectButton = document.getElementById("reconnect");

  const updatePopup = () => {
    browser.storage.local.get("wsServer", ({ wsServer }) => {
      wsServerElement.textContent = wsServer || "ws://localhost:8080";
    });
    browser.runtime.sendMessage({ type: "ws-status-check" });
  };

  openOptionsButton.addEventListener("click", () => {
    browser.runtime.openOptionsPage();
  });

  reconnectButton.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "reconnect" });
  });

  browser.runtime.onMessage.addListener((message) => {
    if (message.type === "ws-status") {
      connectionStatusElement.textContent = message.status;
    }
  });

  updatePopup();
});
