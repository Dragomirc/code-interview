import fp from 'fastify-plugin'
import { FastifyInstance, FastifySchemaCompiler, FastifyTypeProvider } from 'fastify'
import { FastifySchemaValidationError, FastifySerializerCompiler } from 'fastify/types/schema'
import { z } from 'zod'
import Boom from '@hapi/boom'

declare module 'fastify' {
  interface FastifyTypeProviderDefault extends FastifyTypeProvider {
    output: this['input'] extends z.ZodTypeAny ? z.infer<this['input']> : never
  }
}

const validatorCompiler: FastifySchemaCompiler<z.AnyZodObject> = ({ schema, httpPart = '' }) => {
  return (data): any => {
    try {
      const result = schema.safeParse(data)
      if (!result.success) {
        const errors: Partial<FastifySchemaValidationError>[][] = result.error.errors.map(error => {
          if (error.code === 'unrecognized_keys') {
            return error.keys.map(unrecognisedKey => ({
              instancePath: unrecognisedKey,
              message: `Key "${unrecognisedKey}" is not recognised`,
            }))
          }

          return [
            {
              instancePath: error.path.length ? error.path.join('.') : httpPart,
              message: error.message,
            },
          ]
        })
        return { error: errors }
      }

      return { value: result.data }
    } catch (error) {
      return { error }
    }
  }
}

function serialiserCompiler(server: FastifyInstance): FastifySerializerCompiler<z.AnyZodObject> {
  return ({ schema, url }) => {
    return data => {
      const result = schema.safeParse(data)

      if (result.success) {
        return JSON.stringify(result.data)
      }

      server.log.error({ err: result.error, url }, 'response validation failed')
      throw Boom.internal('Response validation failed')
    }
  }
}

const validatorPlugin = fp(async fastify => {
  fastify.setValidatorCompiler(validatorCompiler)
  fastify.setSerializerCompiler(serialiserCompiler(fastify))
})

export default validatorPlugin
