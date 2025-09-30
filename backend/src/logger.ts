import { createLogger, format, transports } from "winston";

const isDev = process.env.NODE_ENV !== "production";

const logger = createLogger({
  level: isDev ? "debug" : "info",
  format: isDev
    ? format.combine(
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] ${level}: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
          }`;
        })
      )
    : format.combine(
        format.timestamp(),
        format.json() 
      ),
  transports: [new transports.Console()],
  exitOnError: false,
});

export default logger;
