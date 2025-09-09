import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import Boom from '@hapi/boom'
import type { BadRequestError, HttpErrorSchema } from '../helpers/http-errors'

function errorHandler(server: FastifyInstance) {
  return (error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
    if (error.code === 'FST_ERR_VALIDATION') {
      const errorResponse: BadRequestError = {
        statusCode: 400,
        error: 'Bad Request',
        message: `Validation failed for ${error.validationContext}`,
        errors: (error.validation || []).flat().reduce((acc, item) => {
          acc[item.instancePath] = item.message
          return acc
        }, {}),
      }

      return reply.code(400).type('application/json').send(errorResponse)
    }

    if (Boom.isBoom(error)) {
      const errorResponse: HttpErrorSchema = error.output.payload
      return reply
        .code(error.output.statusCode)
        .type('application/json')
        .headers(error.output.headers)
        .send(errorResponse)
    }

    const ref = Date.now().toString(32) // TODO: add a ref id
    server.log.error({ err: error, ref }, 'uncaught error')
    error.message = `An internal server error occurred (ref #${ref})`
    return reply.send(Boom.internal(error))
  }
}

export default errorHandler
