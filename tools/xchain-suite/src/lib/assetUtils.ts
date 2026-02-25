import { AssetType, type AnyAsset } from '@xchainjs/xchain-util'
import type { ChainAsset } from './types'
import { getChainById } from './chains'

/** Convert a ChainAsset (UI type) to an AnyAsset (xchainjs type) */
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
    type: AssetType.NATIVE,
  }
}

/** Get decimals — use token-specific decimals when available, else chain default */
export function getDecimals(chainAsset: ChainAsset): number {
  if (chainAsset.decimals !== undefined) return chainAsset.decimals
  const chain = getChainById(chainAsset.chainId)
  return chain?.decimals ?? 8
}
