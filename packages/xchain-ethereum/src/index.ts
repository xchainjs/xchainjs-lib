export * from './types'
export * from './client'
export * from './const'
export {
  call,
  estimateApprove,
  estimateCall,
  estimateDefaultFeesWithGasPricesAndLimits,
  getApprovalAmount,
  getAssetAddress,
  getDecimal,
  getDefaultFees,
  getDefaultGasPrices,
  getTokenAddress,
  getPrefix,
  getFee,
  isApproved,
  isEthAsset,
  validateAddress,
} from './utils'

import erc20ABI from './data/erc20.json'
import routerABI from './data/routerABI.json'

export const abi = {
  router: routerABI,
  erc20: erc20ABI,
}
