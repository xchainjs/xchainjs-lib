/**
 * keeps an instance to the light wallet module and takes care about the backend communication
 */

import type {
  FeeEstimationParams,
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
  getTx,
  getUnspentOuts,
  get_version,
  keepAlive,
  login,
  setAPI_URL,
  setCredentials,
  submitRawTx,
} from './api'
import { SyncHandler } from './sync-handler'
import { HavenBalance, NetTypes, SyncObserver, SyncStats } from './types'
import { assertIsDefined } from './utils'

const TestNetApiUrl = 'http://142.93.249.35:1984'
const MainnetApiUrl = ''

export class HavenCoreClient {
  private syncHandler: SyncHandler
  private netTypeId: number | undefined
  private seed: string | undefined
  private blockHeight = 0
  private pingServerIntervalID: ReturnType<typeof setInterval> | undefined
  private coreModule: MyMoneroCoreBridgeClass | undefined
  private base_fee: number | undefined
  private fork_version: number | undefined

  /**
   * static function to create a new wallet without initalizing any backend communication,
   * the returned mnemonic can be used to init the wallet
   * @param netType
   * @returns mnemonic
   */
  static async createWallet(netType: string | number): Promise<string> {
    const netTypeId = typeof netType === 'number' ? netType : (NetTypes[netType as keyof typeof NetTypes] as number)
    const module = await havenWallet.haven_utils_promise
    const keys = module.newly_created_wallet('en', netTypeId)
    return keys.mnemonic_string
  }

  constructor() {
    this.syncHandler = new SyncHandler()
  }

  async init(seed: string, netType: string | number): Promise<boolean> {
    //this.netTypeId = netTypePromise<boolean> {
    // login and fire up keep_alive
    this.purge()

    this.netTypeId = typeof netType === 'number' ? netType : (NetTypes[netType as keyof typeof NetTypes] as number)
    this.seed = seed
    const apiUrl = this.netTypeId === NetTypes.mainnet ? MainnetApiUrl : TestNetApiUrl
    setAPI_URL(apiUrl)
    const keys = this.getKeys()

    setCredentials(keys.address_string, keys.sec_viewKey_string)

    await login(true)

    this.pingServerIntervalID = setInterval(() => this.pingServer(), 60 * 1000)

    return true
  }

  purge() {
    this.netTypeId = undefined
    this.seed = undefined
    this.syncHandler.purge()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    clearInterval(this.pingServerIntervalID)
  }

  getAddress(): string {
    const keys = this.getKeys()
    return keys.address_string
  }

  validateAddress(address: string): boolean {
    const module = this.getCoreModule()
    let response: string | Record<string, unknown>
    try {
      response = module.decode_address(address, this.netTypeId!)
    } catch (e) {
      return false
    }
    return response.hasOwnProperty('spend')
  }

  subscribeSyncProgress = async (observer: SyncObserver): Promise<void> =>
    this.syncHandler.subscribeSyncProgress(observer)
  getSyncState = async (): Promise<SyncStats> => this.syncHandler.getSyncState()
  isSyncing = async (): Promise<boolean> => this.syncHandler.isSyncing()

  async getBalance(): Promise<HavenBalance> {
    const coreModule = this.getCoreModule()
    const keys = this.getKeys()
    const { sec_viewKey_string, address_string, pub_spendKey_string, sec_spendKey_string } = keys

    const rawAddressData = await getAddressInfo()

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

  async estimateFees(priority: number): Promise<string> {
    const coreModule = this.getCoreModule()

    if (this.base_fee === undefined || this.fork_version === undefined) {
      const version = await get_version()
      this.fork_version = version.fork_version as number
      this.base_fee = version.per_byte_fee as number
    }

    const feeParams: FeeEstimationParams = {
      use_per_byte_fee: true,
      use_rct: true,
      n_inputs: 2,
      mixin: 10,
      n_outputs: 2,
      extra_size: 0,
      bulletproof: true,
      base_fee: this.base_fee,
      fee_quantization_mask: 10000,
      priority,
      fork_version: this.fork_version,
      clsag: true,
    }
    const fees = coreModule.estimate_fee(feeParams)
    return fees
  }

  async transfer(amount: string, transferAsset: HavenTicker, toAddress: string, memo = ''): Promise<string> {
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
      promiseReject(err)
    }

    const coreModule = this.getCoreModule()
    const keys = this.getKeys()

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
      memo_string: memo,
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
    try {
      coreModule.async__send_funds(transferParams)
    } catch (e) {
      throw 'tx rejected'
    }
    return promise
  }

  async getTransactions(): Promise<SerializedTransaction[]> {
    const coreModule = this.getCoreModule()
    const keys = this.getKeys()
    const { sec_viewKey_string, address_string, pub_spendKey_string, sec_spendKey_string } = keys
    const rawTransactionData = await getAddressTxs()
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

  async getTx(hash: string): Promise<SerializedTransaction> {
    const coreModule = this.getCoreModule()
    const keys = this.getKeys()
    const { sec_viewKey_string, address_string, pub_spendKey_string, sec_spendKey_string } = keys

    const rawTx = await getTx(hash)
    const rawTransactionData = {
      transactions: [rawTx],
    }

    const serializedData = havenWallet.api_response_parser_utils.Parsed_AddressTransactions__sync__keyImageManaged(
      rawTransactionData,
      address_string,
      sec_viewKey_string,
      pub_spendKey_string,
      sec_spendKey_string,
      coreModule,
    )

    return serializedData.serialized_transactions[0]
  }

  async preloadModule(): Promise<void> {
    this.coreModule = await havenWallet.haven_utils_promise
    return
  }

  private getCoreModule(): MyMoneroCoreBridgeClass {
    assertIsDefined(this.coreModule)
    return this.coreModule
  }

  private getKeys(): KeysFromMnemonic {
    assertIsDefined<string | undefined>(this.seed)
    assertIsDefined<number | undefined>(this.netTypeId)
    const coreModule = this.getCoreModule()
    const keys = coreModule.seed_and_keys_from_mnemonic(this.seed, this.netTypeId)
    return keys
  }

  private pingServer(): void {
    keepAlive()
  }
}

/**
 * callback functions for sending transfers procedure, used by haven-core-client.ts
 */

const updateStatus = (_status: any) => {
  //console.log(status)
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
