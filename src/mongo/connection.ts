import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import logger from '../utils/logger'

const mongo = await MongoMemoryServer.create()
export const createDbConnection = async () => {
  const start = Date.now()

  try {
    const uri = mongo.getUri()
    await mongoose.connect(uri)
    logger.info(
      { event: 'mongodb-connection', value: Date.now() - start },
      'Established connection with the database'
    )
  } catch (error: any) {
    logger.error(
      { event: 'mongodb-connection', value: Date.now() - start },
      `Error message: ${error?.message}`
    )

    throw error
  }
}

export const closeDbConnection = async () => {
  await mongoose.disconnect()
}
