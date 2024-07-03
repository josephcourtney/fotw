document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('optionsForm');
  const wsServerInput = document.getElementById('wsServer');
  const eventCheckboxes = document.getElementById('eventCheckboxes');
  const resetDefaultsBtn = document.getElementById('resetDefaults');

  const defaultEvents = [
    "click", "mousemove", "keydown", "keyup", "scroll", "resize"
  ];

  const allEvents = [
    "abort", "animationend", "animationiteration", "animationstart", "beforeinput", "blur", "canplay", "canplaythrough", 
    "change", "click", "compositionend", "compositionstart", "compositionupdate", "contextmenu", "copy", "cut", 
    "dblclick", "drag", "dragend", "dragenter", "dragexit", "dragleave", "dragover", "dragstart", "drop", "durationchange", 
    "ended", "error", "focus", "focusin", "focusout", "formdata", "input", "invalid", "keydown", "keypress", "keyup", 
    "load", "loadeddata", "loadedmetadata", "loadstart", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", 
    "mouseover", "mouseup", "paste", "pause", "play", "playing", "progress", "ratechange", "reset", "resize", "scroll", 
    "securitypolicyviolation", "seeked", "seeking", "select", "stalled", "submit", "suspend", "timeupdate", "toggle", 
    "touchcancel", "touchend", "touchmove", "touchstart", "transitionend", "volumechange", "waiting", "wheel", "hashchange", 
    "popstate", "pagehide", "pageshow", "unload", "visibilitychange", "beforeunload", "storage", "close", "message", 
    "open", "animationcancel", "fullscreenchange", "fullscreenerror", "devicemotion", "deviceorientation", "deviceorientationabsolute",
    "gamepadconnected", "gamepaddisconnected", "chargingchange", "chargingtimechange", "dischargingtimechange", "levelchange", 
    "change", "addtrack", "removetrack", "getCurrentPosition", "watchPosition", "sync", "push"
  ];

  function loadOptions() {
    browser.storage.local.get(['wsServer', 'trackedEvents'], (data) => {
      wsServerInput.value = data.wsServer || 'ws://localhost:8080';
      const trackedEvents = data.trackedEvents || defaultEvents;
      eventCheckboxes.innerHTML = '';
      allEvents.forEach(event => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = event;
        checkbox.name = event;
        checkbox.checked = trackedEvents.includes(event);
        const label = document.createElement('label');
        label.htmlFor = event;
        label.textContent = event;
        eventCheckboxes.appendChild(checkbox);
        eventCheckboxes.appendChild(label);
        eventCheckboxes.appendChild(document.createElement('br'));
      });
    });
  }

  function saveOptions(event) {
    event.preventDefault();
    const wsServer = wsServerInput.value;
    const trackedEvents = Array.from(eventCheckboxes.querySelectorAll('input:checked')).map(input => input.name);
    browser.storage.local.set({ wsServer, trackedEvents }, () => {
      browser.runtime.sendMessage({ type: 'options-changed' });
      alert('Options saved.');
    });
  }

  function resetDefaults() {
    browser.storage.local.set({ trackedEvents: defaultEvents }, loadOptions);
  }

  form.addEventListener('submit', saveOptions);
  resetDefaultsBtn.addEventListener('click', resetDefaults);

  loadOptions();
});
