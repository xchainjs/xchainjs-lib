import { Fees, Network as XChainNetwork, Tx } from '@xchainjs/xchain-client'
import { Asset, AssetETH, assetFromString, baseAmount, ETHChain } from '@xchainjs/xchain-util'
import { Network as EthNetwork, Address, ETHTransactionInfo, TokenTransactionInfo } from './types'
import { ethers } from 'ethers'

export const ETH_DECIMAL = 18
export const ETHPLORER_FREEKEY = 'freekey'

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
export const validateSymbol = (symbol?: string | null): boolean => (symbol ? symbol.length >= 3 : false)

/**
 * Get transactions from token tx
 *
 * @param {TokenTransactionInfo} tx
 * @returns {Tx|null} The parsed transaction.
 */
export const getTxFromTokenTransaction = (tx: TokenTransactionInfo): Tx | null => {
  const decimals = parseInt(tx.tokenDecimal) || ETH_DECIMAL
  const symbol = tx.tokenSymbol
  const address = tx.contractAddress
  if (validateSymbol(symbol) && validateAddress(address)) {
    const tokenAsset = assetFromString(`${ETHChain}.${symbol}-${address}`)
    if (tokenAsset) {
      return {
        asset: tokenAsset,
        from: [
          {
            from: tx.from,
            amount: baseAmount(tx.value, decimals),
          },
        ],
        to: [
          {
            to: tx.to,
            amount: baseAmount(tx.value, decimals),
          },
        ],
        date: new Date(tx.timeStamp),
        type: 'transfer',
        hash: tx.hash,
      }
    }
  }

  return null
}

/**
 * Get transactions from ETH transaction
 *
 * @param {ETHTransactionInfo} tx
 * @returns {Tx} The parsed transaction.
 */
export const getTxFromEthTransaction = (tx: ETHTransactionInfo): Tx => {
  return {
    asset: AssetETH,
    from: [
      {
        from: tx.from,
        amount: baseAmount(tx.value, ETH_DECIMAL),
      },
    ],
    to: [
      {
        to: tx.to,
        amount: baseAmount(tx.value, ETH_DECIMAL),
      },
    ],
    date: new Date(tx.timeStamp),
    type: 'transfer',
    hash: tx.hash,
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

/**
 * Get address prefix based on the network.
 *
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = () => '0x'
