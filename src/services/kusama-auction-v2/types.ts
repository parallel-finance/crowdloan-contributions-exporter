export interface KsmViaHeikoContributionTask {
  id: string
  extrinsicHash: string
  vaultId: string
  blockHeight: number
  account: string
  amount: string
  timestamp: string
}

export function identify (record: KsmViaHeikoContributionTask): string {
  return '{ ' + record.vaultId + ' #' + record.blockHeight + ' }'
}
