import { FastifyPluginAsync, FastifySchema } from 'fastify'
import { z } from 'zod'
import { publicationService } from '../../../services/publications.service'
import { createDbConnection, closeDbConnection } from '../../../mongo/connection'

const schema = {
  tags: ['publications'],
  summary: 'Get Publication',
  description: 'Gets a publication',
  operationId: 'getPublication',
  params: z.unknown(),
  response: {
    200: z.unknown(),
  },
} satisfies FastifySchema

const getPublicationRoute: FastifyPluginAsync = async fastify => {
  fastify.route({
    method: 'GET',
    url: '/:id/publications',
    schema,
    handler: async req => {
      await createDbConnection()
      const var1 = await publicationService.getPublication(req.params.id)
      await closeDbConnection()
      return var1
    },
  })
}

export default getPublicationRoute
