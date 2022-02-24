export interface ContributionTask {
    id: string
    blockHeight: number
    paraId: number
    account: string
    amount: string
    referralCode: string
    timestamp: string
    transactionExecuted: boolean
    isValid: boolean
    executedBlockHeight: number
}

export function identify (record: ContributionTask): string {
  return '{ ' + record.paraId + ' ' + record.blockHeight + ' }'
}
