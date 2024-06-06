import { AssetAETH } from '@xchainjs/xchain-arbitrum'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import { AssetKUJI } from '@xchainjs/xchain-kujira'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { Asset, Chain, eqAsset } from '@xchainjs/xchain-util'

/**
 * Check if a chain is EVM and supported by the protocol
 * @param {Chain} chain to check
 * @returns true if chain is EVM, otherwise, false
 */
export const isProtocolEVMChain = (chain: Chain): boolean => {
  return [AssetETH.chain, AssetAETH.chain].includes(chain)
}

/**
 * Check if asset is ERC20
 * @param {Asset} asset to check
 * @returns true if asset is ERC20, otherwise, false
 */
export const isProtocolERC20Asset = (asset: Asset): boolean => {
  return isProtocolEVMChain(asset.chain)
    ? [AssetETH, AssetAETH].findIndex((nativeEVMAsset) => eqAsset(nativeEVMAsset, asset)) === -1 && !asset.synth
    : false
}

/**
 * Check if a chain is EVM and supported by the protocol
 * @param {Chain} chain to check
 * @returns true if chain is EVM, otherwise, false
 */
export const isProtocolBFTChain = (chain: Chain): boolean => {
  return [AssetKUJI.chain, AssetRuneNative.chain].includes(chain)
}
