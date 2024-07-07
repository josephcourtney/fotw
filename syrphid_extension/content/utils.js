const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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

const getEventProps = (event) => {
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
};

const createBaseEventData = (event, state) => {
  const eventProps = getEventProps(event);
  return {
    type: event.type,
    timestamp: new Date().toISOString(),
    ...eventProps,
    state,
  };
};

window.debounce = debounce;
window.getEventProps = getEventProps;
window.createBaseEventData = createBaseEventData;
window.defaultEventProps = defaultEventProps;
window.slotchangeEventProps = slotchangeEventProps;
window.readystatechangeEventProps = readystatechangeEventProps;
window.mouseEventProps = mouseEventProps;
window.keyEventProps = keyEventProps;
window.touchEventProps = touchEventProps;
window.focusEventProps = focusEventProps;
window.inputChangeEventProps = inputChangeEventProps;
window.submitEventProps = submitEventProps;
window.scrollEventProps = scrollEventProps;
window.resizeEventProps = resizeEventProps;
window.hashPopStateEventProps = hashPopStateEventProps;
window.pageShowHideEventProps = pageShowHideEventProps;
window.visibilityChangeEventProps = visibilityChangeEventProps;
window.clipboardEventProps = clipboardEventProps;
window.beforeUnloadEventProps = beforeUnloadEventProps;
window.mediaEventProps = mediaEventProps;
window.animationTransitionEventProps = animationTransitionEventProps;
window.deviceMotionEventProps = deviceMotionEventProps;
window.deviceOrientationEventProps = deviceOrientationEventProps;
window.paymentEventProps = paymentEventProps;
window.speechRecognitionEventProps = speechRecognitionEventProps;
