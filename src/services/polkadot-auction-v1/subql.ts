import { gql, request } from 'graphql-request'
import { logger } from '../../utils/logger'
import { ContributionTask } from './types'

export async function fetchAllContributionsCount (
  startBlock: number,
  endBlock: number,
  graphqlEndpoint: string
): Promise<number> {
  const {
    dotContributions: { totalCount }
  } = await request(
    graphqlEndpoint,
    gql`
        query {
          dotContributions(
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
  return totalCount
}

export async function fetchAllContributions (
  startBlock: number,
  endBlock: number,
  graphqlEndpoint: string
): Promise<ContributionTask[]> {
  const {
    dotContributions: { nodes }
  } = await request(
    graphqlEndpoint,
    gql`
        query {
          dotContributions(
            orderBy: BLOCK_HEIGHT_ASC
            filter: {
              blockHeight: { greaterThan: ${startBlock}, lessThan: ${endBlock}}
            }
          ) {
            totalCount
            nodes {
              id
              blockHeight
              paraId
              account
              amount
              referralCode
              timestamp
              transactionExecuted
              isValid
              executedBlockHeight
            }
          }
        }
      `
  )

  //   const str = totalCount.toString().padStart(6, ' ') + ' DotContribution'.padStart(25, ' ')
  // if (startBlock === endBlock) logger.debug(`Fetch ${str} tasks at #${startBlock + 1}`)
  // else logger.debug(`Fetch ${str} tasks at #[${startBlock + 1}, ${endBlock - 1}]`)
  return nodes
}

export async function fetchAllExecutedContributionsCount (
  startBlock: number,
  endBlock: number,
  graphqlEndpoint: string
): Promise<number> {
  const {
    dotContributions: { totalCount }
  } = await request(
    graphqlEndpoint,
    gql`
      query {
        dotContributions(
          orderBy: BLOCK_HEIGHT_ASC
          filter: {
            executedBlockHeight: { greaterThan: ${startBlock}, lessThan: ${endBlock}}
          }
        ) {
          totalCount
        }
      }
    `
  )
  return totalCount
}

export async function fetchAllExecutedContributions (
  startBlock: number,
  endBlock: number,
  graphqlEndpoint: string
): Promise<ContributionTask[]> {
  const {
    dotContributions: { totalCount, nodes }
  } = await request(
    graphqlEndpoint,
    gql`
      query {
        dotContributions(
          orderBy: BLOCK_HEIGHT_ASC
          filter: {
            executedBlockHeight: { greaterThan: ${startBlock}, lessThan: ${endBlock}}
          }
        ) {
          totalCount
          nodes {
            id
            blockHeight
            paraId
            account
            amount
            referralCode
            timestamp
            transactionExecuted
            isValid
            executedBlockHeight
          }
        }
      }
    `
  )

  const str = totalCount.toString().padStart(6, ' ') + ' ExecutedDotContribution'.padStart(25, ' ')
  if (startBlock === endBlock) logger.debug(`Fetch ${str} tasks at #${startBlock + 1}`)
  else logger.debug(`Fetch ${str} tasks at #[${startBlock + 1}, ${endBlock - 1}]`)
  return nodes
}
