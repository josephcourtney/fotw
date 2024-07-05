(function() {
    window.config = {};

    window.fetchConfig = () => {
        return new Promise((resolve) => {
            browser.runtime.sendMessage({ type: "query-config" }, (response) => {
                if (response && response.config) {
                    window.config = response.config;
                    resolve();
                }
            });
        });
    };
})();
