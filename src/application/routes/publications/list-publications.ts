import { FastifyPluginAsync, FastifySchema } from 'fastify'
import { z } from 'zod'
import { publicationService } from '../../../services/publications.service'
import { createDbConnection, closeDbConnection } from '../../../mongo/connection'

const schema = {
  tags: ['publications'],
  summary: 'List Publications',
  description: 'Returns a list of publications matching the given filters',
  operationId: 'listPublications',
  querystring: z.unknown(),
  response: {
    200: z.unknown(),
  },
} satisfies FastifySchema

const listPublicationsRoute: FastifyPluginAsync = async fastify => {
  fastify.route({
    method: 'GET',
    url: '/pubs',
    schema,
    handler: async req => {
      await createDbConnection()
      const var1 = await publicationService.listPublications(req.query)
      await closeDbConnection()

      return var1
    },
  })
}

export default listPublicationsRoute
