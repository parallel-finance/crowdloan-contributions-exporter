import { gql, request } from 'graphql-request'
import { logger } from '../utils/logger'
export class Fetcher {
    private graphql: string
    constructor (url: string) { this.graphql = url }
    public async run () {
        const latestHeight = await this.lastGraphQLProcessedHeight()
        logger.info(`Starting export from ${this.graphql} , latest block#${latestHeight}`)
        while (true) {
            
        }
    }
    
    async lastGraphQLProcessedHeight (): Promise<number> {
        const {
          _metadata: { lastProcessedHeight }
        } = await request(
          this.graphql,
          gql`
            query {
              _metadata {
                lastProcessedHeight
              }
            }
          `
        )
        return lastProcessedHeight
      }
}
