import { gql, request } from 'graphql-request'
import { logger } from '../../utils/logger'
import { KsmViaHeikoContributionTask } from './types'

export async function fetchAllContributionsCount (
  startBlock: number,
  endBlock: number,
  graphqlEndpoint: string
): Promise<number> {
  const {
    contributions: { totalCount }
  } = await request(
    graphqlEndpoint,
    gql`
        query {
          contributions (
            orderBy: BLOCK_HEIGHT_ASC
            filter: {
              blockHeight: { greaterThan: ${startBlock}, lessThan: ${endBlock}}
            }
          ) {
          	totalCount
          }
        }
      `
  )

  const str = totalCount.toString().padStart(6, ' ') + ' KsmViaHeikoContribution'.padStart(25, ' ')
  if (startBlock === endBlock) logger.debug(`Fetch ${str} tasks at #${startBlock + 1}`)
  else logger.debug(`Fetch ${str} tasks at #[${startBlock + 1}, ${endBlock - 1}]`)
  return totalCount
}

export async function fetchAllContributions (
  startBlock: number,
  endBlock: number,
  graphqlEndpoint: string
): Promise<KsmViaHeikoContributionTask[]> {
  const {
    contributions: { nodes }
  } = await request(
    graphqlEndpoint,
    gql`
        query {
          contributions (
            orderBy: BLOCK_HEIGHT_ASC
            filter: {
              blockHeight: { greaterThan: ${startBlock}, lessThan: ${endBlock}}
            }
          ) {
            nodes {
              id
              extrinsicHash
              vaultId
              blockHeight
              account
              amount
              timestamp
            }
          }
        }
      `
  )

  return nodes
}
