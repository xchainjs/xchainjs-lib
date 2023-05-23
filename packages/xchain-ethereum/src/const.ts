import { Asset } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

export const LOWER_FEE_BOUND = 2_000_000_000
export const UPPER_FEE_BOUND = 1_000_000_000_000
export const ETH_SYMBOL = 'Ξ'

export const ETH_DECIMAL = 18
export const ETHPLORER_FREEKEY = 'freekey'

// from https://github.com/MetaMask/metamask-extension/blob/ee205b893fe61dc4736efc576e0663189a9d23da/ui/app/pages/send/send.constants.js#L39
// and based on recommendations of https://ethgasstation.info/blog/gas-limit/
export const SIMPLE_GAS_COST: ethers.BigNumber = ethers.BigNumber.from(21000)
export const BASE_TOKEN_GAS_COST: ethers.BigNumber = ethers.BigNumber.from(100000)

// default gas price in gwei
export const DEFAULT_GAS_PRICE = 50

export const ETHAddress = '0x0000000000000000000000000000000000000000'
export const MAX_APPROVAL: ethers.BigNumber = ethers.BigNumber.from(2).pow(256).sub(1)

/**
 * Chain identifier for Ethereum mainnet
 *
 */
export const ETHChain = 'ETH' as const

/**
 * Base "chain" asset on ethereum main net.
 *
 * Based on definition in Thorchain `common`
 * @see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export const AssetETH: Asset = { chain: ETHChain, symbol: 'ETH', ticker: 'ETH', synth: false }
