import { getConfig } from "./config.js";

const log = (message, level = "info") => {
  const { LOG_LEVEL } = getConfig();
  const levels = ["debug", "info", "warn", "error"];

  // Ensure level is a string and valid
  level = typeof level === "string" && levels.includes(level) ? level : "info";

  if (levels.indexOf(level) >= levels.indexOf(LOG_LEVEL)) {
    console.log(`[${level}] ${message}`);
  }
};

export { log };
