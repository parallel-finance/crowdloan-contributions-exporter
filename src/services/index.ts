import { GraphqlConfig } from '../utils/config'
import { ApiServiceConfig, FetchServiceType } from './common'
import * as config from '../../config.json'
import { DotContributionFetcher } from './auction'

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

    await Promise.all([
      dotContributionFetcher.run()
    ])
  }
}
