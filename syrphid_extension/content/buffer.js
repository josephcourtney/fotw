(function() {
    const eventBuffer = {};
    const BUFFER_MAX_AGE_MS = 200;
    const BUFFER_MAX_SIZE = 100;

    window.bufferEvent = (eventData) => {
        const eventType = eventData.type;
        if (!eventBuffer[eventType]) {
            eventBuffer[eventType] = [];
        }
        eventBuffer[eventType].push(eventData);

        if (eventBuffer[eventType].length === 1) {
            setTimeout(() => flushEventBuffer(eventType), BUFFER_MAX_AGE_MS);
        }

        if (eventBuffer[eventType].length >= 50) {
            flushEventBuffer(eventType);
        }

        if (eventBuffer[eventType].length > BUFFER_MAX_SIZE) {
            eventBuffer[eventType].shift();
        }
    };

    const flushEventBuffer = (eventType) => {
        if (eventBuffer[eventType] && eventBuffer[eventType].length > 0) {
            const bufferedEvents = eventBuffer[eventType];
            delete eventBuffer[eventType];
            const aggregatedEvent = {
                type: `${eventType}-aggregated`,
                events: bufferedEvents,
                timestamp: new Date().toISOString(),
            };
            browser.runtime.sendMessage(aggregatedEvent);
        }
    };
})();
