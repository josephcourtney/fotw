

fetchConfig().then(() => {
  window.loadTrackedEvents();
});

const mediaQueryList = window.matchMedia("(max-width: 600px)");
mediaQueryList.addEventListener("change", window.eventHandler);

const sendAjaxRequestEvent = (method, url, status, response) => {
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
  window.log(`Sending AJAX request event: ${JSON.stringify(eventData)}`, window.config, "debug");
  browser.runtime.sendMessage(eventData);
};

(function (open) {
  XMLHttpRequest.prototype.open = function (method, url, async, user, pass) {
    this.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        sendAjaxRequestEvent(method, url, this.status, this.responseText);
      }
    }, false);
    open.call(this, method, url, async, user, pass);
  };
})(XMLHttpRequest.prototype.open);

const sendFetchRequestEvent = (response) => {
  const stack = new Error().stack.split("\n").slice(1).join("\n");
  return response.clone().text().then((body) => {
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
    window.log(`Sending fetch request event: ${JSON.stringify(eventData)}`, window.config, "debug");
    browser.runtime.sendMessage(eventData);
  });
};

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
  window.log(`Document visibility change event: ${JSON.stringify(eventData)}`, window.config, "debug");
  browser.runtime.sendMessage(eventData);
});
