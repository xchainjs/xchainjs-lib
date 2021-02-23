import { Fees, Network as XChainNetwork, Tx } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetETH,
  assetFromString,
  baseAmount,
  ETHChain,
  BaseAmount,
  assetToString,
} from '@xchainjs/xchain-util'
import {
  Network as EthNetwork,
  Address,
  ETHTransactionInfo,
  TokenTransactionInfo,
  FeesWithGasPricesAndLimits,
  GasPrices,
} from './types'
import { ethers, BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

export const ETH_DECIMAL = 18
export const ETHPLORER_FREEKEY = 'freekey'

// from https://github.com/MetaMask/metamask-extension/blob/ee205b893fe61dc4736efc576e0663189a9d23da/ui/app/pages/send/send.constants.js#L39
// and based on recommendations of https://ethgasstation.info/blog/gas-limit/
export const SIMPLE_GAS_COST: ethers.BigNumber = BigNumber.from(21000)
export const BASE_TOKEN_GAS_COST: ethers.BigNumber = BigNumber.from(100000)

// default gas price in gwei
export const DEFAULT_GAS_PRICE = 50

export const ETHAddress = '0x0000000000000000000000000000000000000000'
export const MAX_APPROVAL = BigNumber.from(2).pow(256).sub(1)

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
    date: new Date(parseInt(tx.timeStamp) * 1000),
    type: 'transfer',
    hash: tx.hash,
  }
}

/**
 * Calculate fees by multiplying .
 *
 * @returns {Fees} The default gas price.
 */
export const getFee = ({ gasPrice, gasLimit }: { gasPrice: BaseAmount; gasLimit: BigNumber }) =>
  baseAmount(gasPrice.amount().multipliedBy(gasLimit.toString()), ETH_DECIMAL)

export const estimateDefaultFeesWithGasPricesAndLimits = (asset?: Asset): FeesWithGasPricesAndLimits => {
  const gasPrices = {
    average: baseAmount(parseUnits(DEFAULT_GAS_PRICE.toString(), 'gwei').toString(), ETH_DECIMAL),
    fast: baseAmount(parseUnits((DEFAULT_GAS_PRICE * 2).toString(), 'gwei').toString(), ETH_DECIMAL),
    fastest: baseAmount(parseUnits((DEFAULT_GAS_PRICE * 3).toString(), 'gwei').toString(), ETH_DECIMAL),
  }
  const { fast: fastGP, fastest: fastestGP, average: averageGP } = gasPrices

  let assetAddress
  if (asset && assetToString(asset) !== assetToString(AssetETH)) {
    assetAddress = getTokenAddress(asset)
  }

  let gasLimits
  if (assetAddress && assetAddress !== ETHAddress) {
    gasLimits = {
      average: BigNumber.from(BASE_TOKEN_GAS_COST),
      fast: BigNumber.from(BASE_TOKEN_GAS_COST),
      fastest: BigNumber.from(BASE_TOKEN_GAS_COST),
    }
  } else {
    gasLimits = {
      average: BigNumber.from(SIMPLE_GAS_COST),
      fast: BigNumber.from(SIMPLE_GAS_COST),
      fastest: BigNumber.from(SIMPLE_GAS_COST),
    }
  }
  const { fast: fastGL, fastest: fastestGL, average: averageGL } = gasLimits

  return {
    gasPrices,
    gasLimits,
    fees: {
      type: 'byte',
      average: getFee({ gasPrice: averageGP, gasLimit: averageGL }),
      fast: getFee({ gasPrice: fastGP, gasLimit: fastGL }),
      fastest: getFee({ gasPrice: fastestGP, gasLimit: fastestGL }),
    },
  }
}

/**
 * Get the default fees.
 *
 * @returns {Fees} The default gas price.
 */
export const getDefaultFees = (asset?: Asset): Fees => {
  const { fees } = estimateDefaultFeesWithGasPricesAndLimits(asset)
  return fees
}

/**
 * Get the default gas price.
 *
 * @returns {Fees} The default gas prices.
 */
export const getDefaultGasPrices = (asset?: Asset): GasPrices => {
  const { gasPrices } = estimateDefaultFeesWithGasPricesAndLimits(asset)
  return gasPrices
}

/**
 * Get address prefix based on the network.
 *
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = () => '0x'

/**
 * Filter self txs
 *
 * @returns {T[]}
 *
 **/
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
