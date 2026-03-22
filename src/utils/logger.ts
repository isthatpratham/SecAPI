/**
 * Winston logger setup and configuration
 */

import winston from 'winston';
import { config } from '../config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;

    // Fix: Type assertion for timestamp
    const ts = String(timestamp).slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
  })
);

const transports = [
  // Console transport
  new winston.transports.Console(),
  // Error log file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // All logs file
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// In development, log to console; in production, log to files
if (config.nodeEnv === 'development') {
  transports.push(new winston.transports.Console({ format }));
}

export const logger = winston.createLogger({
  level: config.logLevel,
  levels,
  format,
  transports,
});

export default logger;
