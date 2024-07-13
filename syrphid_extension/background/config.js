const TRACKED_EVENTS = [
  "DeviceMotionEvent", "DeviceOrientationEvent", "abort", "addtrack", "animationcancel",
  "animationend", "animationiteration", "animationstart", "audioend", "audioprocess", 
  "audiostart", "beforeinput", "beforeunload", "blur", "boundary", "canplay", 
  "canplaythrough", "change", "chargingchange", "chargingtimechange", "click", "close", 
  "complete", "compositionend", "compositionstart", "compositionupdate", "contextmenu", 
  "controllerchange", "copy", "cut", "dblclick", "devicemotion", "deviceorientation", 
  "deviceorientationabsolute", "dischargingtimechange", "drag", "dragend", "dragenter", 
  "dragexit", "dragleave", "dragover", "dragstart", "drop", "durationchange", "end", 
  "ended", "error", "focus", "focusin", "focusout", "formdata", "fullscreenchange", 
  "fullscreenerror", "gamepadconnected", "gamepaddisconnected", "getCurrentPosition", 
  "hashchange", "input", "invalid", "keydown", "keypress", "keyup", "levelchange", 
  "load", "loadeddata", "loadedmetadata", "loadstart", "mark", "merchantvalidation", 
  "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", 
  "mouseup", "networkchange", "nomatch", "offline", "online", "open", "pagehide", 
  "pageshow", "paste", "pause", "paymentmethodchange", "play", "playing", "popstate", 
  "progress", "push", "ratechange", "readystatechange", "removetrack", "reset", "resize", 
  "result", "scroll", "securitypolicyviolation", "seeked", "seeking", "select", "slotchange", 
  "soundend", "soundprocess", "soundstart", "speechend", "speecherror", "speechstart", 
  "stalled", "start", "statechange", "storage", "submit", "suspend", "sync", "timeupdate", 
  "toggle", "touchcancel", "touchend", "touchmove", "touchstart", "transitioncancel", 
  "transitionend", "transitionrun", "transitionstart", "unload", "visibilitychange", 
  "volumechange", "waiting", "watchPosition", "wheel",
];

const DEFAULT_CONFIG = {
  WS_SERVER: 'ws://localhost:8080',
  MAX_RECONNECT_INTERVAL_MS: 32000,
  RECONNECT_INTERVAL_MS: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
  RECONNECT_ATTEMPTS: 0,
  EXPONENTIAL_BACKOFF_FACTOR: 2,
  GEOLOCATION_THRESHOLD_METERS: 10.0,
  TRACKED_EVENTS,
};

let config = { ...DEFAULT_CONFIG };

const getConfig = () => ({ ...config });

const setConfig = (newConfig) => {
  config = { ...config, ...newConfig };
};

const loadConfig = async () => {
  try {
    const storage = await browser.storage.local.get(Object.keys(DEFAULT_CONFIG));
    config = { ...DEFAULT_CONFIG, ...storage };
    console.log('Configuration loaded');
  } catch (error) {
    console.error(`Error loading config: ${error.message}`);
  }
};

export { loadConfig, getConfig, setConfig, DEFAULT_CONFIG };
