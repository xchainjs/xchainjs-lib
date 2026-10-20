import { Address } from '@xchainjs/xchain-util'
import { getAddress } from 'ethers'

export const validateAddress = (address: Address): boolean => {
  try {
    getAddress(address)
    return true
  } catch (_error) {
    return false
  }
}

export const validateSymbol = (symbol?: string | null): boolean => (symbol ? symbol.length >= 3 : false)

export const filterSelfTxs = <T extends { from: string; to: string; hash: string }>(txs: T[]): T[] => {
  const filterTxs = txs.filter((tx) => tx.from !== tx.to)
  let selfTxs = txs.filter((tx) => tx.from === tx.to)
  while (selfTxs.length) {
    const selfTx = selfTxs[0]
    filterTxs.push(selfTx)
    selfTxs = selfTxs.filter((tx) => tx.hash !== selfTx.hash)
  }

  return filterTxs
}
