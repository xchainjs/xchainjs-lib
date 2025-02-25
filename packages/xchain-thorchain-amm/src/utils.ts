import { AVAXChain, AssetAVAX, Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { AssetBETH, BASEChain, Client as BaseClient, defaultBaseParams } from '@xchainjs/xchain-base'
import { BTCChain, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { BCHChain, Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { AssetBSC, BSCChain, Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Network } from '@xchainjs/xchain-client'
import { AssetATOM, Client as GaiaClient, GAIAChain } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, DOGEChain, defaultDogeParams } from '@xchainjs/xchain-doge'
import { AssetETH, Client as EthClient, ETHChain, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient, LTCChain, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { Client as ThorClient, THORChain, defaultClientConfig as defaultThorParams } from '@xchainjs/xchain-thorchain'
import { CompatibleAsset } from '@xchainjs/xchain-thorchain-query'
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
  return [AssetETH.chain, AssetBSC.chain, AssetAVAX.chain, AssetBETH.chain].includes(chain)
}

/**
 * Check if asset is ERC20
 * @param {Asset} asset to check
 * @returns true if asset is ERC20, otherwise, false
 */
export const isProtocolERC20Asset = (asset: CompatibleAsset): asset is TokenAsset => {
  return isProtocolEVMChain(asset.chain)
    ? [AssetETH, AssetAVAX, AssetBSC, AssetBETH].findIndex((nativeEVMAsset) => eqAsset(nativeEVMAsset, asset)) === -1 &&
        !isSynthAsset(asset)
    : false
}

/**
 * Check if asset is ERC20
 * @param {Asset} asset to check
 * @returns true if asset is ERC20, otherwise, false
 */
export const isTokenCryptoAmount = (amount: CryptoAmount): amount is TokenCryptoAmount => {
  return isProtocolEVMChain(amount.asset.chain)
    ? [AssetETH, AssetAVAX, AssetBSC, AssetBETH].findIndex((nativeEVMAsset) =>
        eqAsset(nativeEVMAsset, amount.asset),
      ) === -1 && !isSynthAsset(amount.asset)
    : false
}

/**
 * Check if a chain is EVM and supported by the protocol
 * @param {Chain} chain to check
 * @returns true if chain is EVM, otherwise, false
 */
export const isProtocolBFTChain = (chain: Chain): boolean => {
  return [AssetATOM.chain].includes(chain)
}

export const validateAddress = (network: Network, chain: Chain, address: Address): boolean => {
  switch (chain) {
    case BTCChain:
      return new BtcClient({ ...defaultBtcParams, network }).validateAddress(address)
    case BCHChain:
      return new BchClient({ ...defaultBchParams, network }).validateAddress(address)
    case LTCChain:
      return new LtcClient({ ...defaultLtcParams, network }).validateAddress(address)
    case DOGEChain:
      return new DogeClient({ ...defaultDogeParams, network }).validateAddress(address)
    case ETHChain:
      return new EthClient({ ...defaultEthParams, network }).validateAddress(address)
    case AVAXChain:
      return new AvaxClient({ ...defaultAvaxParams, network }).validateAddress(address)
    case BSCChain:
      return new BscClient({ ...defaultBscParams, network }).validateAddress(address)
    case BASEChain:
      return new BaseClient({ ...defaultBaseParams, network }).validateAddress(address)
    case GAIAChain:
      return new GaiaClient({ network }).validateAddress(address)
    case THORChain:
      return new ThorClient({ ...defaultThorParams, network }).validateAddress(address)
    default:
      throw Error('Unsupported chain')
  }
}
