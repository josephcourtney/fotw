const eventsToTrack = [
  "DeviceMotionEvent",
  "DeviceOrientationEvent",
  "abort",
  "addtrack",
  "animationcancel",
  "animationend",
  "animationiteration",
  "animationstart",
  "beforeinput",
  "beforeunload",
  "blur",
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
  "mousedown",
  "mouseenter",
  "mouseleave",
  "mousemove",
  "mouseout",
  "mouseover",
  "mouseup",
  "open",
  "pagehide",
  "pageshow",
  "paste",
  "pause",
  "play",
  "playing",
  "popstate",
  "progress",
  "push",
  "ratechange",
  "removetrack",
  "reset",
  "resize",
  "scroll",
  "securitypolicyviolation",
  "seeked",
  "seeking",
  "select",
  "stalled",
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
  // "message", // this ends up producing an endless cycle of events
  // File System Events (File API)
  // Note: These events are not directly accessible through event listeners
  // Web Audio API Events (Not directly accessible through event listeners)
  // Media Query Events
  "change", // MediaQueryList event
];

function trackEvent(event) {
  let eventData = {
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
    additionalData: {},
  };

  switch (event.type) {
    case "mousemove":
    case "click":
    case "dblclick":
    case "mousedown":
    case "mouseup":
    case "mouseenter":
    case "mouseleave":
    case "mouseover":
    case "mouseout":
    case "drag":
    case "dragend":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "dragstart":
    case "drop":
    case "wheel":
      eventData.additionalData = {
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button,
        buttons: event.buttons,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      };
      break;

    case "keydown":
    case "keypress":
    case "keyup":
      eventData.additionalData = {
        key: event.key,
        code: event.code,
        keyCode: event.keyCode,
        charCode: event.charCode,
        which: event.which,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
        repeat: event.repeat,
      };
      break;

    case "touchstart":
    case "touchend":
    case "touchmove":
    case "touchcancel":
      eventData.additionalData = {
        touches: Array.from(event.touches).map((t) => ({
          clientX: t.clientX,
          clientY: t.clientY,
          force: t.force,
          identifier: t.identifier,
          radiusX: t.radiusX,
          radiusY: t.radiusY,
          rotationAngle: t.rotationAngle,
        })),
      };
      break;

    case "focus":
    case "blur":
    case "focusin":
    case "focusout":
      eventData.additionalData = {
        relatedTarget: event.relatedTarget ? event.relatedTarget.tagName : null,
      };
      break;

    case "input":
    case "change":
      eventData.additionalData = {
        value: event.target.value,
      };
      break;

    case "submit":
      eventData.additionalData = {
        formData: new FormData(event.target),
      };
      break;

    case "scroll":
      eventData.additionalData = {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      };
      break;

    case "resize":
      eventData.additionalData = {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      };
      break;

    case "hashchange":
    case "popstate":
      eventData.additionalData = {
        oldURL: event.oldURL,
        newURL: event.newURL,
      };
      break;

    case "pagehide":
    case "pageshow":
      eventData.additionalData = {
        persisted: event.persisted,
      };
      break;

    case "visibilitychange":
      eventData.additionalData = {
        visibilityState: document.visibilityState,
      };
      break;

    case "copy":
    case "cut":
    case "paste":
      eventData.additionalData = {
        clipboardData: event.clipboardData
          ? event.clipboardData.getData("text")
          : null,
      };
      break;

    case "beforeunload":
      eventData.additionalData = {
        returnValue: event.returnValue,
      };
      break;

    case "play":
    case "pause":
    case "volumechange":
    case "timeupdate":
    case "durationchange":
    case "seeking":
    case "seeked":
    case "stalled":
    case "suspend":
    case "waiting":
    case "progress":
    case "ratechange":
    case "playing":
    case "ended":
      eventData.additionalData = {
        currentTime: event.target.currentTime,
        duration: event.target.duration,
        paused: event.target.paused,
        volume: event.target.volume,
        muted: event.target.muted,
      };
      break;
    case "addtrack":
    case "removetrack":
      eventData.additionalData = {
        // Specific data to capture
      };
      break;
    case "DeviceMotionEvent":
      eventData.additionalData = {
        acceleration: event.acceleration,
        accelerationIncludingGravity: event.accelerationIncludingGravity,
        rotationRate: event.rotationRate,
        interval: event.interval,
      };
      break;
    case "DeviceOrientationEvent":
      eventData.additionalData = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
      };
      break;
    case "complete":
    case "abort":
    case "error":
      eventData.additionalData = {
        // IndexedDB event data
      };
      break;
    case "push":
      eventData.additionalData = {
        // Push event data
      };
      break;
    case "sync":
      eventData.additionalData = {
        // Sync event data
      };
      break;
    // Add cases for CSS Animation and Transition Events
    case "animationstart":
    case "animationiteration":
    case "animationend":
    case "transitionstart":
    case "transitionrun":
    case "transitionend":
    case "transitioncancel":
      eventData.additionalData = {
        animationName: event.animationName,
        elapsedTime: event.elapsedTime,
      };
      break;
    case "change":
      // Handle MediaQueryList events
      if (event.target && event.target.media) {
        eventData.additionalData = {
          media: event.target.media,
          matches: event.target.matches,
        };
      } else {
        eventData.additionalData = {
          value: event.target.value,
        };
      }
      break;
    // Add other cases as needed...
  }

  browser.runtime.sendMessage(eventData);
}

// Add listeners for all events
eventsToTrack.forEach((eventType) => {
  window.addEventListener(eventType, trackEvent, true);
});

// Media Query event listener setup
const mediaQueryList = window.matchMedia("(max-width: 600px)");
mediaQueryList.addEventListener("change", trackEvent);

// Track AJAX requests
(function (open) {
  XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
    this.addEventListener(
      "readystatechange",
      function () {
        if (this.readyState === 4) {
          let stack = new Error().stack.split("\n").slice(1).join("\n");
          let eventData = {
            type: "ajax-request",
            method: method,
            url: url,
            status: this.status,
            response: this.responseText,
            timestamp: new Date().toISOString(),
            stack: stack,
            initiator: document.currentScript
              ? document.currentScript.src
              : "unknown",
          };
          browser.runtime.sendMessage(eventData);
        }
      },
      false,
    );
    open.call(this, method, url, async, user, pass);
  };
})(XMLHttpRequest.prototype.open);

// Track Fetch API requests
(function (fetch) {
  window.fetch = function () {
    let stack = new Error().stack.split("\n").slice(1).join("\n");
    return fetch.apply(this, arguments).then((response) => {
      response
        .clone()
        .text()
        .then((body) => {
          let eventData = {
            type: "fetch-request",
            url: response.url,
            status: response.status,
            response: body,
            timestamp: new Date().toISOString(),
            stack: stack,
            initiator: document.currentScript
              ? document.currentScript.src
              : "unknown",
          };
          browser.runtime.sendMessage(eventData);
        });
      return response;
    });
  };
})(window.fetch);

// Track visibility changes
document.addEventListener("visibilitychange", () => {
  let eventData = {
    type: "visibilitychange",
    visibilityState: document.visibilityState,
    timestamp: new Date().toISOString(),
  };
  browser.runtime.sendMessage(eventData);
});

// Track battery status
navigator.getBattery().then((battery) => {
  function updateBatteryInfo() {
    let eventData = {
      type: "battery-status",
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
      level: battery.level,
      timestamp: new Date().toISOString(),
    };
    browser.runtime.sendMessage(eventData);
  }

  battery.addEventListener("chargingchange", updateBatteryInfo);
  battery.addEventListener("levelchange", updateBatteryInfo);
  battery.addEventListener("chargingtimechange", updateBatteryInfo);
  battery.addEventListener("dischargingtimechange", updateBatteryInfo);

  updateBatteryInfo();
});

// Track geolocation (with user consent)
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      let eventData = {
        type: "geolocation",
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
      };
      browser.runtime.sendMessage(eventData);
    },
    (error) => {
      let eventData = {
        type: "geolocation-error",
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
      };
      browser.runtime.sendMessage(eventData);
    },
  );
}

// Track network information
if (navigator.connection) {
  function updateNetworkInfo() {
    let eventData = {
      type: "network-status",
      downlink: navigator.connection.downlink,
      effectiveType: navigator.connection.effectiveType,
      rtt: navigator.connection.rtt,
      saveData: navigator.connection.saveData,
      timestamp: new Date().toISOString(),
    };
    browser.runtime.sendMessage(eventData);
  }

  navigator.connection.addEventListener("change", updateNetworkInfo);
  updateNetworkInfo();
}
