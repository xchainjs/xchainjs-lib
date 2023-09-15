export * from './types'
export * from './client'

export {
  call,
  estimateApprove,
  estimateCall,
  // estimateDefaultFeesWithGasPricesAndLimits,
  getApprovalAmount,
  // getDefaultFees,
  // getDefaultGasPrices,
  getTokenAddress,
  getPrefix,
  getFee,
  isApproved,
  strip0x,
  validateAddress,
  MAX_APPROVAL,
} from './utils'

import erc20ABI from './data/erc20.json'
import routerABI from './data/routerABI.json'

export const abi = {
  router: routerABI,
  erc20: erc20ABI,
}
