const eventCategories = {
  deviceEvents: [
    {
      name: "DeviceMotionEvent",
      description:
        "Tracks changes in device motion, triggered by device movement.",
    },
    {
      name: "DeviceOrientationEvent",
      description:
        "Tracks changes in device orientation, triggered by device rotation.",
    },
    {
      name: "devicemotion",
      description:
        "Tracks acceleration of the device, triggered by changes in motion.",
    },
    {
      name: "deviceorientation",
      description:
        "Tracks orientation of the device, triggered by orientation changes.",
    },
    {
      name: "deviceorientationabsolute",
      description:
        "Tracks absolute orientation of the device, triggered by changes in absolute orientation.",
    },
  ],
  keyboardEvents: [
    { name: "keydown", description: "Emitted when a key is pressed down." },
    {
      name: "keypress",
      description: "Emitted when a key is pressed and held down.",
    },
    { name: "keyup", description: "Emitted when a key is released." },
  ],
  mouseEvents: [
    { name: "click", description: "Emitted when a mouse button is clicked." },
    {
      name: "dblclick",
      description: "Emitted when a mouse button is double-clicked.",
    },
    {
      name: "mousedown",
      description: "Emitted when a mouse button is pressed down.",
    },
    {
      name: "mouseenter",
      description: "Emitted when the mouse pointer enters an element.",
    },
    {
      name: "mouseleave",
      description: "Emitted when the mouse pointer leaves an element.",
    },
    { name: "mousemove", description: "Emitted when the mouse is moved." },
    {
      name: "mouseout",
      description: "Emitted when the mouse pointer moves out of an element.",
    },
    {
      name: "mouseover",
      description: "Emitted when the mouse pointer moves over an element.",
    },
    {
      name: "mouseup",
      description: "Emitted when a mouse button is released.",
    },
    { name: "drag", description: "Emitted when an element is being dragged." },
    { name: "dragend", description: "Emitted when dragging an element ends." },
    {
      name: "dragenter",
      description: "Emitted when a dragged element enters a drop target.",
    },
    {
      name: "dragexit",
      description: "Emitted when a dragged element exits a drop target.",
    },
    {
      name: "dragleave",
      description: "Emitted when a dragged element leaves a drop target.",
    },
    {
      name: "dragover",
      description: "Emitted when an element is dragged over a drop target.",
    },
    {
      name: "dragstart",
      description: "Emitted when the dragging of an element starts.",
    },
    { name: "drop", description: "Emitted when a dragged element is dropped." },
    {
      name: "contextmenu",
      description:
        "Emitted when the right mouse button is clicked to open a context menu.",
    },
    { name: "wheel", description: "Emitted when the mouse wheel is scrolled." },
  ],
  touchEvents: [
    {
      name: "touchcancel",
      description: "Emitted when a touch event is interrupted.",
    },
    {
      name: "touchend",
      description:
        "Emitted when a touch point is removed from the touch surface.",
    },
    {
      name: "touchmove",
      description: "Emitted when a touch point moves along the touch surface.",
    },
    {
      name: "touchstart",
      description: "Emitted when a touch point is placed on the touch surface.",
    },
  ],
  windowEvents: [
    { name: "resize", description: "Emitted when the window is resized." },
    {
      name: "hashchange",
      description: "Emitted when the fragment identifier of the URL changes.",
    },
    {
      name: "popstate",
      description: "Emitted when the active history entry changes.",
    },
    {
      name: "pagehide",
      description: "Emitted when the user navigates away from the page.",
    },
    {
      name: "pageshow",
      description: "Emitted when the user navigates to the page.",
    },
    {
      name: "visibilitychange",
      description: "Emitted when the visibility state of the document changes.",
    },
    {
      name: "unload",
      description: "Emitted when the document or a resource is being unloaded.",
    },
    {
      name: "scroll",
      description: "Emitted when the document or an element is scrolled.",
    },
    {
      name: "beforeunload",
      description: "Emitted before the document is unloaded.",
    },
    {
      name: "fullscreenchange",
      description: "Emitted when an element enters or exits full-screen mode.",
    },
    {
      name: "fullscreenerror",
      description: "Emitted when an error occurs in full-screen mode.",
    },
    {
      name: "load",
      description:
        "Emitted when a resource and its dependent resources have finished loading.",
    },
  ],
  formEvents: [
    {
      name: "input",
      description: "Emitted when the value of an input element changes.",
    },
    {
      name: "change",
      description: "Emitted when the value of an element has changed.",
    },
    { name: "submit", description: "Emitted when a form is submitted." },
    { name: "focus", description: "Emitted when an element gains focus." },
    { name: "blur", description: "Emitted when an element loses focus." },
    {
      name: "focusin",
      description: "Emitted when focus is moved to an element.",
    },
    {
      name: "focusout",
      description: "Emitted when focus is moved out of an element.",
    },
    { name: "invalid", description: "Emitted when an element is invalid." },
    { name: "reset", description: "Emitted when a form is reset." },
    {
      name: "select",
      description: "Emitted when text within a text field is selected.",
    },
    {
      name: "abort",
      description: "Emitted when a form submission is aborted.",
    },
    {
      name: "beforeinput",
      description: "Emitted before the input value is modified.",
    },
    { name: "formdata", description: "Emitted when form data is being sent." },
    {
      name: "compositionend",
      description: "Emitted when text composition ends.",
    },
    {
      name: "compositionstart",
      description: "Emitted when text composition starts.",
    },
    {
      name: "compositionupdate",
      description: "Emitted when text composition is updated.",
    },
    {
      name: "complete",
      description: "Emitted upon completion of certain form-related tasks.",
    },
  ],
  mediaEvents: [
    { name: "play", description: "Emitted when media playback starts." },
    { name: "pause", description: "Emitted when media playback is paused." },
    { name: "volumechange", description: "Emitted when the volume changes." },
    {
      name: "timeupdate",
      description: "Emitted when the playback position changes.",
    },
    {
      name: "durationchange",
      description: "Emitted when the media duration changes.",
    },
    { name: "seeking", description: "Emitted when a seek operation begins." },
    { name: "seeked", description: "Emitted when a seek operation ends." },
    {
      name: "stalled",
      description:
        "Emitted when the user agent is trying to fetch media data but is unable to do so.",
    },
    {
      name: "suspend",
      description: "Emitted when the media data loading has been suspended.",
    },
    {
      name: "waiting",
      description: "Emitted when playback is delayed pending further data.",
    },
    {
      name: "progress",
      description:
        "Emitted periodically to indicate the progress of media data loading.",
    },
    {
      name: "ratechange",
      description: "Emitted when the playback rate changes.",
    },
    {
      name: "playing",
      description:
        "Emitted when media starts playing after being paused or buffered.",
    },
    {
      name: "ended",
      description: "Emitted when media playback reaches the end.",
    },
    {
      name: "addtrack",
      description: "Emitted when a new media track is added.",
    },
    {
      name: "removetrack",
      description: "Emitted when a media track is removed.",
    },
    { name: "audioend", description: "Emitted when an audio track ends." },
    { name: "audioprocess", description: "Emitted during audio processing." },
    { name: "audiostart", description: "Emitted when an audio track starts." },
    {
      name: "canplay",
      description:
        "Emitted when media can be played, but not necessarily to completion without buffering.",
    },
    {
      name: "canplaythrough",
      description:
        "Emitted when media can be played to completion without buffering.",
    },
    { name: "end", description: "Emitted at the end of a media resource." },
    {
      name: "loadeddata",
      description: "Emitted when the current frame of media has been loaded.",
    },
    {
      name: "loadedmetadata",
      description:
        "Emitted when metadata for the media resource has been loaded.",
    },
    {
      name: "loadstart",
      description: "Emitted when the browser starts looking for media data.",
    },
    {
      name: "mark",
      description: "Emitted to indicate specific points in the media timeline.",
    },
    { name: "soundend", description: "Emitted when a sound ends." },
    { name: "soundprocess", description: "Emitted during sound processing." },
    { name: "soundstart", description: "Emitted when a sound starts." },
    {
      name: "speechend",
      description: "Emitted when speech recognition input ends.",
    },
    {
      name: "speecherror",
      description: "Emitted when an error occurs during speech recognition.",
    },
    {
      name: "speechstart",
      description: "Emitted when speech recognition input starts.",
    },
    {
      name: "start",
      description:
        "Emitted to indicate the start of an action, often related to media or speech recognition.",
    },
    {
      name: "result",
      description:
        "Emitted when a recognition result is available, typically related to speech recognition.",
    },
    {
      name: "nomatch",
      description:
        "Emitted when no match is found for the input, typically related to speech recognition.",
    },
    {
      name: "boundary",
      description: "Emitted when a boundary is reached in speech synthesis.",
    },
  ],
  clipboardEvents: [
    {
      name: "copy",
      description: "Emitted when content is copied to the clipboard.",
    },
    {
      name: "cut",
      description: "Emitted when content is cut to the clipboard.",
    },
    {
      name: "paste",
      description: "Emitted when content is pasted from the clipboard.",
    },
  ],
  batteryEvents: [
    {
      name: "chargingchange",
      description: "Emitted when the battery charging state changes.",
    },
    {
      name: "chargingtimechange",
      description: "Emitted when the battery charging time changes.",
    },
    {
      name: "levelchange",
      description: "Emitted when the battery level changes.",
    },
    {
      name: "dischargingtimechange",
      description: "Emitted when the battery discharging time changes.",
    },
  ],
  controllerEvents: [
    {
      name: "controllerchange",
      description: "Emitted when the controller changes.",
    },
    {
      name: "gamepadconnected",
      description: "Emitted when a gamepad is connected.",
    },
    {
      name: "gamepaddisconnected",
      description: "Emitted when a gamepad is disconnected.",
    },
  ],
  geolocationEvents: [
    {
      name: "getCurrentPosition",
      description: "Emitted when the current position is requested.",
    },
    {
      name: "watchPosition",
      description: "Emitted when the position changes.",
    },
  ],
  networkEvents: [
    {
      name: "online",
      description: "Emitted when the network connection is established.",
    },
    {
      name: "offline",
      description: "Emitted when the network connection is lost.",
    },
    {
      name: "networkchange",
      description: "Emitted when the network status changes.",
    },
    {
      name: "close",
      description: "Emitted when a WebSocket connection is closed.",
    },
    { name: "error", description: "Emitted when a network error occurs." },
    { name: "message", description: "Emitted when a message is received." },
    {
      name: "open",
      description: "Emitted when a WebSocket connection is opened.",
    },
    { name: "push", description: "Emitted when a push message is received." },
    { name: "sync", description: "Emitted during synchronization." },
  ],
  cssEvents: [
    {
      name: "animationcancel",
      description: "Emitted when a CSS animation is canceled.",
    },
    { name: "animationend", description: "Emitted when a CSS animation ends." },
    {
      name: "animationiteration",
      description: "Emitted when a CSS animation iterates.",
    },
    {
      name: "animationstart",
      description: "Emitted when a CSS animation starts.",
    },
    {
      name: "transitioncancel",
      description: "Emitted when a CSS transition is canceled.",
    },
    {
      name: "transitionend",
      description: "Emitted when a CSS transition ends.",
    },
    {
      name: "transitionrun",
      description: "Emitted when a CSS transition starts running.",
    },
    {
      name: "transitionstart",
      description: "Emitted when a CSS transition starts.",
    },
  ],
  paymentEvents: [
    {
      name: "merchantvalidation",
      description: "Emitted during a payment request to validate a merchant.",
    },
    {
      name: "paymentmethodchange",
      description: "Emitted when the payment method changes.",
    },
  ],
  documentEvents: [
    {
      name: "readystatechange",
      description: "Emitted when the document's ready state changes.",
    },
    {
      name: "securitypolicyviolation",
      description: "Emitted when a content security policy is violated.",
    },
    {
      name: "slotchange",
      description: "Emitted when the contents of a slot change.",
    },
    {
      name: "statechange",
      description:
        "Emitted when there are state transitions, often related to service workers or other objects.",
    },
    { name: "storage", description: "Emitted when a storage area changes." },
    { name: "toggle", description: "Emitted when an element is toggled." },
  ],
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("optionsForm");
  const wsServerInput = document.getElementById("wsServer");
  const logLevelInput = document.getElementById("logLevel");
  const resetDefaultsBtn = document.getElementById("resetDefaults");
  const eventCheckboxesContainer = document.getElementById(
    "eventCheckboxesContainer",
  );

  const loadOptions = () => {
    browser.storage.local.get(
      ["wsServer", "logLevel", "trackedEvents"],
      (data) => {
        wsServerInput.value = data.wsServer || "ws://localhost:8080";
        logLevelInput.value = data.logLevel || "info";
        const trackedEvents = data.trackedEvents || [];
        updateEventCheckboxes(trackedEvents);
      },
    );
  };

  const saveOptions = (event) => {
    event.preventDefault();
    const wsServer = wsServerInput.value;
    const logLevel = logLevelInput.value;
    const trackedEvents = Array.from(
      eventCheckboxesContainer.querySelectorAll("input:checked"),
    ).map((input) => input.name);
    browser.storage.local.set({ wsServer, logLevel, trackedEvents }, () => {
      browser.runtime.sendMessage({ type: "options-changed" });
      alert("Options saved.");
    });
  };

  const resetDefaults = () => {
    browser.storage.local.set(
      {
        wsServer: "ws://localhost:8080",
        logLevel: "info",
        trackedEvents: [].concat(
          ...Object.values(eventCategories).map((category) =>
            category.map((event) => event.name),
          ),
        ),
      },
      loadOptions,
    );
  };

  const createCheckbox = (event, trackedEvents = []) => {
    if (!event || !trackedEvents) {
      console.error("Invalid event or trackedEvents:", event, trackedEvents);
      return;
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = event.name;
    checkbox.name = event.name;
    checkbox.checked = trackedEvents.includes(event.name);
    const label = document.createElement("label");
    label.htmlFor = event.name;
    label.innerHTML = `<b>${event.name}</b>: ${event.description}`;
    return { checkbox, label };
  };

  const updateEventCheckboxes = (trackedEvents) => {
    Object.keys(eventCategories).forEach((category) => {
      const categoryDiv = document.getElementById(category);
      categoryDiv.innerHTML = "";
      eventCategories[category].forEach((event) => {
        const { checkbox, label } = createCheckbox(event, trackedEvents);
        categoryDiv.appendChild(checkbox);
        categoryDiv.appendChild(label);
        categoryDiv.appendChild(document.createElement("br"));
      });
    });
  };

  form.addEventListener("submit", saveOptions);
  resetDefaultsBtn.addEventListener("click", resetDefaults);

  loadOptions();
});
