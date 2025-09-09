import { PublicationModel } from './models/publications'
import mongoose from 'mongoose'
import logger from '../utils/logger'
import { createDbConnection, closeDbConnection } from './connection'

export const seedDb = async () => {
  try {
    await createDbConnection()
    await PublicationModel.insertMany([
      {
        publishedTime: new Date(),
        iid: new mongoose.Types.ObjectId('68c0ae885c129a352169d7ea'),
        type: 'publications',
        domain: 'birminghammail.co.uk',
        publisher: 'reach',
        targets: [
          {
            uuid: 'target1',
            feedType: 'google_sitemap',
            updateRate: 1800000,
            entrypoint: 'https://www.birminghammail.co.uk/map_news.xml',
            nextSubmissionTime: 1700000000000,
          },
        ],
      },
      {
        publishedTime: new Date(),
        iid: new mongoose.Types.ObjectId('68c0ae885c129a352169d7e9'),
        type: 'publications',
        domain: 'thesun.co.uk',
        publisher: 'newsuk',
        targets: [
          {
            uuid: 'target2',
            feedType: 'google_sitemap',
            updateRate: 1800000,
            entrypoint: 'https://www.thesun.co.uk/sitemap.xml',
            nextSubmissionTime: 1700000000000,
          },
        ],
      },
    ])
    await closeDbConnection()
  } catch (error) {
    logger.error('Error seeding the database:', error)
  }
}
