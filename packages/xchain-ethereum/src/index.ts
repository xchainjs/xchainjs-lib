export * from './types'
export * from './client'
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
  ETHAddress,
  ETH_DECIMAL,
  ETHPLORER_FREEKEY,
  MAX_APPROVAL,
} from './utils'

import erc20ABI from './data/erc20.json'
import routerABI from './data/routerABI.json'

export const abi = {
  router: routerABI,
  erc20: erc20ABI,
}
