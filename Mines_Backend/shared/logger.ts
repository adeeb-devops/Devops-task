import winston, { format, transports } from 'winston'
import LokiTransport from 'winston-loki'
import 'dotenv/config'

const commonOptions: winston.LoggerOptions = {
  level: 'info',
  format: winston.format.combine(
    winston.format.printf(({ level, message }) => {
      return `[${level.toUpperCase()}]: ${message}`
    }),
  ),
}

let config: winston.LoggerOptions = {
  transports: [new winston.transports.Console()],
}

const envLocation = process.env.NODE_ENV || ''
let lokiLevel = process.env.LOKI_LEVEL

if (lokiLevel == 'all') {
  lokiLevel = undefined
} else {
  lokiLevel = 'error'
}

if (['PROD', 'DEV'].includes(envLocation)) {
  config = {
    transports: [
      new LokiTransport({
        host: process.env.LOKI_HOST as string,
        labels: { app: process.env.LOKI_APP_NAME || `mines_${envLocation}` },
        json: true,
        format: format.json(),
        replaceTimestamp: true,
        // level: lokiLevel,
        onConnectionError: (err: any) => logger.error(err),
      }),
      new transports.Console({
        format: format.combine(format.simple(), format.colorize()),
      }),
    ],
  }
}

const logger = winston.createLogger({ ...commonOptions, ...config })
export { logger }
