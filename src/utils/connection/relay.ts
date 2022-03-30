import { ApiOptions } from '@polkadot/api/types'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { logger } from '../logger'

export let relayApi: ApiPromise

export namespace RelayConnection {
  export async function init (endpoint: string) {
    relayApi = await ApiPromise.create({
      provider: new WsProvider(endpoint)
    } as ApiOptions)

    logger.info(`Connected endpoint: ${endpoint}`)
  }
}
