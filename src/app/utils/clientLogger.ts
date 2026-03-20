import { Level } from "@/types";

/* Generic logging function to send logs to backend API */
async function log(level: Level, message: string, meta?: object) {
  try {
    /* Generic logging function to send logs to backend API */
    await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, message, meta }),
    });
  } catch {
    // silent fail — never break the UI over a logging call
  }
}

/* Send log data to server logging endpoint */
const clientLogger = {
  info: (message: string, meta?: object) => log("info", message, meta),
  warn: (message: string, meta?: object) => log("warn", message, meta),
  error: (message: string, meta?: object) => log("error", message, meta),
  debug: (message: string, meta?: object) => log("debug", message, meta),
};

export default clientLogger;
