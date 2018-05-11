import * as winston from "winston";
import { APP_ERRORS_LOG_FILE, APP_LOG_FILE } from "./constants";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  level: "debug",
  transports: [
    new winston.transports.File({ filename: APP_ERRORS_LOG_FILE, level: "error" }),
    new winston.transports.File({ filename: APP_LOG_FILE }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
