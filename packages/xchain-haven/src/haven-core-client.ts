/**
 * keeps an instance to the light wallet module and takes care about the backend communication
 */

import { TxParams } from '@xchainjs/xchain-client/src'
import * as havenWallet from 'haven-core-js'

type coreModulePromise = typeof havenWallet.haven_utils_promise

export const transfer = async (params: TxParams): Promise<string> => {
  // params.
  const module = await getCoreModule()
  //module.async__send_funds()
  return ' '
}

export const getCoreModule = async (): coreModulePromise => {
  const coreModule = await havenWallet.haven_utils_promise
  return coreModule
}

export type TransferFunds = {
  amount: string
  is_sweeping: boolean
  payment_id_string: string
  from_address_string: string
  to_address_string: string
  sec_viewKey_string: string
  sec_spendKey_string: string
  pub_spendKey_string: string
  nettype: string
  memo_string: string
  from_asset_string: string
  priority: number
  unlock_time: number
  get_unspent_outs_fn: (req: any, callBack: (errMessage: string, response: any) => void) => void
  get_random_outs_fn: (req: any, callBack: (errMessage: string, response: any) => void) => void
  submit_raw_tx_fn: (req: any, callBack: (errMessage: string, response: any) => void) => void
  status_update_fn: (params: any) => void
  error_fn: (params: any) => void
  success_fn: (params: any) => void
}
