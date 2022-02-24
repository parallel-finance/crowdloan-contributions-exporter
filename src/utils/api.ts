import { ApiOptions } from '@polkadot/api/types'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { logger } from '../utils/logger'

export let api: ApiPromise

export namespace Api {
  export async function init (endpoint: string) {
    logger.debug(`connected endpoint: ${endpoint}`)
    api = await ApiPromise.create(
        { provider: new WsProvider(endpoint) } as ApiOptions
    )
  }
}
