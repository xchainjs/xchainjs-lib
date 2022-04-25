/**
 * keeps an instance to the light wallet module and takes care about the backend communication
 */
import { CoreBridgeClass, ASSET, ASSET_LIST, HavenTransferParams, HavenTransferResponse, index as havenWallet, NETTYPE } from 'haven-core-js'

import { getRandomOuts, getUnspentOuts, keepAlive, login, submitRawTx } from './api'

export class HavenCoreClient {
  private netType: NETTYPE;
  private ownAddress: string;
  private seed: string;


  constructor(seed: string, netType: NETTYPE) {

    this.seed = seed;
    this.netType = netType;

  }

  transfer = async (amount: string, transferAsset: ASSET, toAddress: string, memo?: string): Promise<string> => {
    // define promise function for return value
    let promiseResolve: (txHash: string) => void, promiseReject: (errMessage: string) => void

    const promise: Promise<string> = new Promise(function (resolve, reject) {
      promiseResolve = resolve
      promiseReject = reject
    })

    const sendFundsSucceed = (res: HavenTransferResponse) => {
      promiseResolve(res.tx_hash)
    }

    const sendFundsFailed = (err: string) => {
      promiseReject(err)
    }

    const coreModule = await this.getCoreModule()

    const transferParams: HavenTransferParams = {
      amount,
      from_address_string: this.ownAddress,
      to_address_string: toAddress,
      is_sweeping: false,
      sec_viewKey_string: '',
      sec_spendKey_string: '',
      pub_spendKey_string: '',
      nettype: this.netType,
      memo_string: memo,
      from_asset_string: transferAsset,
      to_asset_string: transferAsset,
      priority: 2,
      unlock_time: 0,
      get_unspent_outs_fn: getUnspentOutsReq,
      get_random_outs_fn: getRandomOutsReq,
      submit_raw_tx_fn: submitRawTxReq,
      status_update_fn: updateStatus,
      error_fn: sendFundsFailed,
      success_fn: sendFundsSucceed,
    }
    coreModule.async__send_funds(transferParams)
    return promise
  }

  private async getCoreModule (): Promise<CoreBridgeClass>  {
    const coreModule = await havenWallet.haven_utils_promise
    return coreModule
  }

  private async getKeys(): Promise<any>  {
    const coreModule = await this.getCoreModule();
    const keys = coreModule.address_and_keys_from_seed(this.seed, this.netType);
  }
}

const updateStatus = (status: any) => {
  console.log(status)
}

const getRandomOutsReq = (reqParams: any, cb:(err: string | null , res: any | null) => {
  getRandomOuts(reqParams: any)
    .then((res) => cb(null, res))
    .catch((err) => cb(err, null))
}

const getUnspentOutsReq = (reqParams, cb) => {
  getUnspentOuts(reqParams)
    .then((res) => cb(null, res))
    .catch((err) => cb(err, null))
}

const submitRawTxReq = (reqParams, cb) => {
  submitRawTx(reqParams)
    .then((res) => cb(null, res))
    .catch((err) => cb(err, null))
}
