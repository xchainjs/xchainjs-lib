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

//import { eqChain } from './fp/eq'

//...\asgardex-electron\src\renderer\services\const.ts
/** const of the enbaled chains -- not sure how to get this to work */
import { ENABLED_CHAINS } from '../services/const'

export const ENABLED_CHAINS: Chain[] = envOrDefault(
  process.env.REACT_APP_CHAINS_ENABLED,
  'THOR,BNB,BTC,LTC,BCH,ETH,DOGE,TERRA',
)
  .replace(/\s/g, '')
  .split(',')
  .filter(isChain)

export const isEnabledChain = (chain: Chain) => ENABLED_CHAINS.includes(chain)

/**
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

export const eqString = S.Eq
export const eqAsset: Eq.Eq<Asset> = {
  equals: (x, y) => eqString.equals(assetToString(x).toUpperCase(), assetToString(y).toUpperCase()),
}

/**
 *
 * There lots of good util functions at s\thorchain\asgardex-electron\src\renderer\helpers\fp\eq.ts
 *  like eqChain, eqAsset and so on.
 *
 */

// Below is taken from \thorchain\asgardex-electron\src\renderer\helpers\chainHelper.ts
/**
 * Check whether chain is BTC chain
 */
export const isBtcChain = (chain: Chain): boolean => eqChain.equals(chain, BTCChain)

/**
 * Check whether chain is LTC chain
 */
export const isLtcChain = (chain: Chain): boolean => eqChain.equals(chain, LTCChain)

/**
 * Check whether chain is THOR chain
 */
export const isThorChain = (chain: Chain): boolean => eqChain.equals(chain, THORChain)

/**
 * Check whether chain is BNB chain
 */
export const isBnbChain = (chain: Chain): boolean => eqChain.equals(chain, BNBChain)

/**
 * Check whether chain is ETH chain
 */
export const isEthChain = (chain: Chain): boolean => eqChain.equals(chain, ETHChain)

/**
 * Check whether chain is BCH chain
 */
export const isBchChain = (chain: Chain): boolean => eqChain.equals(chain, BCHChain)

/**
 * Check whether chain is DOGE chain
 */
export const isDogeChain = (chain: Chain): boolean => eqChain.equals(chain, DOGEChain)

/**
 * Check whether chain is TERRA chain
 */
export const isTerraChain = (chain: Chain): boolean => eqChain.equals(chain, TerraChain)
