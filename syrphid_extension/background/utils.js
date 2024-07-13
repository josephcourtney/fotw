const toRad = (value) => (value * Math.PI) / 180;

const calculateDistance = (
  { latitude: lat1, longitude: lon1 },
  { latitude: lat2, longitude: lon2 },
) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon1 - lon2);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1000;
};

class EventEmitter {
  constructor(events = {}) {
    this.events = events;
  }

  on(event, listener) {
    this.events[event] ||= [];
    this.events[event].push(listener);
  }

  emit(event, data) {
    this.events[event]?.forEach((listener) => listener(data));
  }
}

const handleError = (error, label) => {
  const errorMessage = { context: label, message: error.message };
  console.error(`Error in ${label}:`, error);
  eventEmitter.emit("error", errorMessage);
  sendOverWebSocket("error", errorMessage);
};

export { EventEmitter, calculateDistance, handleError };
