import { logger } from './utils/logger'
import { Service } from './services'
import getConfig from './utils/config'

async function main () {
  await initialize()

  const { graphqlTrigger, mode } = getConfig()
  const service = await Service.build({ graphqlTrigger, mode })
  await service.run()

  await cleanup()
}

async function initialize () {
  logger.info('Starting export script')
}

async function cleanup () {
  logger.info('Stopping export script')
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    logger.error(e.message)
    process.exit(1)
  })

process.on('unhandledRejection', (err) => logger.error(err))
