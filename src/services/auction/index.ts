import { logger } from '../../utils/logger'
import * as fs from 'fs-extra'
import { json2csvAsync } from 'json-2-csv'
import { ServiceConfig, FetchOption } from '../common'
import { ContributionTask } from './types'
import { FetchService } from '../fetchService'
import {
  fetchAllContributions, fetchAllContributionsCount,
  fetchAllExecutedContributions, fetchAllExecutedContributionsCount
} from './subql'

export class DotContributionFetcher extends FetchService {
  private trigger: boolean = false
  constructor (config: ServiceConfig, trigger: boolean) {
    super(config)
    this.trigger = trigger
  }

  public async run (): Promise<void> {
    if (!this.trigger) return

    const dotContributionsOpreration: FetchOption = {
      fetchAllRecordsCount: fetchAllContributionsCount,
      fetchAllRecords: fetchAllContributions
    }

    const executedDotContributionsOpreration: FetchOption = {
      fetchAllRecordsCount: fetchAllExecutedContributionsCount,
      fetchAllRecords: fetchAllExecutedContributions
    }

    let contributions: ContributionTask[] = await this.fetch(dotContributionsOpreration)
    const executedContributions: ContributionTask[] = await this.fetch(executedDotContributionsOpreration)
    contributions.sort((a, b) => a.blockHeight - b.blockHeight)
    logger.debug('waiting for data processing, about 1~3 minutes...')
    contributions = this.applyUpdate(contributions, executedContributions)
    await json2csvAsync(contributions)
      .then((csv) => fs.writeFileSync('./dot_contributions.csv', csv))
      .catch((err) => logger.error('ERROR: ' + err.message))
    logger.info(`Feching ${this.cfg.name} finished.`)
  }

  private applyUpdate (originRecords: ContributionTask[], updatedRecords: ContributionTask[]): ContributionTask[] {
    originRecords.sort((a, b) => a.blockHeight - b.blockHeight)
    updatedRecords.sort((a, b) => a.blockHeight - b.blockHeight)
    const updateItem = (
      records: ContributionTask[],
      newRecord: ContributionTask
    ) => {
      const index = records.findIndex((o) => o.id === newRecord.id)
      records[index] = {
        ...records[index],
        isValid: newRecord.isValid,
        transactionExecuted: newRecord.transactionExecuted,
        executedBlockHeight: newRecord.executedBlockHeight
      }
      return records
    }
    updatedRecords.forEach(exe => { originRecords = updateItem(originRecords, exe) })

    return originRecords
  }
}
