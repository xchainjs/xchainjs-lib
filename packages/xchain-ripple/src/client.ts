import {
  AssetInfo,
  FeeType,
  Fees,
  Balance,
  Network,
  TxHash,
  BaseXChainClient,
  ExplorerProviders,
  TxParams,
  PreparedTx,
  TxsPage,
  TxHistoryParams,
  Tx,
  TxType,
  FeesWithRates,
  FeeRate,
} from '@xchainjs/xchain-client'
import { baseAmount, Address, eqAsset } from '@xchainjs/xchain-util'
import { Client as XrplClient } from 'xrpl'
import type { Payment } from 'xrpl'

import {
  AssetXRP,
  XRPChain,
  XRP_DECIMAL,
  XRPL_DERIVATION_PATH,
  rippleExplorerProviders,
  getXRPLIdentifierByNetwork,
  getNetworkWssEndpoint,
  XRP_DEFAULT_FEE,
} from './const'
import * as Utils from './utils'
import { SignedTransaction, XRPClientParams, XRPTxParams } from './types'

// Default parameters for the Ripple client
export const defaultXRPParams: XRPClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: rippleExplorerProviders,
  rootDerivationPaths: {
    [Network.Mainnet]: XRPL_DERIVATION_PATH,
    [Network.Testnet]: XRPL_DERIVATION_PATH,
    [Network.Stagenet]: XRPL_DERIVATION_PATH,
  },
}

export abstract class Client extends BaseXChainClient {
  protected explorerProviders: ExplorerProviders
  protected xrplClient: XrplClient

  constructor(params: XRPClientParams = defaultXRPParams) {
    const clientParams = { ...defaultXRPParams, ...params }

    super(XRPChain, clientParams)
    this.explorerProviders = clientParams.explorerProviders

    const xrplIdentifier = getXRPLIdentifierByNetwork(clientParams.network as Network)
    this.xrplClient = new XrplClient(getNetworkWssEndpoint(xrplIdentifier) as string)
  }

  /**
   * Get XRP asset info.
   * @returns {AssetInfo} XRP asset information.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetXRP,
      decimal: XRP_DECIMAL,
    }
    return assetInfo
  }

  /**
   * Get the explorer URL.
   *
   * @returns {string} The explorer URL.
   */
  public getExplorerUrl(): string {
    return this.explorerProviders[this.getNetwork()].getExplorerUrl()
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  public getExplorerAddressUrl(address: Address): string {
    return this.explorerProviders[this.getNetwork()].getExplorerAddressUrl(address)
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  public getExplorerTxUrl(txID: TxHash): string {
    return this.explorerProviders[this.getNetwork()].getExplorerTxUrl(txID)
  }

  /**
   * Validate the given Zcash address.
   * @param {string} address Zcash address to validate (only t-addresses).
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address)
  }

  /**
   * connect xrpl client
   */
  async connectXrplClient() {
    if (!this.xrplClient.isConnected()) {
      await this.xrplClient.connect()
    }
  }

  /**
   * disconnect xrpl client
   */
  async disconnectXrplClient() {
    if (this.xrplClient.isConnected()) {
      await this.xrplClient.disconnect()
    }
  }

  /**
   * get connected xrpl client
   */
  public async getXrplClient() {
    await this.connectXrplClient()
    return this.xrplClient
  }

  /**
   * Retrieves the balance of a given address.
   * @param {Address} address - The address to retrieve the balance for.
   * @param {TokenAsset[]} assets - Assets to retrieve the balance for (optional).
   * @returns {Promise<Balance[]>} An array containing the balance of the address.
   */
  public async getBalance(address: Address): Promise<Balance[]> {
    const xrplClient = await this.getXrplClient()
    const response = await xrplClient
      .request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated',
      })
      .catch((e) => {
        if (e.message === 'Account not found.') return undefined
        throw e
      })

    if (!response) {
      // account is not activated yet
      return []
    }
    const balanceInXRP = response?.result?.account_data?.Balance

    return [
      {
        asset: AssetXRP,
        amount: baseAmount(balanceInXRP, XRP_DECIMAL),
      },
    ]
  }

  /**
   * Get transaction fees.
   * @returns {Fees} The average, fast, and fastest fees.
   */
  public async getFees(): Promise<Fees> {
    const xrplClient = await this.getXrplClient()

    let fee: string
    try {
      const feeResponse = await xrplClient.request({ command: 'fee' })
      fee = feeResponse.result.drops.open_ledger_fee
    } catch (_error) {
      fee = String(XRP_DEFAULT_FEE)
    }

    return {
      average: baseAmount(fee, XRP_DECIMAL),
      fast: baseAmount(fee, XRP_DECIMAL),
      fastest: baseAmount(fee, XRP_DECIMAL),
      type: FeeType.FlatFee,
    }
  }

  /**
   * Check if destination account requires destination tag
   * @param {string} destination - The destination address
   * @returns {Promise<boolean>} True if destination requires tag
   */
  public async requiresDestinationTag(destination: string): Promise<boolean> {
    try {
      const xrplClient = await this.getXrplClient()
      const response = await xrplClient.request({
        command: 'account_info',
        account: destination,
        ledger_index: 'validated',
      })

      const flags = response.result.account_data.Flags
      // lsfRequireDestTag flag is 0x00020000 (bit 17)
      const LSF_REQUIRE_DEST_TAG = 0x00020000
      return (flags & LSF_REQUIRE_DEST_TAG) !== 0
    } catch (error) {
      // If account doesn't exist or we can't check, assume it doesn't require destination tag
      return false
    }
  }

  /**
   * Prepares a transaction for transfer.
   *
   * @param {TxParams & { sender: Address } & XRPTxParams} params - The transfer options.
   * @returns {Promise<PreparedTx>} The raw unsigned transaction.
   */
  public async prepareTxForXrpl({
    sender,
    recipient,
    amount,
    memo,
    destinationTag,
  }: TxParams & { sender: Address } & XRPTxParams): Promise<Payment> {
    const paymentTx: Payment = {
      TransactionType: 'Payment',
      Account: sender,
      Destination: recipient,
      Amount: amount.amount().toString(),
    }

    // Add destination tag if provided
    if (destinationTag !== undefined) {
      if (!Utils.validateDestinationTag(destinationTag)) {
        throw new Error(`Invalid destination tag: ${destinationTag}. Must be an integer between 0 and 4294967295.`)
      }
      paymentTx.DestinationTag = destinationTag
    }

    if (memo && memo.trim() !== '') {
      paymentTx.Memos = [
        {
          Memo: {
            MemoData: Buffer.from(memo, 'utf8').toString('hex'),
          },
        },
      ]
    }

    return paymentTx
  }

  /**
   * Return signed tx
   * @param payment prepared xrp payment tx
   * @param walletIndex wallet index
   * @returns Transaction signed by phrase
   */
  abstract signTransaction(payment: Payment, walletIndex: number): Promise<SignedTransaction>

  /**
   * Transfer XRP
   * @param {TxParams & XRPTxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  public async transfer(params: TxParams & XRPTxParams): Promise<string> {
    if (!eqAsset(params.asset || AssetXRP, AssetXRP)) {
      throw Error(`Asset not supported`)
    }
    const sender = await this.getAddressAsync(params.walletIndex)

    // Check if destination requires destination tag
    const requiresDestTag = await this.requiresDestinationTag(params.recipient)
    if (requiresDestTag && params.destinationTag === undefined) {
      throw new Error(
        `Destination address requires a destination tag but none was provided. The recipient account has the RequireDestTag flag set.`,
      )
    }

    const baseTx = await this.prepareTxForXrpl({ ...params, sender })

    const xrplClient = await this.getXrplClient()
    const prepared: Payment = await xrplClient.autofill(baseTx)
    const signed = await this.signTransaction(prepared, params.walletIndex || 0)

    return await this.broadcastTx(signed.tx_blob)
  }

  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const xrplClient = await this.getXrplClient()
    const address = params?.address || (await this.getAddressAsync())

    const count = params?.limit || 10
    const offset = params?.offset || 0
    const limit = offset + count

    const response = await xrplClient.request({
      command: 'account_tx',
      account: address,
      ledger_index_min: -1,
      ledger_index_max: -1,
      limit,
    })
    const txArray = response.result.transactions

    const nativeAsset = this.getAssetInfo()
    const txs: Tx[] = []

    for (let i = offset; i < limit; i++) {
      const txData = txArray[i]
      const tx = txData.tx_json

      if (tx) {
        if (tx.TransactionType !== 'Payment') continue
        const fromAddress = tx.Account
        const toAddress = tx.Destination
        // @ts-expect-error ignore
        const amountStr: string = txData?.meta?.delivered_amount ?? 0
        const amount = baseAmount(amountStr, XRP_DECIMAL)
        const unixTimestamp = (tx.date as number) + 946684800

        txs.push({
          type: TxType.Transfer,
          hash: txData.hash as string,
          date: new Date(unixTimestamp * 1000),
          asset: nativeAsset.asset,
          from: [
            {
              from: fromAddress,
              amount,
              asset: nativeAsset.asset,
            },
          ],
          to: [
            {
              to: toAddress,
              amount,
              asset: nativeAsset.asset,
            },
          ],
        })
      }
    }

    return {
      total: txs.length,
      txs,
    }
  }

  /**
   * Get the transaction details of a given transaction ID.
   *
   * @param {string} txId The transaction ID.
   * @returns {Tx} The transaction details.
   */
  public async getTransactionData(txId: string): Promise<Tx> {
    const xrplClient = await this.getXrplClient()

    const response = await xrplClient.request({
      command: 'tx',
      transaction: txId,
    })

    const nativeAsset = this.getAssetInfo()

    const tx = response.result
    const fromAddress = tx.tx_json.Account
    const toAddress = tx.tx_json.Destination as string

    // @ts-expect-error ignore
    const amountStr: string = tx?.meta?.delivered_amount ?? 0
    const amount = baseAmount(amountStr, XRP_DECIMAL)
    const unixTimestamp = (tx.tx_json.date as number) + 946684800

    return {
      type: TxType.Transfer,
      hash: tx.hash as string,
      date: new Date(unixTimestamp * 1000),
      asset: nativeAsset.asset,
      from: [
        {
          from: fromAddress,
          amount,
          asset: nativeAsset.asset,
        },
      ],
      to: [
        {
          to: toAddress,
          amount,
          asset: nativeAsset.asset,
        },
      ],
    }
  }

  public async broadcastTx(signedTx: string): Promise<TxHash> {
    const xrplClient = await this.getXrplClient()

    const { result } = await xrplClient.submitAndWait(signedTx)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const txResult = (result.meta as any)?.TransactionResult
    if (txResult !== 'tesSUCCESS') {
      throw new Error(`XRP transaction failed with code: ${txResult}`)
    }

    return result.hash
  }

  public async prepareTx(_: TxParams & { sender: Address }): Promise<PreparedTx> {
    throw new Error('Error: raw tx string not supported, use prepareTxForXrpl to get Payment tx_json to submit')
  }

  async getFeesWithRates(): Promise<FeesWithRates> {
    throw Error('Error: Ripple has flat fee. Fee rates not supported')
  }

  async getFeeRates(): Promise<FeeRate> {
    throw Error('Error: Ripple has flat fee. Fee rates not supported')
  }
}
