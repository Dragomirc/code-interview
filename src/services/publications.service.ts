import Boom from '@hapi/boom'
import * as mongoose from 'mongoose'
import { MongoPublication, PublicationModel, PublicationTarget } from '../mongo/models/publications'

export const MAX_AGE_LINK_LIMIT_IN_DAYS = 30

export const PUBLICATION_TARGET_FREQUENCY: { fast: number; slow: number } = {
  fast: 5 * 60 * 1000,
  slow: 30 * 60 * 1000,
}

export class PublicationService {
  async getPublication(publicationId: string): Promise<any> {
    const publication = await PublicationModel.findOne({ iid: publicationId })
    if (!publication) {
      throw Boom.notFound(`No publication found with id "${publicationId}"`)
    }

    const transformedPublication = {
      id: publication.iid,
      publisher: publication.publisher,
      domain: publication.domain,
      createdTime: publication.publishedTime,
      lastScrapedTime: this.calc(publication),
      targets: publication.targets.map(target => ({
        feedType: target.feedType,
        entrypoint: target.entrypoint,
        updateRate: target.updateRate,
        nextSubmissionTime: new Date(target.nextSubmissionTime).toISOString(),
      })),
    }
    return transformedPublication
  }

  async listPublications(params: any): Promise<any> {
    const matchStage: mongoose.FilterQuery<MongoPublication> = { ...params }
    const pipeline: mongoose.PipelineStage[] = [{ $match: matchStage }]
    const publications = await PublicationModel.aggregate<MongoPublication>(pipeline)
    return {
      results: publications.map(publication => {
        const result = {
          id: publication.iid,
          publisher: publication.publisher,
          domain: publication.domain,
          createdTime: publication.publishedTime,
          lastScrapedTime: this.calc(publication),
          targets: publication.targets.map(target => ({
            feedType: target.feedType,
            entrypoint: target.entrypoint,
            updateRate: target.updateRate,
            nextSubmissionTime: new Date(target.nextSubmissionTime).toISOString(),
          })),
        }
        return result
      }),
    }
  }

  async createPublication(params: any): Promise<any> {
    const currentTime = new Date()

    const publication = await PublicationModel.create({
      type: 'publications',
      iid: new mongoose.Types.ObjectId(),
      publishedTime: currentTime,
      publisher: params.publisher,
      domain: params.domain,
      targets: params.targets.map(item => {
        const frequencyType = item.feedType === 'smart' ? 'slow' : 'fast'
        const updateRate = PUBLICATION_TARGET_FREQUENCY[`${frequencyType}`]
        const target: PublicationTarget = {
          feedType: item.feedType,
          updateRate: updateRate,
          entrypoint: item.entrypoint,
          nextSubmissionTime: updateRate + Date.now(),
        }
        return target
      }),
    })

    const transformedPublication = {
      id: publication.iid,
      publisher: publication.publisher,
      domain: publication.domain,
      createdTime: publication.publishedTime,
      lastScrapedTime: this.calc(publication),
      targets: publication.targets.map(target => ({
        feedType: target.feedType,
        entrypoint: target.entrypoint,
        updateRate: target.updateRate,
        nextSubmissionTime: new Date(target.nextSubmissionTime).toISOString(),
      })),
    }
    return transformedPublication
  }

  private calc = (publication: MongoPublication) => {
    const [mostRecentlyScrapedTarget] = publication.targets.sort(
      (a, b) => b.nextSubmissionTime - a.nextSubmissionTime
    )
    const lastScrapedTimestamp =
      mostRecentlyScrapedTarget?.nextSubmissionTime - mostRecentlyScrapedTarget?.updateRate
    return lastScrapedTimestamp > 0 ? new Date(lastScrapedTimestamp) : undefined
  }
}

export const publicationService = new PublicationService()