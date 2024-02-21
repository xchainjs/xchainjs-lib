import { AssetAVAX } from '@xchainjs/xchain-avax'
import { AssetBNB } from '@xchainjs/xchain-binance'
import { AssetBSC } from '@xchainjs/xchain-bsc'
import { AssetATOM } from '@xchainjs/xchain-cosmos'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import { Asset, Chain } from '@xchainjs/xchain-util'

/**
 * Check if a chain is EVM and supported by the protocol
 * @param {Chain} chain to check
 * @returns true if chain is EVM, otherwise, false
 */
export const isProtocolEVMChain = (chain: Chain): boolean => {
  return [AssetETH.chain, AssetBSC.chain, AssetAVAX.chain].includes(chain)
}

/**
 * Check if asset is ERC20
 * @param {Asset} asset to check
 * @returns true if asset is ERC20, otherwise, false
 */
export const isProtocolERC20Asset = (asset: Asset): boolean => {
  return isProtocolEVMChain(asset.chain)
    ? ![AssetETH.symbol, AssetAVAX.symbol, AssetBSC.symbol].includes(asset.symbol)
    : false
}

/**
 * Check if a chain is EVM and supported by the protocol
 * @param {Chain} chain to check
 * @returns true if chain is EVM, otherwise, false
 */
export const isProtocolBFTChain = (chain: Chain): boolean => {
  return [AssetBNB.chain, AssetATOM.chain].includes(chain)
}
