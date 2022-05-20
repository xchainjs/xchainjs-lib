import { AssetLUNA } from '@xchainjs/xchain-terra'
import {
  Asset,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  AssetDOGE,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  PolkadotChain,
  THORChain,
  TerraChain,
  assetToString,
  isChain,
} from '@xchainjs/xchain-util'

// not using this atm
export const ENABLED_CHAINS: Chain[] = envOrDefault(
  process.env.REACT_APP_CHAINS_ENABLED,
  'THOR,BNB,BTC,LTC,BCH,ETH,DOGE,TERRA',
)
  .replace(/\s/g, '')
  .split(',')
  .filter(isChain)

export const isEnabledChain = (chain: Chain) => ENABLED_CHAINS.includes(chain)

/**
 * Gets the gas asset of a chain
 *
 * @param chain
 * @returns
 */
export const getChainAsset = (chain: Chain): Asset => {
  switch (chain) {
    case BNBChain:
      return AssetBNB
    case BTCChain:
      return AssetBTC
    case ETHChain:
      return AssetETH
    case THORChain:
      return AssetRuneNative
    case CosmosChain:
      throw Error('Cosmos is not supported yet')
    case BCHChain:
      return AssetBCH
    case LTCChain:
      return AssetLTC
    case DOGEChain:
      return AssetDOGE
    case TerraChain:
      return AssetLUNA
    case PolkadotChain:
      throw Error('Polkadot is not supported yet')
  }
}
