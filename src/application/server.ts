import fastify, { FastifyBaseLogger } from 'fastify'
import hyperid from 'hyperid'
import swaggerPlugin from './plugins/swagger'
import routes from './routes'
import validatorPlugin from './plugins/validator'
import logger from '../utils/logger'
import errorHandler from './plugins/error-handler'

export const createServer = () => {
  const server = fastify({
    logger: logger as FastifyBaseLogger,
    caseSensitive: false,
    requestIdHeader: 'trace-id',
    requestIdLogLabel: 'traceId',
    genReqId: hyperid(),
    disableRequestLogging: true,
    ignoreTrailingSlash: true,
    maxParamLength: 200,
  })

  server.setErrorHandler(errorHandler(server))

  server
    .register(validatorPlugin)
    .register(swaggerPlugin)
    .register(async instance => {
      for (const route of routes) {
        await instance.register(route)
      }
    })

  return server
}
