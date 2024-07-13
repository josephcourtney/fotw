import { webSocketManager } from "./websocket.js";
import { loadConfig } from "./config.js";
import { EventEmitter, handleError } from "./utils.js";

const eventEmitter = new EventEmitter();

const sendOverWebSocket = async (label, message) => {
  try {
    if (webSocketManager.isConnected) {
      await webSocketManager.send({ label, message });
    } else {
      webSocketManager.messageQueue.push({ label, message });
    }
  } catch (error) {
    handleError(error, `Error sending ${label} message via WebSocket`);
  }
};

const withAsyncErrorHandling =
  (task, label) =>
  async (...args) => {
    try {
      return await task(...args);
    } catch (error) {
      handleError(error, label);
      throw error;
    }
  };

const createAsyncHandler = (task) => async (message, sender, sendResponse) => {
  message.tabId = sender.tab?.id ?? null;
  try {
    await task(message);
    sendResponse({ status: "success" });
  } catch (error) {
    sendResponse({ status: "error", error: error.message });
  }
  return true;
};

chrome.runtime.onMessage.addListener(createAsyncHandler(webSocketManager.send));

loadConfig();
webSocketManager.connect();

const isFeatureAvailable = (feature) => feature !== undefined;

const getDetails = (event, details) => {
  eventEmitter.emit(event, details);
  sendOverWebSocket(event, details);
  return details;
};

const getUserAgentDetails = () => {
  const ua = navigator.userAgent;
  const uaData = navigator.userAgentData || {};
  return getDetails("userAgentDetails", {
    userAgent: ua,
    vendor: navigator.vendor,
    product: navigator.product,
    uaData,
    browserName: uaData.brands?.[0]?.brand || "Unknown",
    browserVersion: uaData.brands?.[0]?.version || "Unknown",
  });
};

const getPlugins = () => {
  return getDetails(
    "plugins",
    isFeatureAvailable(navigator.plugins)
      ? [...navigator.plugins].map((plugin) => plugin.name)
      : [],
  );
};

const getServiceWorkers = withAsyncErrorHandling(async () => {
  const serviceWorkers =
    "serviceWorker" in navigator
      ? await navigator.serviceWorker
          .getRegistrations()
          .then((regs) => regs.map((reg) => reg.scope))
      : [];
  return getDetails("serviceWorkers", serviceWorkers);
}, "getServiceWorkers");

const getInstalledComponents = withAsyncErrorHandling(async () => {
  const installedComponents = {
    plugins: getPlugins(),
    serviceWorkers: await getServiceWorkers(),
  };
  return getDetails("installedComponents", installedComponents);
}, "getInstalledComponents");

const getLanguageAndLocale = () => {
  return getDetails("languageAndLocale", {
    language: navigator.language,
    languages: navigator.languages,
  });
};

const getBrowserModes = withAsyncErrorHandling(async () => {
  const storageEstimate = await navigator.storage.estimate();
  const isIncognito = storageEstimate && storageEstimate.quota < 120000000;
  const features = {
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory ?? "Not Available",
    maxTouchPoints: navigator.maxTouchPoints,
    webGL: !!document.createElement("canvas").getContext("webgl"),
    webVR: "getVRDisplays" in navigator,
    webXR: "xr" in navigator,
  };
  return getDetails("browserModes", { incognito: isIncognito, features });
}, "getBrowserModes");

const getMachineInfo = withAsyncErrorHandling(async () => {
  let renderer = "Not Available";
  if (window.WebGLRenderingContext) {
    try {
      const gl = document.createElement("canvas").getContext("webgl");
      renderer = gl ? gl.getParameter(gl.RENDERER) : renderer;
    } catch {
      renderer = "WebGL creation failed";
    }
  }

  const machineInfo = {
    os: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory ?? "Not Available",
    renderer,
    architecture: navigator.userAgentData?.architecture ?? "Unknown",
  };
  return getDetails("machineInfo", machineInfo);
}, "getMachineInfo");

const getMultiMonitorSetup = withAsyncErrorHandling(async () => {
  const screens =
    "getScreenDetails" in window ? await window.getScreenDetails() : [];
  return getDetails("multiMonitorSetup", {
    multiMonitor: screens.length > 1,
    screens,
  });
}, "getMultiMonitorSetup");

const getDisplayInfo = withAsyncErrorHandling(async () => {
  const displayCharacteristics = {
    hdrSupport: "HDR" in screen,
    colorProfiles: screen.colorDepth > 24 ? "Wide Color Gamut" : "Standard",
    highResolution: window.devicePixelRatio > 1,
  };
  return getDetails("displayInfo", {
    screenResolution: { width: screen.width, height: screen.height },
    viewportSize: { width: window.innerWidth, height: window.innerHeight },
    colorDepth: screen.colorDepth,
    pixelDensity: window.devicePixelRatio,
    screenOrientation: screen.orientation.type,
    availableScreenArea: {
      width: screen.availWidth,
      height: screen.availHeight,
    },
    displayCharacteristics,
    multiMonitor: await getMultiMonitorSetup(),
  });
}, "getDisplayInfo");

const getMediaDevices = withAsyncErrorHandling(async () => {
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.warn("Media Devices API not supported.");
    return getDetails("mediaDevices", []);
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return getDetails("mediaDevices", devices);
  } catch (error) {
    return getDetails("mediaDevices", []);
  }
}, "getMediaDevices");

const getMediaCapabilities = withAsyncErrorHandling(async () => {
  const { mediaCapabilities } = navigator;
  const webrtcSupport = "RTCPeerConnection" in window;
  let supportedVideoFormats = "Not available";

  if (mediaCapabilities?.decodingInfo) {
    const videoConfig = {
      type: "file",
      video: {
        contentType: 'video/webm; codecs="vp8"',
        width: 1920,
        height: 1080,
        bitrate: 120000,
        framerate: 30,
      },
    };
    supportedVideoFormats = await mediaCapabilities.decodingInfo(videoConfig);
  }

  return getDetails("mediaCapabilities", {
    mediaCapabilities,
    webrtcSupport,
    supportedVideoFormats,
  });
}, "getMediaCapabilities");

const getBatteryStatus = withAsyncErrorHandling(async () => {
  if (!navigator.getBattery) {
    console.warn("Battery Status API not supported.");
    return getDetails("batteryStatus", null);
  }

  try {
    const battery = await navigator.getBattery();
    const batteryStatus = {
      level: battery.level,
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    };
    return getDetails("batteryStatus", batteryStatus);
  } catch (error) {
    return getDetails("batteryStatus", null);
  }
}, "getBatteryStatus");

const monitorBatteryStatus = withAsyncErrorHandling(async () => {
  if (!navigator.getBattery) {
    console.warn("Battery Status API not supported.");
    return getDetails("batteryStatus", null);
  }

  try {
    const battery = await navigator.getBattery();
    const updateBatteryStatus = () => {
      const batteryStatus = {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      };
      getDetails("batteryStatus", batteryStatus);
    };

    updateBatteryStatus();
    [
      "chargingchange",
      "levelchange",
      "chargingtimechange",
      "dischargingtimechange",
    ].forEach((event) => battery.addEventListener(event, updateBatteryStatus));
  } catch (error) {
    return getDetails("batteryStatus", null);
  }
}, "monitorBatteryStatus");

const getNetworkPerformance = () => {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;
  const networkPerformance = {
    downlinkMax: connection?.downlinkMax ?? "Not Supported",
    effectiveType: connection?.effectiveType ?? "Not Supported",
    rtt: connection?.rtt ?? "Not Supported",
    saveData: connection?.saveData ?? "Not Supported",
  };
  return getDetails("networkPerformance", networkPerformance);
};

const monitorNetworkPerformance = () => {
  const connection =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!connection) {
    console.warn("Network Information API not supported.");
    return getDetails("networkPerformance", {
      downlinkMax: "Not Supported",
      effectiveType: "Not Supported",
      rtt: "Not Supported",
      saveData: "Not Supported",
    });
  }

  const updateNetworkPerformance = () => {
    const networkPerformance = {
      downlinkMax: connection.downlinkMax,
      effectiveType: connection.effectiveType,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
    getDetails("networkPerformance", networkPerformance);
  };

  updateNetworkPerformance();
  connection.addEventListener("change", updateNetworkPerformance);
};

const getARCapabilities = withAsyncErrorHandling(async () => {
  const arCapabilities =
    "xr" in navigator &&
    (await navigator.xr.isSessionSupported("immersive-ar"));
  return getDetails("arCapabilities", arCapabilities);
}, "getARCapabilities");

const getWebShareCapabilities = () => {
  return getDetails("webShareCapabilities", {
    canShare: "share" in navigator,
  });
};

const getWebLocks = withAsyncErrorHandling(async () => {
  if (!("locks" in navigator)) {
    return getDetails(
      "webLocks",
      "Web Locks API not supported in this browser",
    );
  }
  const lockAvailability = await navigator.locks.query();
  return getDetails("webLocks", lockAvailability);
}, "getWebLocks");

const getDigitalInkCapabilities = async () => {
  return getDetails(
    "digitalInkCapabilities",
    "Digital Ink API requires specific permissions and availability",
  );
};

const getGeolocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((position) => {
      const geolocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      resolve(getDetails("geolocation", geolocation));
    }, reject);
  });
};

const monitorGeolocation = () => {
  if (!navigator.geolocation) {
    console.warn("Geolocation API not supported.");
    return getDetails("geolocation", null);
  }

  const updateGeolocation = (position) => {
    const geolocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    getDetails("geolocation", geolocation);
  };

  navigator.geolocation.getCurrentPosition(updateGeolocation);
  navigator.geolocation.watchPosition(updateGeolocation);
};

const getWindowsAndTabs = () => {
  return new Promise((resolve, reject) => {
    chrome.windows.getAll({ populate: true }, (windows) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      const windowTabs = windows.map((win) => ({
        id: win.id,
        focused: win.focused,
        top: win.top,
        left: win.left,
        width: win.width,
        height: win.height,
        tabs: win.tabs.map((tab) => ({
          id: tab.id,
          index: tab.index,
          windowId: tab.windowId,
          highlighted: tab.highlighted,
          active: tab.active,
          pinned: tab.pinned,
          url: tab.url,
          title: tab.title,
          incognito: tab.incognito,
        })),
      }));
      resolve(getDetails("windowsAndTabs", windowTabs));
    });
  });
};

const backgroundEvents = [
  {
    name: "devicemotion",
    parameters: [
      "acceleration",
      "accelerationIncludingGravity",
      "rotationRate",
      "interval",
    ],
  },
  {
    name: "deviceorientation",
    parameters: ["alpha", "beta", "gamma", "absolute"],
  },
  {
    name: "deviceorientationabsolute",
    parameters: ["alpha", "beta", "gamma", "absolute"],
  },
  { name: "deviceproximity", parameters: ["value", "min", "max"] },
  { name: "chargingchange", parameters: ["charging"] },
  { name: "chargingtimechange", parameters: ["chargingTime"] },
  { name: "levelchange", parameters: ["level"] },
  { name: "dischargingtimechange", parameters: ["dischargingTime"] },
  { name: "getCurrentPosition", parameters: ["position"] },
  { name: "watchPosition", parameters: ["position"] },
  { name: "devicelight", parameters: ["value"] },
  { name: "userproximity", parameters: ["value", "min", "max"] },
  { name: "orientationchange", parameters: [] },
  { name: "gamepadconnected", parameters: ["gamepad"] },
  { name: "gamepaddisconnected", parameters: ["gamepad"] },
  { name: "gamepadremapping", parameters: ["gamepad"] },
  { name: "controllerchange", parameters: [] },
  { name: "activate", parameters: ["isUpdate"] },
  { name: "fetch", parameters: ["request"] },
  { name: "install", parameters: [] },
  {
    name: "message",
    parameters: ["data", "origin", "lastEventId", "source", "ports"],
  },
  { name: "push", parameters: ["data"] },
  { name: "statechange", parameters: ["state"] },
  { name: "sync", parameters: ["tag", "lastChance"] },
  { name: "close", parameters: ["code", "reason", "wasClean"] },
  { name: "open", parameters: [] },
  { name: "icecandidate", parameters: ["candidate"] },
  { name: "iceconnectionstatechange", parameters: ["iceConnectionState"] },
  { name: "negotiationneeded", parameters: [] },
  { name: "signalingstatechange", parameters: ["signalingState"] },
  { name: "online", parameters: [] },
  { name: "offline", parameters: [] },
  { name: "networkchange", parameters: [] },
];

const INTERNAL_MESSAGE_FLAG = "__internal__";

const logEvent = (event, parameters) => {
  const log = {
    type: event.type,
    timestamp: new Date(),
    details: parameters.reduce(
      (acc, param) => ({ ...acc, [param]: event[param] }),
      {},
    ),
  };
  sendOverWebSocket("eventLog", log);
  if (event.type === "message") {
    event[INTERNAL_MESSAGE_FLAG] = true;
  }
};

const manageEventListener = (action, eventName, handler) => {
  try {
    window[`${action}EventListener`](eventName, handler);
  } catch (error) {
    console.error(
      `Failed to ${action} listener for event ${eventName}: ${error.message}`,
    );
  }
};

const eventManager = (() => {
  const eventListeners = {};
  const createHandler = (eventName, parameters) => (event) => {
    if (eventName === "message" && event[INTERNAL_MESSAGE_FLAG]) {
      return;
    }
    logEvent(event, parameters);
    getDetails(eventName, event);
  };
  return {
    enableEvent: (eventName) => {
      if (!eventListeners[eventName]) {
        const event = backgroundEvents.find((e) => e.name === eventName);
        if (event) {
          const handler = createHandler(eventName, event.parameters);
          manageEventListener("add", eventName, handler);
          eventListeners[eventName] = handler;
        } else {
          console.error(`Event ${eventName} not found.`);
        }
      } else {
        console.warn(`Event ${eventName} already enabled.`);
      }
    },
    disableEvent: (eventName) => {
      if (eventListeners[eventName]) {
        manageEventListener("remove", eventName, eventListeners[eventName]);
        delete eventListeners[eventName];
      } else {
        console.error(`Event ${eventName} not enabled.`);
      }
    },
  };
})();

backgroundEvents.forEach((event) => eventManager.enableEvent(event.name));

const reportInitialState = async () => {
  const tasks = [
    { label: "Display Information", task: getDisplayInfo },
    { label: "Battery Status", task: getBatteryStatus },
    { label: "Network Performance", task: getNetworkPerformance },
    { label: "Geolocation", task: getGeolocation },
    { label: "Windows and Tabs", task: getWindowsAndTabs },
  ];
  for (const { label, task } of tasks) {
    await sendOverWebSocket(label, await withAsyncErrorHandling(task, label)());
  }
};

const pollState = async () => {
  const tasks = [
    { label: "Browser Information", task: getUserAgentDetails },
    { label: "Installed Components", task: getInstalledComponents },
    { label: "Language and Locale", task: getLanguageAndLocale },
    { label: "Browser Modes", task: getBrowserModes },
    { label: "Machine Information", task: getMachineInfo },
    { label: "Media Devices and Capabilities", task: getMediaDevices },
    {
      label: "Media Capabilities and WebRTC Support",
      task: getMediaCapabilities,
    },
    { label: "Multi-Monitor Setup", task: getMultiMonitorSetup },
    { label: "Augmented Reality Capabilities", task: getARCapabilities },
    { label: "Web Share Capabilities", task: getWebShareCapabilities },
    { label: "Web Locks", task: getWebLocks },
    { label: "Digital Ink Capabilities", task: getDigitalInkCapabilities },
  ];
  for (const { label, task } of tasks) {
    await sendOverWebSocket(label, await withAsyncErrorHandling(task, label)());
  }
};

webSocketManager.onOpen(async () => {
  await reportInitialState();
  await pollState();
  await monitorBatteryStatus();
  await monitorNetworkPerformance();
  await monitorGeolocation();
  setInterval(pollState, 60000);
});
