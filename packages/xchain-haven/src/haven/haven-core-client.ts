/**
 * keeps an instance to the light wallet module and takes care about the backend communication
 */

import type {
  HavenTicker,
  HavenTransferParams,
  HavenTransferResponse,
  KeysFromMnemonic,
  MyMoneroCoreBridgeClass,
  SerializedTransaction,
} from 'haven-core-js'
import * as havenWallet from 'haven-core-js'

import { getAddressInfo, getAddressTxs, getRandomOuts, getUnspentOuts, submitRawTx } from './api'
import { HavenBalance, NetTypes } from './types'

export class HavenCoreClient {
  private netTypeId: number
  private seed: string
  constructor(seed: string, netType: string | number) {
    this.netTypeId = typeof netType === 'number' ? netType : (NetTypes[netType as keyof typeof NetTypes] as number)
    this.seed = seed
    //this.netTypeId = netType
  }

  init(): Promise<boolean> {}

  async getBalance(): Promise<HavenBalance> {
    const coreModule = await this.getCoreModule()
    const keys = await this.getKeys()
    const { sec_viewKey_string, address_string, pub_spendKey_string, sec_spendKey_string } = keys

    const rawAddressData = await getAddressInfo(address_string, sec_viewKey_string)

    const serializedData = havenWallet.api_response_parser_utils.Parsed_AddressInfo__sync__keyImageManaged(
      rawAddressData,
      address_string,
      sec_viewKey_string,
      pub_spendKey_string,
      sec_spendKey_string,
      coreModule,
    )

    const havenBalance: HavenBalance = {} as HavenBalance

    const { total_received_String, total_sent_String, total_received_unlocked_String } = serializedData

    Object.keys(serializedData.total_received_String).forEach((assetType) => {
      const balance = havenWallet
        .JSBigInt(total_received_String[assetType as HavenTicker])
        .subtract(havenWallet.JSBigInt(total_sent_String[assetType as HavenTicker]))

      const unlockedBalance = havenWallet
        .JSBigInt(total_received_unlocked_String[assetType as HavenTicker])
        .subtract(havenWallet.JSBigInt(total_sent_String[assetType as HavenTicker]))

      const lockedBalance = balance.subtract(unlockedBalance)

      havenBalance[assetType as HavenTicker] = {
        balance: balance.toString(),
        lockedBalance: lockedBalance.toString(),
        unlockedBalance: unlockedBalance.toString(),
      }
    })

    return havenBalance
  }

  async transfer(amount: string, transferAsset: HavenTicker, toAddress: string, memo?: string): Promise<string> {
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
    const keys = await this.getKeys()

    const transferParams: HavenTransferParams = {
      amount,
      from_address_string: 'keys',
      to_address_string: toAddress,
      is_sweeping: false,
      sec_viewKey_string: keys.sec_viewKey_string,
      sec_spendKey_string: keys.sec_spendKey_string,
      pub_spendKey_string: keys.pub_spendKey_string,
      nettype: this.netTypeId,
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

  async getTransactions(): Promise<SerializedTransaction[]> {
    const coreModule = await this.getCoreModule()
    const keys = await this.getKeys()
    const { sec_viewKey_string, address_string, pub_spendKey_string, sec_spendKey_string } = keys
    const rawTransactionData = await getAddressTxs(address_string, sec_viewKey_string)
    const serializedData = havenWallet.api_response_parser_utils.Parsed_AddressTransactions__sync__keyImageManaged(
      rawTransactionData,
      address_string,
      sec_viewKey_string,
      pub_spendKey_string,
      sec_spendKey_string,
      coreModule,
    )

    return serializedData.serialized_transactions
  }

  private async getCoreModule(): Promise<MyMoneroCoreBridgeClass> {
    const coreModule = await havenWallet.haven_utils_promise
    return coreModule
  }

  private async getKeys(): Promise<KeysFromMnemonic> {
    const coreModule = await this.getCoreModule()
    const keys = await coreModule.seed_and_keys_from_mnemonic(this.seed, this.netTypeId)
    return keys
  }
}

const updateStatus = (status: any) => {
  console.log(status)
}

const getRandomOutsReq = (reqParams: any, cb: (err: any, res: any) => void) => {
  getRandomOuts(reqParams)
    .then((res) => cb(null, res))
    .catch((err) => cb(err, null))
}

const getUnspentOutsReq = (reqParams: any, cb: (err: any, res: any) => void) => {
  getUnspentOuts(reqParams)
    .then((res) => cb(null, res))
    .catch((err) => cb(err, null))
}

const submitRawTxReq = (reqParams: any, cb: (err: any, res: any) => void) => {
  submitRawTx(reqParams)
    .then((res) => cb(null, res))
    .catch((err) => cb(err, null))
}
