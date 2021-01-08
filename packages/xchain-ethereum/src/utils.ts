import { Fees, Network as XChainNetwork, Tx } from '@xchainjs/xchain-client'
import { baseAmount, AssetETH, assetFromString, assetAmount, assetToBase, ETHChain, Asset } from '@xchainjs/xchain-util'
import { Network as EthNetwork, TransactionOperation, TransactionInfo, Address } from './types'
import { ethers } from 'ethers'

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

/**
 * Validate the given address.
 *
 * @param {Address} address
 * @returns {boolean} `true` or `false`
 */
export const validateAddress = (address: Address): boolean => {
  try {
    ethers.utils.getAddress(address)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Get token address from asset.
 *
 * @param {Asset} asset
 * @returns {string|null} The token address.
 */
export const getTokenAddress = (asset: Asset | null): string | null => {
  if (asset) {
    const assetAddress = asset.symbol.slice(asset.ticker.length + 1)
    if (validateAddress(assetAddress)) {
      return assetAddress
    }
  }

  return null
}

/**
 * Check if the symbol is valid.
 *
 * @param {string|null|undefined} symbol
 * @returns {boolean} `true` or `false`.
 */
export const validateSymbol = (symbol?: string | null): boolean => {
  return !!symbol && symbol.length >= 3
}

/**
 * Get transactions from operation
 *
 * @param {TransactionOperation} operation
 * @returns {Tx|null} The parsed transaction.
 */
export const getTxFromOperation = (operation: TransactionOperation): Tx | null => {
  const decimals = parseInt(operation.tokenInfo.decimals) || ETH_DECIMAL
  const symbol = operation.tokenInfo.symbol
  const tokenAddress = operation.tokenInfo.address
  if (validateSymbol(symbol) && validateAddress(tokenAddress)) {
    const tokenAsset = assetFromString(`${ETHChain}.${symbol}-${tokenAddress}`)
    if (tokenAsset && getTokenAddress(tokenAsset)) {
      return {
        asset: tokenAsset,
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
  }

  return null
}

/**
 * Get transactions from ETH transaction
 *
 * @param {TransactionInfo} txInfo
 * @returns {Tx} The parsed transaction.
 */
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
