import "server-only";
import winston from "winston";

/* Destructure commonly used format utilities from winston */
const { combine, timestamp, printf, colorize, errors } = winston.format;

/* Define custom log format */
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  /* Convert metadata object to string if present */
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";

  /* Return formatted log string with timestamp, level, message/stack, and meta */
  return `[${timestamp}] ${level}: ${stack || message}${metaStr}`;
});

/* Create the main logger instance */
const appLogger = winston.createLogger({
  /* Set log level from env or default to info */
  level: process.env.LOG_LEVEL || "info",

  /* Apply base formatting for all logs */
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }) /* Add timestamp */,
    errors({ stack: true }) /* Capture error stack traces */,
    logFormat /* Apply custom log format */
  ),

  /* Define transports (where logs are sent) */
  transports: [
    new winston.transports.Console({
      /* Console-specific formatting with colors */
      format: combine(
        colorize({ all: true }) /* Add colors to logs */,
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }) /* Add timestamp */,
        errors({ stack: true }) /* Capture stack traces */,
        logFormat /* Apply custom format */
      ),

      /* Disable logging in test environment */
      silent: process.env.NODE_ENV === "test",
    }),
  ],
});

/* Add file transports only in production environment */
if (process.env.NODE_ENV === "production") {
  appLogger.add(
    new winston.transports.File({
      filename: "logs/error.log" /* File for error-level logs */,
      level: "error",
      maxsize: 5_242_880 /* Max file size ~5MB */,
      maxFiles: 5 /* Keep last 5 log files */,
    })
  );

  appLogger.add(
    new winston.transports.File({
      filename: "logs/combined.log" /* File for all logs */,
      maxsize: 5_242_880 /* Max file size ~5MB */,
      maxFiles: 5 /* Keep last 5 log files */,
    })
  );
}

/* Export logger for use across the app */
export default appLogger;
