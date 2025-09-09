import { FastifyPluginAsync, FastifySchema } from 'fastify'
import { z } from 'zod'
import { publicationService } from '../../../services/publications.service'
import { createDbConnection, closeDbConnection } from '../../../mongo/connection'

const schema = {
  tags: ['publications'],
  summary: 'Create Publication',
  description: 'Creates a new publication',
  operationId: 'createPublication',
  body: z.unknown(),
  response: {
    200: z.unknown(),
  },
} satisfies FastifySchema

const createPublicationRoute: FastifyPluginAsync = async fastify => {
  fastify.route({
    method: 'POST',
    url: '/publications',
    schema,
    handler: async req => {
      await createDbConnection()
      const var1 = await publicationService.createPublication(req.body)
      await closeDbConnection()

      return var1
    },
  })
}

export default createPublicationRoute
