import {
  updateGeolocation,
  updateNetworkStatus,
  updateBatteryStatus,
  updateWindowState,
  updateTabState,
} from './state.js';

function addEventListeners() {
  window.addEventListener('resize', updateWindowState);
  browser.tabs.onUpdated.addListener(updateTabState);
  browser.tabs.onActivated.addListener(updateTabState);

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(updateGeolocation, (error) => {
      const eventData = {
        type: "geolocation-error",
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
      sendToWebSocketServer(eventData);
    });
  }

  if (navigator.connection) {
    navigator.connection.addEventListener("change", updateNetworkStatus);
    updateNetworkStatus();
  }

  if (navigator.getBattery) {
    navigator.getBattery().then((battery) => {
      battery.addEventListener("chargingchange", () => updateBatteryStatus(battery));
      battery.addEventListener("levelchange", () => updateBatteryStatus(battery));
      updateBatteryStatus(battery);
    });
  }
}

export { addEventListeners };
