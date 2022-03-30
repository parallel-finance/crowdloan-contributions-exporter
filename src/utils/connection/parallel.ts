import { ApiOptions } from '@polkadot/api/types'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { logger } from '../logger'

export let paraApi: ApiPromise

export namespace ParaConnection {
  export async function init (endpoint: string) {
    paraApi = await ApiPromise.create({
      provider: new WsProvider(endpoint)
    } as ApiOptions)

    logger.info(`Connected endpoint: ${endpoint}`)
  }
}
