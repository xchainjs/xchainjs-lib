import { AssetType, type AnyAsset } from '@xchainjs/xchain-util'
import type { ChainAsset } from './types'
import { getChainById } from './chains'

export function buildAsset(chainAsset: ChainAsset): AnyAsset {
  if (chainAsset.contractAddress) {
    return {
      chain: chainAsset.chainId,
      symbol: `${chainAsset.symbol}-${chainAsset.contractAddress}`,
      ticker: chainAsset.symbol,
      type: AssetType.TOKEN,
    }
  }
  return {
    chain: chainAsset.chainId,
    symbol: chainAsset.symbol,
    ticker: chainAsset.symbol,
    type: chainAsset.isToken ? AssetType.TOKEN : AssetType.NATIVE,
  }
}

export function getDecimals(chainAsset: ChainAsset): number {
  if (chainAsset.decimals !== undefined) return chainAsset.decimals
  const chain = getChainById(chainAsset.chainId)
  return chain?.decimals ?? 8
}
