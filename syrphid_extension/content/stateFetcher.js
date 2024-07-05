let cachedState = null;

const fetchState = async () => {
  if (!cachedState) {
    const environment = await browser.runtime.sendMessage({ type: "query-environment" });
    const windowState = await browser.runtime.sendMessage({ type: "query-window-state" });
    const tabState = await browser.runtime.sendMessage({ type: "query-tab-state" });

    cachedState = { environment, windowState, tabState };
    setTimeout(() => { cachedState = null; }, 5000); // Invalidate cache after 5 seconds
  }

  return cachedState;
};

window.fetchState = fetchState;

