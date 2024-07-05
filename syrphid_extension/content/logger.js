(function() {
    window.log = (message, level = "info") => {
        const levels = ["debug", "info", "warn", "error"];
        if (levels.indexOf(level) >= levels.indexOf(window.config.LOG_LEVEL)) {
            console.log(`[${level.toUpperCase()}] ${message}`);
        }
    };
})();
