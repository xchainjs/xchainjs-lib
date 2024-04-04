// Exporting types and the client class
import { KeystoreClient } from './KeystoreClient'
import erc20ABI from './data/erc20.json'
import routerABI from './data/routerABI.json'

export default KeystoreClient

export * from './types'

export { KeystoreClient, KeystoreClient as Client } from './KeystoreClient'
export { LedgerClient } from './LedgerClient'

// Exporting utility functions
export {
  call, // Function to call a contract
  estimateApprove, // Function to estimate approval transaction
  estimateCall, // Function to estimate contract function call
  getApprovalAmount, // Function to calculate the approval amount
  getTokenAddress, // Function to get the address of a token
  getPrefix, // Function to get the address prefix
  getFee, // Function to calculate the fee
  isApproved, // Function to check if an amount is approved
  strip0x, // Function to remove '0x' prefix from a string
  validateAddress, // Function to validate an address
  MAX_APPROVAL, // Constant for maximum approval amount
} from './utils'

// Exporting ABI objects
export const abi = {
  router: routerABI, // Router ABI
  erc20: erc20ABI, // ERC20 ABI
}
