import { AssetAETH } from '@xchainjs/xchain-arbitrum'
import { BTCChain, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as DashClient, DASHChain, defaultDashParams } from '@xchainjs/xchain-dash'
import { AssetETH, Client as EthClient, ETHChain, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { AssetKUJI, Client as KujiraClient, KUJIChain, defaultKujiParams } from '@xchainjs/xchain-kujira'
import { Client as MayaClient, MAYAChain } from '@xchainjs/xchain-mayachain'
import { CompatibleAsset } from '@xchainjs/xchain-mayachain-query'
import { AssetRuneNative, Client as ThorClient, THORChain } from '@xchainjs/xchain-thorchain'
import {
  Address,
  Chain,
  CryptoAmount,
  TokenAsset,
  TokenCryptoAmount,
  eqAsset,
  isSynthAsset,
} from '@xchainjs/xchain-util'

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
export const isProtocolERC20Asset = (asset: CompatibleAsset): asset is TokenAsset => {
  return isProtocolEVMChain(asset.chain)
    ? [AssetETH, AssetAETH].findIndex((nativeEVMAsset) => eqAsset(nativeEVMAsset, asset)) === -1 && !isSynthAsset(asset)
    : false
}

/**
 * Check if asset is ERC20
 * @param {Asset} asset to check
 * @returns true if asset is ERC20, otherwise, false
 */
export const isTokenCryptoAmount = (amount: CryptoAmount): amount is TokenCryptoAmount => {
  return isProtocolEVMChain(amount.asset.chain)
    ? [AssetETH, AssetAETH].findIndex((nativeEVMAsset) => eqAsset(nativeEVMAsset, amount.asset)) === -1 &&
        !isSynthAsset(amount.asset)
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

export const validateAddress = (network: Network, chain: Chain, address: Address): boolean => {
  switch (chain) {
    case BTCChain:
      return new BtcClient({ ...defaultBtcParams, network }).validateAddress(address)
    case ETHChain:
      return new EthClient({ ...defaultEthParams, network }).validateAddress(address)
    case DASHChain:
      return new DashClient({ ...defaultDashParams, network }).validateAddress(address)
    case KUJIChain:
      return new KujiraClient({ ...defaultKujiParams, network }).validateAddress(address)
    case THORChain:
      return new ThorClient({ network }).validateAddress(address)
    case MAYAChain:
      return new MayaClient({ network }).validateAddress(address)
    default:
      throw Error('Unsupported chain')
  }
}
