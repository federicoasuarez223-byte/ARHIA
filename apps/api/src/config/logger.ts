import winston from 'winston';

import { env } from './env';

const format =
  env.NODE_ENV === 'development'
    ? winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}: ${message}${metaStr}`;
        }),
      )
    : winston.format.combine(winston.format.timestamp(), winston.format.json());

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format,
  transports: [new winston.transports.Console()],
});
