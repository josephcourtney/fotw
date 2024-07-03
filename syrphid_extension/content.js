const eventConfigurations = {
  DeviceMotionEvent: true,
  DeviceOrientationEvent: true,
  abort: true,
  addtrack: true,
  animationcancel: true,
  animationend: true,
  animationiteration: true,
  animationstart: true,
  audioend: true,
  audioprocess: true,
  audiostart: true,
  beforeinput: true,
  beforeunload: true,
  blur: true,
  boundary: true,
  canplay: true,
  canplaythrough: true,
  change: true,
  chargingchange: true,
  chargingtimechange: true,
  click: true,
  close: true,
  complete: true,
  compositionend: true,
  compositionstart: true,
  compositionupdate: true,
  contextmenu: true,
  controllerchange: true,
  copy: true,
  cut: true,
  dblclick: true,
  devicemotion: true,
  deviceorientation: true,
  deviceorientationabsolute: true,
  dischargingtimechange: true,
  drag: true,
  dragend: true,
  dragenter: true,
  dragexit: true,
  dragleave: true,
  dragover: true,
  dragstart: true,
  drop: true,
  durationchange: true,
  end: true,
  ended: true,
  error: true,
  focus: true,
  focusin: true,
  focusout: true,
  formdata: true,
  fullscreenchange: true,
  fullscreenerror: true,
  gamepadconnected: true,
  gamepaddisconnected: true,
  getCurrentPosition: true,
  hashchange: true,
  input: true,
  invalid: true,
  keydown: true,
  keypress: true,
  keyup: true,
  levelchange: true,
  load: true,
  loadeddata: true,
  loadedmetadata: true,
  loadstart: true,
  mark: true,
  merchantvalidation: true,
  mousedown: true,
  mouseenter: true,
  mouseleave: true,
  mousemove: true,
  mouseout: true,
  mouseover: true,
  mouseup: true,
  nomatch: true,
  open: true,
  pagehide: true,
  pageshow: true,
  paste: true,
  pause: true,
  paymentmethodchange: true,
  play: true,
  playing: true,
  popstate: true,
  progress: true,
  push: true,
  ratechange: true,
  readystatechange: true,
  removetrack: true,
  reset: true,
  resize: true,
  result: true,
  scroll: true,
  securitypolicyviolation: true,
  seeked: true,
  seeking: true,
  select: true,
  slotchange: true,
  soundend: true,
  soundprocess: true,
  soundstart: true,
  speechend: true,
  speecherror: true,
  speechstart: true,
  stalled: true,
  start: true,
  statechange: true,
  storage: true,
  submit: true,
  suspend: true,
  sync: true,
  timeupdate: true,
  toggle: true,
  touchcancel: true,
  touchend: true,
  touchmove: true,
  touchstart: true,
  transitioncancel: true,
  transitionend: true,
  transitionrun: true,
  transitionstart: true,
  unload: true,
  visibilitychange: true,
  volumechange: true,
  waiting: true,
  watchPosition: true,
  wheel: true,
};

let trackedEvents = [];

function loadTrackedEvents() {
  browser.storage.local.get("trackedEvents", (data) => {
    trackedEvents = data.trackedEvents || [];
    updateEventListeners();
  });
}

function createBaseEventData(event) {
  return {
    sessionId: null,
    type: "user-interaction",
    event: event.type,
    target: {
      tagName: event.target.tagName,
      id: event.target.id,
      className: event.target.className,
      name: event.target.name,
    },
    timestamp: new Date().toISOString(),
    additionalData: getEventProps(event),
  };
}

function getEventProps(event) {
  const eventPropsMap = {
    mousemove: mouseEventProps,
    click: mouseEventProps,
    dblclick: mouseEventProps,
    mousedown: mouseEventProps,
    mouseup: mouseEventProps,
    mouseenter: mouseEventProps,
    mouseleave: mouseEventProps,
    mouseover: mouseEventProps,
    mouseout: mouseEventProps,
    drag: mouseEventProps,
    dragend: mouseEventProps,
    dragenter: mouseEventProps,
    dragexit: mouseEventProps,
    dragleave: mouseEventProps,
    dragover: mouseEventProps,
    dragstart: mouseEventProps,
    drop: mouseEventProps,
    wheel: mouseEventProps,
    keydown: keyEventProps,
    keypress: keyEventProps,
    keyup: keyEventProps,
    touchstart: touchEventProps,
    touchend: touchEventProps,
    touchmove: touchEventProps,
    touchcancel: touchEventProps,
    focus: focusEventProps,
    blur: focusEventProps,
    focusin: focusEventProps,
    focusout: focusEventProps,
    input: inputChangeEventProps,
    change: inputChangeEventProps,
    submit: submitEventProps,
    scroll: scrollEventProps,
    resize: resizeEventProps,
    hashchange: hashPopStateEventProps,
    popstate: hashPopStateEventProps,
    pagehide: pageShowHideEventProps,
    pageshow: pageShowHideEventProps,
    visibilitychange: visibilityChangeEventProps,
    copy: clipboardEventProps,
    cut: clipboardEventProps,
    paste: clipboardEventProps,
    beforeunload: beforeUnloadEventProps,
    play: mediaEventProps,
    pause: mediaEventProps,
    volumechange: mediaEventProps,
    timeupdate: mediaEventProps,
    durationchange: mediaEventProps,
    seeking: mediaEventProps,
    seeked: mediaEventProps,
    stalled: mediaEventProps,
    suspend: mediaEventProps,
    waiting: mediaEventProps,
    progress: mediaEventProps,
    ratechange: mediaEventProps,
    playing: mediaEventProps,
    ended: mediaEventProps,
    animationstart: animationTransitionEventProps,
    animationiteration: animationTransitionEventProps,
    animationend: animationTransitionEventProps,
    transitionstart: animationTransitionEventProps,
    transitionrun: animationTransitionEventProps,
    transitionend: animationTransitionEventProps,
    transitioncancel: animationTransitionEventProps,
    merchantvalidation: paymentEventProps,
    paymentmethodchange: paymentEventProps,
    speechstart: speechRecognitionEventProps,
    speechend: speechRecognitionEventProps,
    speecherror: speechRecognitionEventProps,
    result: speechRecognitionEventProps,
    nomatch: speechRecognitionEventProps,
    audiostart: speechRecognitionEventProps,
    audioend: speechRecognitionEventProps,
    audioprocess: speechRecognitionEventProps,
    soundstart: speechRecognitionEventProps,
    soundend: speechRecognitionEventProps,
    soundprocess: speechRecognitionEventProps,
    mark: speechRecognitionEventProps,
    boundary: speechRecognitionEventProps,
    slotchange: slotchangeEventProps,
    readystatechange: readystatechangeEventProps,
    start: speechRecognitionEventProps,
    end: speechRecognitionEventProps,
    DeviceMotionEvent: deviceMotionEventProps,
    DeviceOrientationEvent: deviceOrientationEventProps,
    controllerchange: defaultEventProps,
    statechange: defaultEventProps,
    toggle: defaultEventProps,
    addtrack: defaultEventProps,
    removetrack: defaultEventProps,
    complete: defaultEventProps,
    abort: defaultEventProps,
    error: defaultEventProps,
    push: defaultEventProps,
    sync: defaultEventProps,
  };

  return (eventPropsMap[event.type] || defaultEventProps)(event);
}

const defaultEventProps = (event) => ({});

const slotchangeEventProps = (event) => ({
  assignedNodes: event.target.assignedNodes(),
});
const readystatechangeEventProps = (event) => ({
  readyState: document.readyState,
});

const mouseEventProps = (event) => ({
  clientX: event.clientX,
  clientY: event.clientY,
  screenX: event.screenX,
  screenY: event.screenY,
  movementX: event.movementX,
  movementY: event.movementY,
  button: event.button,
  buttons: event.buttons,
  ctrlKey: event.ctrlKey,
  shiftKey: event.shiftKey,
  altKey: event.altKey,
  metaKey: event.metaKey,
  timeStamp: event.timeStamp,
});

const keyEventProps = (event) => ({
  key: event.key,
  code: event.code,
  keyCode: event.keyCode,
  charCode: event.charCode,
  which: event.which,
  location: event.location,
  ctrlKey: event.ctrlKey,
  shiftKey: event.shiftKey,
  altKey: event.altKey,
  metaKey: event.metaKey,
  repeat: event.repeat,
});

const touchEventProps = (event) => ({
  touches: Array.from(event.touches).map((t) => ({
    clientX: t.clientX,
    clientY: t.clientY,
    force: t.force,
    identifier: t.identifier,
    radiusX: t.radiusX,
    radiusY: t.radiusY,
    rotationAngle: t.rotationAngle,
  })),
  targetTouches: Array.from(event.targetTouches).map((t) => ({
    clientX: t.clientX,
    clientY: t.clientY,
    force: t.force,
    identifier: t.identifier,
    radiusX: t.radiusX,
    radiusY: t.radiusY,
    rotationAngle: t.rotationAngle,
  })),
  changedTouches: Array.from(event.changedTouches).map((t) => ({
    clientX: t.clientX,
    clientY: t.clientY,
    force: t.force,
    identifier: t.identifier,
    radiusX: t.radiusX,
    radiusY: t.radiusY,
    rotationAngle: t.rotationAngle,
  })),
});

const focusEventProps = (event) => ({
  relatedTarget: event.relatedTarget ? event.relatedTarget.tagName : null,
  detail: event.detail,
});

const inputChangeEventProps = (event) => ({
  value: event.target.value,
  inputType: event.inputType,
  isComposing: event.isComposing,
});

const submitEventProps = (event) => ({
  formData: new FormData(event.target),
  elements: Array.from(event.target.elements || []).map((el) => ({
    name: el.name,
    type: el.type,
    value: el.value,
  })),
});

const scrollEventProps = (event) => ({
  scrollX: window.scrollX,
  scrollY: window.scrollY,
});

const resizeEventProps = (event) => ({
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  outerWidth: window.outerWidth,
  outerHeight: window.outerHeight,
  devicePixelRatio: window.devicePixelRatio,
});

const hashPopStateEventProps = (event) => ({
  oldURL: event.oldURL,
  newURL: event.newURL,
  state: event.state,
});

const pageShowHideEventProps = (event) => ({
  persisted: event.persisted,
});

const visibilityChangeEventProps = (event) => ({
  visibilityState: document.visibilityState,
  hidden: document.hidden,
});

const clipboardEventProps = (event) => ({
  clipboardData: event.clipboardData
    ? event.clipboardData.getData("text")
    : null,
  types: event.clipboardData ? event.clipboardData.types : [],
});

const beforeUnloadEventProps = (event) => ({
  returnValue: event.returnValue,
});

const mediaEventProps = (event) => ({
  currentTime: event.target.currentTime,
  duration: event.target.duration,
  paused: event.target.paused,
  volume: event.target.volume,
  muted: event.target.muted,
  playbackRate: event.target.playbackRate,
  defaultMuted: event.target.defaultMuted,
});

const animationTransitionEventProps = (event) => ({
  animationName: event.animationName,
  elapsedTime: event.elapsedTime,
  pseudoElement: event.pseudoElement,
});

const deviceMotionEventProps = (event) => ({
  acceleration: event.acceleration,
  accelerationIncludingGravity: event.accelerationIncludingGravity,
  rotationRate: event.rotationRate,
  interval: event.interval,
});

const deviceOrientationEventProps = (event) => ({
  alpha: event.alpha,
  beta: event.beta,
  gamma: event.gamma,
  absolute: event.absolute,
});

const paymentEventProps = (event) => ({
  methodName: event.methodName,
  details: event.details,
  total: event.total,
  shippingAddress: event.shippingAddress,
});

const speechRecognitionEventProps = (event) => ({
  results: event.results,
  confidence: event.confidence,
  grammar: event.grammar,
});

function eventHandler(event) {
  if (!trackedEvents.includes(event.type)) {
    return;
  }

  const eventData = createBaseEventData(event);
  browser.runtime.sendMessage(eventData);
}

function updateEventListeners() {
  Object.keys(eventConfigurations).forEach((eventType) => {
    window.removeEventListener(eventType, eventHandler, true);
  });

  trackedEvents.forEach((eventType) => {
    if (eventConfigurations[eventType]) {
      window.addEventListener(eventType, eventHandler, true);
    }
  });
}

loadTrackedEvents();
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.trackedEvents) {
    trackedEvents = changes.trackedEvents.newValue || [];
    updateEventListeners();
  }
});

const mediaQueryList = window.matchMedia("(max-width: 600px)");
mediaQueryList.addEventListener("change", eventHandler);

function sendAjaxRequestEvent(method, url, status, response) {
  const stack = new Error().stack.split("\n").slice(1).join("\n");
  const eventData = {
    type: "ajax-request",
    method,
    url,
    status,
    response,
    timestamp: new Date().toISOString(),
    stack,
    initiator: document.currentScript ? document.currentScript.src : "unknown",
  };
  browser.runtime.sendMessage(eventData);
}

(function (open) {
  XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
    this.addEventListener(
      "readystatechange",
      function () {
        if (this.readyState === 4) {
          sendAjaxRequestEvent(method, url, this.status, this.responseText);
        }
      },
      false,
    );
    open.call(this, method, url, async, user, pass);
  };
})(XMLHttpRequest.prototype.open);

function sendFetchRequestEvent(response) {
  const stack = new Error().stack.split("\n").slice(1).join("\n");
  return response
    .clone()
    .text()
    .then((body) => {
      const eventData = {
        type: "fetch-request",
        url: response.url,
        status: response.status,
        response: body,
        timestamp: new Date().toISOString(),
        stack,
        initiator: document.currentScript
          ? document.currentScript.src
          : "unknown",
        requestHeaders: response.headers,
      };
      browser.runtime.sendMessage(eventData);
    });
}

(function (fetch) {
  window.fetch = function () {
    return fetch.apply(this, arguments).then((response) => {
      sendFetchRequestEvent(response);
      return response;
    });
  };
})(window.fetch);

document.addEventListener("visibilitychange", () => {
  const eventData = {
    type: "visibilitychange",
    visibilityState: document.visibilityState,
    hidden: document.hidden,
    timestamp: new Date().toISOString(),
  };
  browser.runtime.sendMessage(eventData);
});

const batteryStatusEventProps = (battery) => ({
  charging: battery.charging,
  chargingTime: battery.chargingTime,
  dischargingTime: battery.dischargingTime,
  level: battery.level,
});

navigator.getBattery().then((battery) => {
  const  updateBatteryStatus = () => {
    const eventData = {
      type: "battery-status",
      ...batteryStatusEventProps(battery),
      timestamp: new Date().toISOString(),
    };
    browser.runtime.sendMessage(eventData);
  }

  battery.addEventListener("chargingchange", updateBatteryStatus);
  battery.addEventListener("levelchange", updateBatteryStatus);
  battery.addEventListener("chargingtimechange", updateBatteryStatus);
  battery.addEventListener("dischargingtimechange", updateBatteryStatus);

  updateBatteryStatus();
});

const geolocationEventProps = (position) => ({
  coords: {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    altitude: position.coords.altitude,
    accuracy: position.coords.accuracy,
    altitudeAccuracy: position.coords.altitudeAccuracy,
    heading: position.coords.heading,
    speed: position.coords.speed,
  },
  timestamp: new Date(position.timestamp).toISOString(),
});

const geolocationErrorEventProps = (error) => ({
  code: error.code,
  message: error.message,
});

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const eventData = {
        type: "geolocation",
        ...geolocationEventProps(position),
        timestamp: new Date(position.timestamp).toISOString(),
      };
      browser.runtime.sendMessage(eventData);
    },
    (error) => {
      const eventData = {
        type: "geolocation-error",
        ...geolocationErrorEventProps(error),
        timestamp: new Date().toISOString(),
      };
      browser.runtime.sendMessage(eventData);
    },
  );
}

const networkStatusEventProps = () => ({
  downlink: navigator.connection.downlink,
  effectiveType: navigator.connection.effectiveType,
  rtt: navigator.connection.rtt,
  saveData: navigator.connection.saveData,
  type: navigator.connection.type,
});

if (navigator.connection) {
  const updateNetworkStatus = () => {
    const eventData = {
      type: "network-status",
      ...networkStatusEventProps(),
      timestamp: new Date().toISOString(),
    };
    browser.runtime.sendMessage(eventData);
  }

  navigator.connection.addEventListener("change", updateNetworkStatus);
  updateNetworkStatus();
}

// Speech Recognition and Synthesis Events
if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();

  [
    "start",
    "end",
    "result",
    "error",
    "nomatch",
    "soundstart",
    "soundend",
    "speechstart",
    "speechend",
    "audiostart",
    "audioend",
    "audioprocess",
    "soundprocess",
    "mark",
    "boundary",
  ].forEach((event) => recognition.addEventListener(event, eventHandler));
}

// Service Worker Events
if (navigator.serviceWorker) {
  ["controllerchange", "message", "statechange"].forEach((event) => {
    navigator.serviceWorker.addEventListener(event, eventHandler);
  });
}

// IndexedDB Events
if (window.indexedDB) {
  const request = indexedDB.open("test");

  ["success", "error", "upgradeneeded", "blocked"].forEach((event) => {
    request.addEventListener(event, eventHandler);
  });

  request.onsuccess = (event) => {
    const db = event.target.result;
    ["abort", "error"].forEach((event) =>
      db.addEventListener(event, eventHandler),
    );
  };
}

// Browser Storage Events
window.addEventListener("storage", eventHandler);

