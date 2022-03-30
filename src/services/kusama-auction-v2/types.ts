import { BlockHash } from '@polkadot/types/interfaces'

export interface KsmViaHeikoContributionTask {
  id: string
  extrinsicHash: string
  vaultId: string
  blockHeight: number
  account: string
  amount: string
  timestamp: string
}

export interface KsmViaHeikoContributionInfo extends KsmViaHeikoContributionTask {
  relayBlockHeight: number
  relayTxHash: string
}

export type BlockInfo = {
  hash: BlockHash
  blockHeight: number
}

export type CrowdloanContributed = {
  who: string
  fundIndex: number
  amount: string
  blockHeight: number
  extrinsicHash: string
  // timestamp: string
}

export type ParaContribute = {

}

export function identify (record: KsmViaHeikoContributionTask): string {
  return '{ ' + record.vaultId + ' #' + record.blockHeight + ' }'
}
