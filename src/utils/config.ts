import { getBooleanEnv, getStringEnv } from './getEnv'

export interface GraphqlConfig {
  auctionSubquery: boolean;
  crowdloanMoonbeam: boolean;
  moonbeamDistribution: boolean;
  ledgerRewardAddress: boolean;
  bridge: boolean;
  crowdloanViaHeiko: boolean;
}

interface Connection {
  parallel: string
  relay: string
}

export interface Config {
  graphqlTrigger: GraphqlConfig
  endpoints?: Connection
  mode: string
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
  },
  // endpoints: {
  //   // Table: bridge_ins, bridge_outs, bridge_votes,
  //   parallel: getStringEnv('PARALLEL_ENDPOINT'),
  //   // Table: crowdloan_via_heiko
  //   relay: getStringEnv('RELAY_ENDPOINT')
  // }
  mode: getStringEnv('EXPORT_MODE')
})

export default getConfig
