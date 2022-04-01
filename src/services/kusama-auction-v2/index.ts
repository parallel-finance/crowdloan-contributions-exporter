import { logger } from '../../utils/logger'
import * as fs from 'fs-extra'
import { json2csvAsync } from 'json-2-csv'
import { ServiceConfig, FetchOption } from '../common'
import { BlockInfo, CrowdloanContributed, KsmViaHeikoContributionInfo, KsmViaHeikoContributionTask } from './types'
import { FetchService } from '../fetchService'
import {
  fetchAllContributions, fetchAllContributionsCount
} from './subql'
import { relayApi, RelayConnection } from '../../utils/connection/relay'
import { paraApi, ParaConnection } from '../../utils/connection/parallel'
import { notEmpty, sleep } from '../../utils/common'
import { PersistedValidationData } from '@polkadot/types/interfaces/parachains'
import { GenericExtrinsic, Option, Vec } from '@polkadot/types'
import { EventRecord, SignedBlock } from '@polkadot/types/interfaces'
import { chunk } from 'lodash'

export class KsmViaHeikoContributionFetcher extends FetchService {
  private trigger: boolean = false
  private chunkSize: number = 5
  private mode: string = 'normal'
  constructor (config: ServiceConfig, trigger: boolean, mode: string) {
    super(config)
    this.trigger = trigger
    if (mode) this.mode = mode
  }

  private async initializeConnections (parallel: string, relay: string) {
    try {
      logger.debug('Initialize connections...')
      await ParaConnection.init(parallel)
      await RelayConnection.init(relay)
    } catch (error) {
      throw new Error(`Initialize connections failed, error: ${error}`)
    }
  }

  public async run (): Promise<void> {
    if (!this.trigger) return
    await this.initializeConnections(this.cfg.paraEndpoint!, this.cfg.relayEndpoint!)

    const ksmViaHeikoContributionsOpreration: FetchOption = {
      fetchAllRecordsCount: fetchAllContributionsCount,
      fetchAllRecords: fetchAllContributions
    }

    let contributions: KsmViaHeikoContributionTask[] = await this.fetch(ksmViaHeikoContributionsOpreration)
    contributions.sort((a, b) => a.blockHeight - b.blockHeight)
    // if (this.mode === 'rich') {
    logger.debug('Waiting for data processing, about 5~10 minutes...(or more time)')
    contributions = await this.searchRelayEvent(contributions)
    // }

    await json2csvAsync(contributions)
      .then((csv) => fs.writeFileSync('./ksm_via_heiko_contributions.csv', csv))
      .catch((err) => logger.error('ERROR: ' + err.message))
    logger.info(`Feching ${this.cfg.name} finished.`)
  }

  private async searchRelayEvent (contributions: KsmViaHeikoContributionTask[]): Promise<KsmViaHeikoContributionTask[]> {
    const batches = chunk(contributions, contributions.length / this.chunkSize)
    const records: KsmViaHeikoContributionTask[] = []
    for (const batch of batches) {
      const res = await this.applyUpdate(batch)
      res.forEach((item) => records.push(item))
      await sleep(1000)
    }
    return records
  }

  private async applyUpdate (originRecords: KsmViaHeikoContributionTask[]): Promise<KsmViaHeikoContributionTask[]> {
    originRecords.sort((a, b) => a.blockHeight - b.blockHeight)

    const find = async (record: KsmViaHeikoContributionTask) => {
      const paraBlockHash = await paraApi.rpc.chain.getBlockHash(record.blockHeight)
      const paraApiAtBlock = await paraApi?.at(paraBlockHash)

      const validationData = (await paraApiAtBlock.query.parachainSystem.validationData()) as Option<PersistedValidationData>
      if (validationData.isNone) { logger.error('ValidationData is null'); return null }
      const relayBlockHeight: number = validationData.unwrap().relayParentNumber.toNumber()
      const relayBlockHash = await relayApi.rpc.chain.getBlockHash(relayBlockHeight)
      const relayBlockInfo = {
        hash: relayBlockHash,
        blockHeight: relayBlockHeight
      } as BlockInfo

      logger.info(`Try find ${record.account} relay#${relayBlockInfo.blockHeight}`)
      const find = await this.findRelayContribute(relayBlockInfo, record)
      if (find) logger.debug(`para#${record.blockHeight} -> relay#${relayBlockHeight}, ${JSON.stringify(find)}`)
      else logger.error(`para#${record.blockHeight} -> not found`)
      return find
    }

    const updatedRecords = await Promise.all(originRecords.map(async (relayRecord) => {
      const res = await find(relayRecord)
      if (res) { return res } else {
        return {
          ...relayRecord,
          relayBlockHeight: 0,
          relayTxHash: `Not found in relay chain, [-${this.cfg.searchRange![0]}, +${this.cfg.searchRange![1]}]`
        } as KsmViaHeikoContributionInfo
      }
    }))

    return updatedRecords
  }

  private async findRelayContribute (relayBlock: BlockInfo, paraContribute: KsmViaHeikoContributionTask): Promise<KsmViaHeikoContributionInfo | null> {
    const { blockHeight } = relayBlock

    const [pre, next] = this.cfg.searchRange!
    let queryBlock: number = blockHeight - pre
    while (true) {
      queryBlock += 1
      const relayBlockHash = await relayApi.rpc.chain.getBlockHash(queryBlock)
      const relayApiAtBlock = await relayApi?.at(relayBlockHash)

      const events = (await relayApiAtBlock.query.system.events()) as unknown as Vec<EventRecord>
      const { block }: SignedBlock = await relayApi.rpc.chain.getBlock(relayBlockHash)

      const contributions: CrowdloanContributed[][] = block.extrinsics
        .map((extrinsic: GenericExtrinsic, index: number) => {
          const extrinsicEvents =
            events.filter(({ phase }) => phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index))
          const crowdloanExtrinsicEvents =
            extrinsicEvents.filter(({ event }) => event.section === 'crowdloan')
          const contributedEvents =
            crowdloanExtrinsicEvents.filter(({ event }) => event.method === 'Contributed')

          const res = contributedEvents.map((contribute) => {
            const extrinsicSuccessEvent =
              extrinsicEvents.find(({ event }) => relayApiAtBlock.events.system.ExtrinsicSuccess.is(event))
            if (!extrinsicSuccessEvent || !contribute) return null

            const [who, fundIndex, amount] =
              contribute ? contribute.event.data.map((x) => x.toString()) : []

            const crowdloanContributed: CrowdloanContributed = {
              who,
              fundIndex: parseInt(fundIndex),
              amount,
              blockHeight: queryBlock,
              extrinsicHash: extrinsic.hash.toHex()
            }
            return crowdloanContributed
          })
            .filter(notEmpty)
            .filter(
              record => BigInt(paraContribute.amount) === BigInt(record.amount) &&
            record.fundIndex === Number(paraContribute.vaultId.split('-')[0]
            ))
          return res.filter(notEmpty)
        })

      for (const ex of contributions) {
        if (ex.length > 0) {
          const { who, fundIndex, amount, blockHeight, extrinsicHash } = ex[0]
          logger.debug(`contributed-task: #${blockHeight} ${fundIndex}-${who}, amount: ${amount}`)

          return {
            ...paraContribute,
            relayBlockHeight: queryBlock,
            relayTxHash: extrinsicHash
          } as KsmViaHeikoContributionInfo
        } else if (ex.length > 1) {
          logger.error('TODO: handle case: multi-same-contributions in single block')
          logger.debug(`${JSON.stringify(contributions)}`)
        }
      }

      if (queryBlock >= blockHeight + next) break
    }

    return null
  }

  private hasExtrinsic (events: Vec<EventRecord>, section: string, method: string) {
    const foundEvent = events.find(
      ({ event }) =>
        event.method === method && event.section === section
    )

    return foundEvent
      ? (events.find(({ event }) => relayApi.events.system.ExtrinsicSuccess.is(event)))
      : false
  }
}
