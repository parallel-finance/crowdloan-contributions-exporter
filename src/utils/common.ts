import { logger } from './logger'
import { Maybe } from './types'

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const notEmpty = <T>(value: Maybe<T>): value is T =>
  value !== null && value !== undefined

export async function asyncForEach (array: any, callback: any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export const bomb = (message: string) => {
  logger.info('****************bombing****************')
  logger.info(message)
  process.exit(1)
}
