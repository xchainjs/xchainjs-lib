import { ClientKeystore } from './clients/clientKeystore'
import erc20ABI from './data/erc20.json'
import routerABI from './data/routerABI.json'

export {
  ClientLedger,
  ClientKeystore,
  ClientKeystore as Client,
  type EVMKeystoreClientParams,
  type EVMClientParams,
} from './clients'
export default ClientKeystore

export * from './types'

export { KeystoreSigner, type KeystoreSignerParams, LedgerSigner, type LedgerSignerParams } from './signers'

export {
  call,
  estimateApprove,
  estimateCall,
  getAllowance,
  getApprovalAmount,
  getTokenAddress,
  getPrefix,
  getFee,
  isApproved,
  strip0x,
  validateAddress,
  MAX_APPROVAL,
} from './utils'

export const abi = {
  router: routerABI,
  erc20: erc20ABI,
}
