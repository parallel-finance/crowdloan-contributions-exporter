import { encodeAddress } from '@polkadot/util-crypto'

export const anyChainSs58Prefix = 42
export function useAnyChainAddress (address: string, isShort = false): string {
  return convertToSS58(address, anyChainSs58Prefix, isShort)
}

export function convertToSS58 (text: string, prefix: number, isShort = false): string {
  if (!text) return ''

  try {
    let address = encodeAddress(text, prefix)
    if (isShort) {
      const len = 8
      address = address.substring(0, len) +
        '...' +
        address.substring(address.length - len, len)
    }

    return address
  } catch (error) {
    return ''
  }
}
export function compareAddress (addr1: string, addr2: string): boolean {
  return useAnyChainAddress(addr1) === useAnyChainAddress(addr2)
}
