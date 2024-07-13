document.addEventListener("DOMContentLoaded", () => {
  const geolocationButton = document.getElementById("sendGeolocation");
  const networkStatusButton = document.getElementById("sendNetworkStatus");
  const batteryStatusButton = document.getElementById("sendBatteryStatus");
  const windowStateButton = document.getElementById("sendWindowState");
  const tabStateButton = document.getElementById("sendTabState");
  const openOptionsButton = document.getElementById("openOptions");
  const reconnectButton = document.getElementById("reconnect");

  geolocationButton.addEventListener("click", async () => {
    try {
        if (navigator.geolocation) {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            const { latitude, longitude, accuracy } = position.coords;
            const message = {
                type: "send-geolocation",
                geolocation: { latitude, longitude, accuracy },
            };
            browser.runtime.sendMessage(message);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    } catch (error) {
        console.error("Failed to get geolocation:", error);
    }
  });

  networkStatusButton.addEventListener("click", async () => {
    try {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            const { downlink, effectiveType, rtt, saveData, type } = connection;
            const message = {
                type: "send-network-status",
                networkStatus: { downlink, effectiveType, rtt, saveData, type },
            };
            browser.runtime.sendMessage(message);
        } else {
            alert("Network status API is not supported by this browser.");
        }
    } catch (error) {
        console.error("Failed to get network status:", error);
    }
  });

  batteryStatusButton.addEventListener("click", async () => {
    try {
        if (navigator.getBattery) {
            const battery = await navigator.getBattery();
            const { charging, chargingTime, dischargingTime, level } = battery;
            const message = {
                type: "send-battery-status",
                batteryStatus: { charging, chargingTime, dischargingTime, level },
            };
            browser.runtime.sendMessage(message);
        } else {
            alert("Battery status API is not supported by this browser.");
        }
    } catch (error) {
        console.error("Failed to get battery status:", error);
    }
  });

  windowStateButton.addEventListener("click", async () => {
    try {
        const window = await browser.windows.getCurrent();
        const { id, focused, top, left, width, height, state, type } = window;
        const message = {
            type: "send-window-state",
            windowState: { id, focused, top, left, width, height, state, type },
        };
        browser.runtime.sendMessage(message);
    } catch (error) {
        console.error("Failed to get window state:", error);
    }
  });

  tabStateButton.addEventListener("click", async () => {
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];
        const { id, url, title, status } = tab;
        const message = {
            type: "send-tab-state",
            tabState: { id, url, title, status },
        };
        browser.runtime.sendMessage(message);
    } catch (error) {
        console.error("Failed to get tab state:", error);
    }
  });

  openOptionsButton.addEventListener("click", () => {
    browser.runtime.openOptionsPage();
  });

  reconnectButton.addEventListener("click", () => {
    browser.runtime.sendMessage({ type: "reconnect" });
  });

  browser.storage.local.get(["wsServer", "connectionStatus"], (data) => {
    document.getElementById("wsServer").innerText = data.wsServer || "ws://localhost:8080";
    document.getElementById("connectionStatus").innerText = data.connectionStatus || "Disconnected";
  });

  browser.storage.local.get("eventsSent", (data) => {
    document.getElementById("eventsSent").innerText = data.eventsSent || 0;
  });

  browser.storage.local.get("eventsPending", (data) => {
    document.getElementById("eventsPending").innerText = data.eventsPending || 0;
  });
});
