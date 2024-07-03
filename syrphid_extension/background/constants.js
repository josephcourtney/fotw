const CONFIG_KEYS = {
  WS_SERVER: "wsServer",
  LOG_LEVEL: "logLevel",
  TRACKED_EVENTS: "trackedEvents",
};

const DEFAULT_CONFIG = {
  WS_SERVER: "ws://localhost:8080",
  LOG_LEVEL: "info",
  RECONNECT_INTERVAL_MS: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
  RECONNECT_ATTEMPTS: 0,
  EXPONENTIAL_BACKOFF_FACTOR: 2,
  MAX_RECONNECT_INTERVAL_MS: 30000,
  TRACKED_EVENTS: [
    "DeviceMotionEvent",
    "DeviceOrientationEvent",
    "wheel",
    // ... other events ...
  ],
};

export { CONFIG_KEYS, DEFAULT_CONFIG };
