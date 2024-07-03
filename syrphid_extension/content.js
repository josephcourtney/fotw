const eventConfigurations = {
  DeviceMotionEvent: !!window.DeviceMotionEvent,
  DeviceOrientationEvent: !!window.DeviceOrientationEvent,
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
  click: true,
  close: true,
  complete: true,
  compositionend: true,
  compositionstart: true,
  compositionupdate: true,
  contextmenu: true,
  copy: true,
  cut: true,
  dblclick: true,
  devicemotion: !!window.DeviceMotionEvent,
  deviceorientation: !!window.DeviceOrientationEvent,
  deviceorientationabsolute: !!window.DeviceOrientationEvent,
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
  fullscreenchange: !!document.fullscreenEnabled,
  fullscreenerror: !!document.fullscreenEnabled,
  hashchange: true,
  input: true,
  invalid: true,
  keydown: true,
  keypress: true,
  keyup: true,
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
  nomatch: !!window.SpeechRecognition || !!window.webkitSpeechRecognition,
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
  ratechange: true,
  readystatechange: true,
  removetrack: true,
  reset: true,
  resize: true,
  result: !!window.SpeechRecognition || !!window.webkitSpeechRecognition,
  scroll: true,
  securitypolicyviolation: true,
  seeked: true,
  seeking: true,
  select: true,
  slotchange: true,
  soundend: true,
  soundprocess: !!window.SpeechRecognition || !!window.webkitSpeechRecognition,
  soundstart: !!window.SpeechRecognition || !!window.webkitSpeechRecognition,
  speechend: !!window.SpeechRecognition || !!window.webkitSpeechRecognition,
  speecherror: !!window.SpeechRecognition || !!window.webkitSpeechRecognition,
  speechstart: !!window.SpeechRecognition || !!window.webkitSpeechRecognition,
  stalled: true,
  start: !!window.SpeechRecognition || !!window.webkitSpeechRecognition,
  storage: true,
  submit: true,
  suspend: true,
  sync: !!navigator.serviceWorker,
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
  wheel: true,
};

let trackedEvents = [];

function loadTrackedEvents() {
  browser.storage.local.get("trackedEvents", (data) => {
    trackedEvents = data.trackedEvents || [];
    updateEventListeners();
  });
}

let environmentId, windowStateId, tabStateId;

function fetchState() {
  return Promise.all([
    new Promise((resolve) => {
      browser.runtime.sendMessage({ type: "query-environment" }, (response) => {
        environmentId = response.data.id;
        resolve();
      });
    }),
    new Promise((resolve) => {
      browser.runtime.sendMessage({ type: "query-window-state" }, (response) => {
        windowStateId = response.data.id;
        resolve();
      });
    }),
    new Promise((resolve) => {
      browser.runtime.sendMessage({ type: "query-tab-state" }, (response) => {
        tabStateId = response.data.id;
        resolve();
      });
    }),
  ]);
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
    references: {
      environmentId,
      windowStateId,
      tabStateId,
    },
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
  clipboardData: event.clipboardData ? event.clipboardData.getData("text") : null,
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

  fetchState().then(() => {
    const eventData = createBaseEventData(event);
    browser.runtime.sendMessage(eventData);
  });
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
      false
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
        initiator: document.currentScript ? document.currentScript.src : "unknown",
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

