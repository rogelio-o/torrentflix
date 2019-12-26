import { format } from "logform";
import * as winston from "winston";

const dataFolder = process.env.DATA_FOLDER || "/tmp";

const options = {
  console: {
    colorize: true,
    handleExceptions: true,
    json: false,
    level: "debug",
  },
  file: {
    colorize: false,
    filename: `${dataFolder}/logs/app.log`,
    handleExceptions: true,
    json: true,
    level: "info",
    maxFiles: 5,
    maxsize: 5242880, // 5MB
  },
};

export const logger = winston.createLogger({
  exitOnError: false,
  format: format.combine(format.errors({ stack: true }), format.simple()),
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
});
