import { GraphqlConfig } from '../utils/config'
import { ApiServiceConfig, FetchServiceType } from './common'
import * as config from '../../config.json'
import { DotContributionFetcher } from './polkadot-auction-v1'
import { KsmViaHeikoContributionFetcher } from './kusama-auction-v2'

export class Service {
  static graphqlTrigger: GraphqlConfig;

  static async build (
    { graphqlTrigger }: ApiServiceConfig
  ) {
    Service.graphqlTrigger = graphqlTrigger

    return new Service()
  }

  public async run () {
    const dotContributionFetcher: FetchServiceType = (
      new DotContributionFetcher(
        config['auction-subquery'],
        Service.graphqlTrigger.auctionSubquery || false
      )
    )

    const ksmViaHeikoContributionFetcher: FetchServiceType = (
      new KsmViaHeikoContributionFetcher(
        config['crowdloan-via-heiko'],
        Service.graphqlTrigger.crowdloanViaHeiko || false
      )
    )

    await Promise.all([
      dotContributionFetcher.run(),
      ksmViaHeikoContributionFetcher.run()
    ])
  }
}
