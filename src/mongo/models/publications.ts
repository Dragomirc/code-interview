import mongoose from 'mongoose'
export const PUBLICATION_CONSUMER_TYPES = ['iya', 'mantis'] as const

export interface PublicationConsumer {
  name: (typeof PUBLICATION_CONSUMER_TYPES)[number]
}

export const PUBLICATION_TARGET_FEED_TYPES = ['rss', 'google_sitemap', 'smart'] as const

export interface PublicationTarget {
  feedType: (typeof PUBLICATION_TARGET_FEED_TYPES)[number]
  entrypoint: string
  updateRate: number
  nextSubmissionTime: number
}

export interface MongoPublication {
  type: 'publications'
  publishedTime: Date
  iid: string
  domain: string
  publisher: string
  consumers: PublicationConsumer[]
  targets: PublicationTarget[]
}

const PublicationSchema = new mongoose.Schema<MongoPublication>(
  {
    type: {
      type: String,
      enum: ['publications'],
      required: true,
    },
    iid: { type: String, required: true },
    publishedTime: { type: Date, required: true },
    publisher: { type: String },
    domain: { type: String },
    targets: [
      {
        _id: false,
        feedType: {
          type: String,
          enum: PUBLICATION_TARGET_FEED_TYPES,
        },
        updateRate: { type: Number, required: true },
        entrypoint: { type: String, required: true },
        nextSubmissionTime: { type: Number, required: true },
      },
    ],
  },
  {
    collection: 'publications',
  }
)

const model = mongoose.model<MongoPublication>('Publication', PublicationSchema)

export const PublicationModel = (mongoose.models.Publication || model) as typeof model
