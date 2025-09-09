import pino from 'pino'
import prettyPrint from 'pino-pretty'
import config from './config'

const prettyStream = prettyPrint({
  colorize: true,
  translateTime: 'HH:MM:ss Z',
  ignore: 'pid,hostname,environment,service',
})

interface CreateLoggerOptions {
  nodeEnv: string
  logLevel: string
  stage: string
  serviceName: string
}

export const validLogLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const

const createLogger = (options: CreateLoggerOptions) => {
  return pino(
    {
      enabled: options.nodeEnv !== 'test',
      level: options.logLevel,
      formatters: {
        level: label => ({ level: label }),
      },
      serializers: {
        err: pino.stdSerializers.err,
      },
    },
    prettyStream
  ).child({
    environment: options.stage,
    service: options.serviceName,
  })
}

const logger = createLogger({
  logLevel: config.logLevel,
  nodeEnv: config.nodeEnv,
  stage: config.stage,
  serviceName: config.serviceName,
})

export default logger
