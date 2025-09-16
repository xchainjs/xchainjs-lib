import { AnyAsset } from '@xchainjs/xchain-util'
import { TronWeb } from 'tronweb'

export const validateAddress = (address: string) => {
  return TronWeb.isAddress(address)
}

export const getTRC20AssetContractAddress = (asset: AnyAsset): string | null => {
  try {
    return asset.symbol.slice(asset.ticker.length + 1)
  } catch (_err) {
    return null
  }
}
