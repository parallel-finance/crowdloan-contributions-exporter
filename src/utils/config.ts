import { getBooleanEnv } from './getEnv'

export interface GraphqlConfig {
  auctionSubquery: boolean;
  crowdloanMoonbeam: boolean;
  moonbeamDistribution: boolean;
  ledgerRewardAddress: boolean;
  bridge: boolean;
  crowdloanViaHeiko: boolean;
}

interface Config {
  graphqlTrigger: GraphqlConfig;
}

const getConfig = (): Config => ({
  graphqlTrigger: {
    // Table: dot_contribution
    auctionSubquery: getBooleanEnv('TRIGGER_AUCTION_SUBQUERY'),
    // Table: moonbeam_reward_address, moonbeam_terms_signed
    crowdloanMoonbeam: getBooleanEnv('TRIGGER_CROWDLOAN_MOONBEAM'),
    // Table: claimed_reward
    moonbeamDistribution: getBooleanEnv('TRIGGER_MOONBEAM_DISTRIBUTION'),
    // Table: ledger_reward_address
    ledgerRewardAddress: getBooleanEnv('TRIGGER_LEDGER_REWARD_ADDRESS'),
    // Table: bridge_ins, bridge_outs, bridge_votes,
    bridge: getBooleanEnv('TRIGGER_BRIDGE'),
    // Table: crowdloan_via_heiko
    crowdloanViaHeiko: getBooleanEnv('TRIGGER_CROWDLOAN_VIA_HEIKO')
  }
})

export default getConfig
