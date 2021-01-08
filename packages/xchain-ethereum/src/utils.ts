import { Fees, Network as XChainNetwork, Tx } from '@xchainjs/xchain-client'
import { baseAmount, AssetETH, assetFromString, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { Network as EthNetwork, TransactionOperation, TransactionInfo } from './types'

export const ETH_DECIMAL = 18
export const DEFAULT_GASLIMIT = 63000

/**
 * XChainNetwork -> EthNetwork
 *
 * @param {XChainNetwork} network
 * @returns {EthNetwork}
 */
export const xchainNetworkToEths = (network: XChainNetwork): EthNetwork => {
  switch (network) {
    // DO NOT use switch/case's default branch
    // to be sure that ALL possible cases are
    // processed in a similar way to reverted ethNetworkToXchains
    case 'mainnet':
      return EthNetwork.MAIN
    case 'testnet':
      return EthNetwork.TEST
  }
}

/**
 * EthNetwork -> XChainNetwork
 *
 * @param {EthNetwork} network
 * @returns {XChainNetwork}
 */
export const ethNetworkToXchains = (network: EthNetwork): XChainNetwork => {
  switch (network) {
    // DO NOT use switch/case's default branch
    // to be sure that ALL possible cases are
    // processed in a similar way to reverted xchainNetworkToEths
    case EthNetwork.MAIN:
      return 'mainnet'
    case EthNetwork.TEST:
      return 'testnet'
  }
}

export const getTxFromOperation = (operation: TransactionOperation): Tx => {
  const symbol = operation.tokenInfo.symbol
  const decimals = parseInt(operation.tokenInfo.decimals)

  return {
    asset: assetFromString(`${AssetETH.chain}.${symbol}`) || AssetETH,
    from: [
      {
        from: operation.from,
        amount: baseAmount(operation.value, decimals),
      },
    ],
    to: [
      {
        to: operation.to,
        amount: baseAmount(operation.value, decimals),
      },
    ],
    date: new Date(operation.timestamp * 1000),
    type: operation.type === 'transfer' ? 'transfer' : 'unknown',
    hash: operation.transactionHash,
  }
}
export const getTxFromEthTransaction = (txInfo: TransactionInfo): Tx => {
  return {
    asset: AssetETH,
    from: [
      {
        from: txInfo.from,
        amount: assetToBase(assetAmount(txInfo.value, ETH_DECIMAL)),
      },
    ],
    to: [
      {
        to: txInfo.to,
        amount: assetToBase(assetAmount(txInfo.value, ETH_DECIMAL)),
      },
    ],
    date: new Date(txInfo.timestamp * 1000),
    type: 'transfer',
    hash: txInfo.hash,
  }
}

/**
 * Get the default gas price.
 *
 * @returns {Fees} The default gas price.
 */
export const getDefaultFees = (): Fees => {
  return {
    type: 'base',
    average: baseAmount(30, ETH_DECIMAL),
    fast: baseAmount(35, ETH_DECIMAL),
    fastest: baseAmount(39, ETH_DECIMAL),
  }
}
