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
  chargingchange: !!navigator.getBattery,
  chargingtimechange: !!navigator.getBattery,
  click: true,
  close: true,
  complete: true,
  compositionend: true,
  compositionstart: true,
  compositionupdate: true,
  contextmenu: true,
  controllerchange: !!navigator.serviceWorker,
  copy: true,
  cut: true,
  dblclick: true,
  devicemotion: !!window.DeviceMotionEvent,
  deviceorientation: !!window.DeviceOrientationEvent,
  deviceorientationabsolute: !!window.DeviceOrientationEvent,
  dischargingtimechange: !!navigator.getBattery,
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
  gamepadconnected: !!window.Gamepad,
  gamepaddisconnected: !!window.Gamepad,
  getCurrentPosition: !!navigator.geolocation,
  hashchange: true,
  input: true,
  invalid: true,
  keydown: true,
  keypress: true,
  keyup: true,
  levelchange: !!navigator.getBattery,
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
  push: !!navigator.serviceWorker,
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
  statechange: !!navigator.serviceWorker,
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
  watchPosition: !!navigator.geolocation,
  wheel: true,
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("optionsForm");
  const wsServerInput = document.getElementById("wsServer");
  const logLevelInput = document.getElementById("logLevel");
  const eventCheckboxes = document.getElementById("eventCheckboxes");
  const resetDefaultsBtn = document.getElementById("resetDefaults");

  const allEvents = [
    "DeviceMotionEvent",
    "DeviceOrientationEvent",
    "abort",
    "addtrack",
    "animationcancel",
    "animationend",
    "animationiteration",
    "animationstart",
    "audioend",
    "audioprocess",
    "audiostart",
    "beforeinput",
    "beforeunload",
    "blur",
    "boundary",
    "canplay",
    "canplaythrough",
    "change",
    "chargingchange",
    "chargingtimechange",
    "click",
    "close",
    "complete",
    "compositionend",
    "compositionstart",
    "compositionupdate",
    "contextmenu",
    "controllerchange",
    "copy",
    "cut",
    "dblclick",
    "devicemotion",
    "deviceorientation",
    "deviceorientationabsolute",
    "dischargingtimechange",
    "drag",
    "dragend",
    "dragenter",
    "dragexit",
    "dragleave",
    "dragover",
    "dragstart",
    "drop",
    "durationchange",
    "end",
    "ended",
    "error",
    "focus",
    "focusin",
    "focusout",
    "formdata",
    "fullscreenchange",
    "fullscreenerror",
    "gamepadconnected",
    "gamepaddisconnected",
    "getCurrentPosition",
    "hashchange",
    "input",
    "invalid",
    "keydown",
    "keypress",
    "keyup",
    "levelchange",
    "load",
    "loadeddata",
    "loadedmetadata",
    "loadstart",
    "mark",
    "merchantvalidation",
    "message",
    "mousedown",
    "mouseenter",
    "mouseleave",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "nomatch",
    "open",
    "pagehide",
    "pageshow",
    "paste",
    "pause",
    "paymentmethodchange",
    "play",
    "playing",
    "popstate",
    "progress",
    "push",
    "ratechange",
    "readystatechange",
    "removetrack",
    "reset",
    "resize",
    "result",
    "scroll",
    "securitypolicyviolation",
    "seeked",
    "seeking",
    "select",
    "slotchange",
    "soundend",
    "soundprocess",
    "soundstart",
    "speechend",
    "speecherror",
    "speechstart",
    "stalled",
    "start",
    "statechange",
    "storage",
    "submit",
    "suspend",
    "sync",
    "timeupdate",
    "toggle",
    "touchcancel",
    "touchend",
    "touchmove",
    "touchstart",
    "transitioncancel",
    "transitionend",
    "transitionrun",
    "transitionstart",
    "unload",
    "visibilitychange",
    "volumechange",
    "waiting",
    "watchPosition",
    "wheel",
  ];

  const defaultEvents = [...allEvents];

  function loadOptions() {
    browser.storage.local.get(
      ["wsServer", "logLevel", "trackedEvents"],
      (data) => {
        wsServerInput.value = data.wsServer || "ws://localhost:8080";
        logLevelInput.value = data.logLevel || "info";
        const trackedEvents = data.trackedEvents || defaultEvents;
        eventCheckboxes.innerHTML = "";
        allEvents.forEach((event) => {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.id = event;
          checkbox.name = event;
          checkbox.checked = trackedEvents.includes(event);
          if (!eventConfigurations[event]) {
            checkbox.disabled = true;
            const label = document.createElement("label");
            label.htmlFor = event;
            label.textContent = event;
            label.style.color = "gray";
            eventCheckboxes.appendChild(checkbox);
            eventCheckboxes.appendChild(label);
            eventCheckboxes.appendChild(document.createElement("br"));
          } else {
            const label = document.createElement("label");
            label.htmlFor = event;
            label.textContent = event;
            eventCheckboxes.appendChild(checkbox);
            eventCheckboxes.appendChild(label);
            eventCheckboxes.appendChild(document.createElement("br"));
          }
        });
      },
    );
  }

  function saveOptions(event) {
    event.preventDefault();
    const wsServer = wsServerInput.value;
    const logLevel = logLevelInput.value;
    const trackedEvents = Array.from(
      eventCheckboxes.querySelectorAll("input:checked"),
    ).map((input) => input.name);
    browser.storage.local.set({ wsServer, logLevel, trackedEvents }, () => {
      browser.runtime.sendMessage({ type: "options-changed" });
      alert("Options saved.");
    });
  }

  function resetDefaults() {
    browser.storage.local.set(
      {
        wsServer: "ws://localhost:8080",
        logLevel: "info",
        trackedEvents: defaultEvents,
      },
      loadOptions,
    );
  }

  form.addEventListener("submit", saveOptions);
  resetDefaultsBtn.addEventListener("click", resetDefaults);

  loadOptions();
});
