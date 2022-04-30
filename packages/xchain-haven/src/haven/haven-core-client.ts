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

import {
  getAddressInfo,
  getAddressTxs,
  getRandomOuts,
  getUnspentOuts,
  keepAlive,
  login,
  setAPI_URL,
  submitRawTx,
} from './api'
import { HavenBalance, NetTypes, SyncStats } from './types'

function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(`Expected 'val' to be defined, but received ${val}`)
  }
}

const TestNetApiUrl = 'http://142.93.249.35:1984'
const MainnetApiUrl = ''

export class HavenCoreClient {
  private netTypeId: number | undefined
  private seed: string | undefined
  private scannedHeight = 0
  private blockHeight = 0
  private pingServerIntervalID: ReturnType<typeof setInterval> | undefined
  private coreModule: MyMoneroCoreBridgeClass | undefined

  async init(seed: string, netType: string | number): Promise<boolean> {
    //this.netTypeId = netTypePromise<boolean> {
    // login and fire up keep_alive
    this.purgeClient()

    this.netTypeId = typeof netType === 'number' ? netType : (NetTypes[netType as keyof typeof NetTypes] as number)
    this.seed = seed
    const apiUrl = this.netTypeId === NetTypes.mainnet ? MainnetApiUrl : TestNetApiUrl
    setAPI_URL(apiUrl)

    const keys = await this.getKeys()
    await login(keys.address_string, keys.sec_viewKey_string, true)
    const addressInfoResponse = await getAddressInfo(keys.address_string, keys.sec_viewKey_string)

    this.scannedHeight = addressInfoResponse.scanned_block_height
    this.blockHeight = addressInfoResponse.blockchain_height

    this.pingServerIntervalID = setInterval(this.pingServer, 60 * 1000)

    return true
  }

  purgeClient() {
    this.netTypeId = undefined
    this.seed = undefined
    this.scannedHeight = 0
    this.blockHeight = 0
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    clearInterval(this.pingServerIntervalID)
  }

  async getAddress(): Promise<string> {
    const keys = await this.getKeys()
    return keys.address_string
  }

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

  async transfer(amount: string, transferAsset: HavenTicker, toAddress: string): Promise<string> {
    console.log(amount, transferAsset, toAddress)
    // define promise function for return value
    assertIsDefined<number | undefined>(this.netTypeId)
    let promiseResolve: (txHash: string) => void, promiseReject: (errMessage: string) => void

    const promise: Promise<string> = new Promise(function (resolve, reject) {
      promiseResolve = resolve
      promiseReject = reject
    })

    const sendFundsSucceed = (res: HavenTransferResponse) => {
      promiseResolve(res.tx_hash)
    }

    const sendFundsFailed = (err: string) => {
      console.log(err)
      promiseReject(err)
    }

    const coreModule = await this.getCoreModule()
    const keys = await this.getKeys()

    const transferParams: HavenTransferParams = {
      sending_amount: amount,
      from_address_string: keys.address_string,
      to_address_string: toAddress,
      is_sweeping: false,
      payment_id_string: '',
      sec_viewKey_string: keys.sec_viewKey_string,
      sec_spendKey_string: keys.sec_spendKey_string,
      pub_spendKey_string: keys.pub_spendKey_string,
      nettype: this.netTypeId,
      from_asset_type: transferAsset,
      to_asset_type: transferAsset,
      priority: '1',
      unlock_time: 0,
      blockchain_height: this.blockHeight,
      get_unspent_outs_fn: getUnspentOutsReq,
      get_random_outs_fn: getRandomOutsReq,
      submit_raw_tx_fn: submitRawTxReq,
      status_update_fn: updateStatus,
      error_fn: sendFundsFailed,
      success_fn: sendFundsSucceed,
    }
    console.log(transferParams)
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

  getSyncStats(): SyncStats {
    return { blockHeight: this.blockHeight, scannedHeight: this.scannedHeight }
  }

  private async getCoreModule(): Promise<MyMoneroCoreBridgeClass> {
    if (!this.coreModule) {
      this.coreModule = await havenWallet.haven_utils_promise
    }
    return this.coreModule
  }

  private async getKeys(): Promise<KeysFromMnemonic> {
    assertIsDefined<string | undefined>(this.seed)
    assertIsDefined<number | undefined>(this.netTypeId)
    const coreModule = await this.getCoreModule()
    const keys = coreModule.seed_and_keys_from_mnemonic(this.seed, this.netTypeId)
    return keys
  }
  private async pingServer(): Promise<void> {
    const keys = await this.getKeys()

    keepAlive(keys.address_string, keys.sec_viewKey_string)
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
