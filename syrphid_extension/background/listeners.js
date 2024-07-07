import {
  updateGeolocation,
  updateNetworkStatus,
  updateBatteryStatus,
  updateWindowState,
  updateTabState,
} from "./state.js";
import { sendToWebSocketServer } from "./websocket.js";
import { log, debounce } from "./utils.js";

const debouncedUpdateWindowState = debounce((windowId) => {
  browser.windows.getCurrent().then((window) => {
    updateWindowState(window.id, window);
  });
}, 200);

function addEventListeners() {
  log("Adding window resize event listener", "info");
  window.addEventListener("resize", () => {
    log("Window resize event detected", "debug");
    browser.windows.getCurrent().then((window) => {
      debouncedUpdateWindowState(window.id);
    });
  });

  log("Adding tabs update event listener", "info");
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    log(`Tab updated: ${tabId}, Change Info: ${JSON.stringify(changeInfo)}`, "debug");
    updateTabState(tabId, changeInfo, tab);
  });

  log("Adding tabs activation event listener", "info");
  browser.tabs.onActivated.addListener((activeInfo) => {
    log(`Tab activated: ${activeInfo.tabId}`, "debug");
    updateTabState(activeInfo.tabId);
  });

  if (navigator.geolocation) {
    log("Adding geolocation watch position listener", "info");
    navigator.geolocation.watchPosition(updateGeolocation, (error) => {
      const eventData = {
        type: "geolocation-error",
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
      log(`Geolocation error: ${JSON.stringify(eventData)}`, "warn");
      sendToWebSocketServer(eventData);
    }, { enableHighAccuracy: true });
  }

  if (navigator.connection) {
    log("Adding network status change listener", "info");
    navigator.connection.addEventListener("change", updateNetworkStatus);
    updateNetworkStatus();
  }

  if (navigator.getBattery) {
    log("Adding battery status listeners", "info");
    navigator.getBattery().then((battery) => {
      battery.addEventListener("chargingchange", () => updateBatteryStatus(battery));
      battery.addEventListener("levelchange", () => updateBatteryStatus(battery));
      updateBatteryStatus(battery);
    });
  }
}

export { addEventListeners };
