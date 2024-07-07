let trackedEvents = [];

const eventHandler = async (event) => {
  window.log(`Event triggered: ${event.type}`, window.config, "debug");
  if (!trackedEvents.includes(event.type)) {
    return;
  }

  const state = await window.fetchState();
  const eventData = createBaseEventData(event, state);

  if (["mousemove", "drag"].includes(event.type)) {
    window.bufferEvent(eventData);
  } else {
    window.log(`Sending event data: ${JSON.stringify(eventData)}`, window.config, "debug");
    browser.runtime.sendMessage(eventData);
  }
};

const debouncedEventHandler = window.debounce(eventHandler, 100);

const updateEventListeners = () => {
  window.log("Updating event listeners", window.config, "info");
  Object.keys(window.eventConfigurations).forEach((eventType) => {
    window.removeEventListener(eventType, eventHandler, true);
  });

  trackedEvents.forEach((eventType) => {
    if (window.eventConfigurations[eventType]) {
      window.log(`Adding event listener for: ${eventType}`, window.config, "debug");
      const handler = ["mousemove", "drag"].includes(eventType) ? debouncedEventHandler : eventHandler;
      window.addEventListener(eventType, handler, true);
    }
  });
};

const loadTrackedEvents = () => {
  window.log("Loading tracked events", window.config, "info");
  browser.storage.local.get("trackedEvents").then((data) => {
    trackedEvents = data.trackedEvents || [];
    window.updateEventListeners();
  });
};

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.trackedEvents) {
    window.log("Tracked events changed", window.config, "info");
    trackedEvents = changes.trackedEvents.newValue || [];
    window.updateEventListeners();
  }
});

window.eventHandler = eventHandler;
window.updateEventListeners = updateEventListeners;
window.loadTrackedEvents = loadTrackedEvents;
