import config from './utils/config'
import { createServer } from './application/server'
import { seedDb } from './mongo/seed-db'

const server = createServer()
if (config.nodeEnv === 'development') {
  await seedDb()
}
await server.listen({ port: config.port }).catch(err => {
  server.log.error({ err })
  process.exit(1)
})
