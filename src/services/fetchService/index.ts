import { gql, request } from 'graphql-request'
import { sleep } from '../../utils/common'
import { logger } from '../../utils/logger'
import { FetchOption, ServiceConfig, SubqlFectchMethod } from '../common'

export abstract class FetchService {
  constructor (protected cfg: ServiceConfig) {}

  public async fetch (op: FetchOption): Promise<any[]> {
    const low = this.cfg.startHeight
    const high = await this.lastGraphQLProcessedHeight()
    const totalCounts = await this.fetchFromSubql(low, high, op.fetchAllRecordsCount)
    logger.info(`Total records count: ${totalCounts}, [${low}, ${high}]`)

    let start: number = low
    let end: number = low
    let epoch: number = 0
    const fetchedRecords: any[] = []
    while (true) {
      start = end + 1
      end = await this.calculateNextHeight(start, op.fetchAllRecordsCount)
      end = end >= high ? high : end
      const availableRecords = await Promise.all(
        await this.fetchFromSubql(start, end, op.fetchAllRecords)
      )
      availableRecords.forEach(record => fetchedRecords.push(record))
      logger.debug(`[Epoch: ${++epoch}(${this.cfg.name})], scan [${start}, ${end}], counts: ${availableRecords.length}`)
      if (end >= high) break
    }
    logger.info('Fetched records count: ' + fetchedRecords.length)
    while (true) if (fetchedRecords.length === totalCounts) return fetchedRecords
  }

  private fetchFromSubql = async (
    low: number,
    high: number,
    method: SubqlFectchMethod
  ): Promise<any> => {
    const fetchedResult = this.retry(method(low - 1, high + 1, this.cfg.graphql))
    if (!fetchedResult) {
      logger.error(`Failed to fetch records from subql: [${low},${high}]`)
      return null
    } else return fetchedResult
  }

  private retry = async (method: any, times?: number, sleepTime?: number): Promise<any> => {
    let retryTimes = times || 10
    while (true) {
      if (!retryTimes) throw new Error('Failed to request, pls try again]')
      try {
        const fetchedResult = await method
        return fetchedResult
      } catch (err) {
        logger.error(`your network seems to be unstable, retry again(${retryTimes}...`)
        retryTimes--
        sleep(sleepTime || 3000)
      }
    }
  }

  async calculateNextHeight (originHeight: number, solver: SubqlFectchMethod): Promise<number> {
    let ratio = 1
    while (true) {
      const newHeight = originHeight + Math.floor(this.cfg.adjustHeight * ratio)
      const total = await this.fetchFromSubql(originHeight, newHeight, solver)
      if (newHeight === originHeight) {
        logger.info(`${this.cfg.name}: #${newHeight} has ${total} records, limited-records ${this.cfg.recordsLimit}, step: 0`)
        return newHeight
      }

      if (total <= this.cfg.recordsLimit) {
        if (ratio !== 1) {
          logger.debug(`${this.cfg.name}: Split limit-exceeded(${this.cfg.recordsLimit}) records to multiple batches, step: ${newHeight - originHeight}`)
        }
        return newHeight
      } else {
        ratio = ratio / (Math.floor(total / this.cfg.recordsLimit) < 2
          ? 2
          : Math.floor(total / this.cfg.recordsLimit))
      }
    }
  }

  async lastGraphQLProcessedHeight (): Promise<number> {
    const {
      _metadata: { lastProcessedHeight }
    } = await this.retry(request(
      this.cfg.graphql,
      gql`
        query {
          _metadata {
            lastProcessedHeight
          }
        }
      `
    ))

    return lastProcessedHeight
  }
}
