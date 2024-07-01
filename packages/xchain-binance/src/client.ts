// Import necessary modules and types from external packages and files
import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import * as crypto from '@binance-chain/javascript-sdk/lib/crypto'
import { SignedSend } from '@binance-chain/javascript-sdk/lib/types'
import {
  AssetInfo,
  BaseXChainClient,
  FeeType,
  Fees,
  Network,
  PreparedTx,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
  singleFee,
} from '@xchainjs/xchain-client'
import {
  Address,
  Asset,
  BaseAmount,
  TokenAsset,
  assetAmount,
  assetFromString,
  assetToBase,
  assetToString,
  baseAmount,
  baseToAsset,
} from '@xchainjs/xchain-util'
import axios from 'axios'
// Import constants, types, and utility functions from local files
import { AssetBNB, BNBChain, BNB_DECIMAL } from './const'
import {
  Account,
  Balance,
  BinanceBalance,
  Fees as BinanceFees,
  TransactionResult,
  TransferFee,
  TxPage as BinanceTxPage,
} from './types'
import { getPrefix, isAccount, isTransferFee, parseTx } from './utils'
// Define a type for private key
type PrivKey = string
// Define types for coins and multi-transfers
export type Coin = {
  asset: Asset
  amount: BaseAmount
}
// Define parameters for multi transfer
export type MultiTransfer = {
  to: Address
  coins: Coin[]
}
// Define parameters for multi-send transactions
export type MultiSendParams = {
  walletIndex?: number
  transactions: MultiTransfer[]
  memo?: string
}

/**
 * Interface for custom Binance client
 */
export interface BinanceClient {
  purgeClient(): void
  getBncClient(): BncClient

  getAccount(address?: Address, index?: number): Promise<Account>

  getMultiSendFees(): Promise<Fees>
  getSingleAndMultiFees(): Promise<{ single: Fees; multi: Fees }>

  multiSend(params: MultiSendParams): Promise<TxHash>
}

/**
 * Custom Binance client
 */
class Client extends BaseXChainClient implements BinanceClient, XChainClient {
  private bncClient: BncClient

  /**
   * Constructor
   * Client has to be initialised with network type and phrase.
   * It will throw an error if an invalid phrase has been passed.
   * @param {XChainClientParams} params
   * @throws {"Invalid phrase"} Thrown if the given phase is invalid.
   */
  constructor({
    network = Network.Mainnet,
    phrase,
    rootDerivationPaths = {
      [Network.Mainnet]: "44'/714'/0'/0/",
      [Network.Stagenet]: "44'/714'/0'/0/",
      [Network.Testnet]: "44'/714'/0'/0/",
    },
  }: XChainClientParams) {
    super(BNBChain, { network, rootDerivationPaths, phrase })
    this.bncClient = new BncClient(this.getClientUrl())
    this.bncClient.chooseNetwork(this.getNetwork() === Network.Testnet ? Network.Testnet : Network.Mainnet)
  }

  /**
   * Get the BncClient interface.
   * @returns {BncClient} The BncClient from `@binance-chain/javascript-sdk`.
   */
  getBncClient(): BncClient {
    return this.bncClient
  }

  /**
   * Set/update the current network.
   * @param {Network} network
   * @returns {void}
   *
   * @throws {"Network must be provided"}
   * Thrown if network has not been set before.
   */
  setNetwork(network: Network): void {
    super.setNetwork(network)
    this.bncClient = new BncClient(this.getClientUrl())
    this.bncClient.chooseNetwork(this.getNetwork() === Network.Testnet ? Network.Testnet : Network.Mainnet)
  }

  /**
   * Get the client URL based on the network.
   * @returns {string} The client URL for binance chain based on the network.
   */
  private getClientUrl(): string {
    switch (this.getNetwork()) {
      case Network.Mainnet:
      case Network.Stagenet:
        return 'https://dex.binance.org'
      case Network.Testnet:
        return 'https://testnet-dex.binance.org'
    }
  }

  /**
   * Get the explorer URL based on the network.
   *
   * @returns {string} The explorer URL based on the network.
   */
  getExplorerUrl(): string {
    switch (this.getNetwork()) {
      case Network.Mainnet:
      case Network.Stagenet:
        return 'https://explorer.binance.org'
      case Network.Testnet:
        return 'https://testnet-explorer.binance.org'
    }
  }

  /**
   * Get the explorer URL for a given address based on the network.
   * @param {Address} address The address to generate the explorer URL for.
   * @returns {string} The explorer URL for the given address.
   */
  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  /**
   * Get the explorer URL for a given transaction ID based on the network.
   * @param {string} txID The transaction ID to generate the explorer URL for.
   * @returns {string} The explorer URL for the given transaction ID.
   */
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  /**
   * @private
   * Get the private key for a given account index.
   * @param {number} index The account index for the derivation path.
   * @returns {PrivKey} The private key generated from the given phrase.
   * @throws {"Phrase not set"} Thrown if the phrase has not been set befor
   * Throws an error if phrase has not been set before
   * */
  private getPrivateKey(index: number): PrivKey {
    if (!this.phrase) throw new Error('Phrase not set')
    return crypto.getPrivateKeyFromMnemonic(this.phrase, true, index)
  }

  /**
   * Get the address for a given account index.
   * @deprecated Use getAddressAsync instead.
   */
  getAddress(index = 0): string {
    return crypto.getAddressFromPrivateKey(this.getPrivateKey(index), getPrefix(this.network))
  }

  /**
   * Get the current address asynchronously for a given account index.
   * @param {number} index The account index for the derivation path. (optional)
   * @returns {Address} A promise resolving to the current address.
   * @throws {Error} Thrown if the phrase has not been set before.
   * A phrase is needed to create a wallet and to derive an address from it.
   */
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   *  Validate the given address.
   * @param {Address} address The address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  validateAddress(address: Address): boolean {
    return this.bncClient.checkAddress(address, getPrefix(this.network))
  }
  /**
   * Get asset information.
   * @returns Asset information.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetBNB,
      decimal: BNB_DECIMAL,
    }
    return assetInfo
  }

  /**
   * Get account data for a given address.
   * @param {Address} address The address to get account data for. (optional)
   * By default, it will return account data for the current wallet.
   * @param {number} index The account index for the derivation path. (optional)
   * @returns {Account} A promise resolving to the account details of the given address.
   */
  async getAccount(address?: Address, index = 0): Promise<Account> {
    const accountAddress = address || (await this.getAddressAsync(index))
    const response = await this.bncClient.getAccount(accountAddress)
    if (!response || !response.result || !isAccount(response.result))
      return Promise.reject(Error(`Could not get account data for address ${accountAddress}`))

    return response.result
  }

  /**
   * Get the balance of a given address.
   * @param {Address} address The address to get the balance for. (optional)
   * By default, it will return the balance of the current wallet.
   * @param {(Asset | TokenAsset)[]} asset If not set, it will return all assets available. (optional)
   * @returns {Balance[]} The balance of the address.
   */
  async getBalance(address: Address, assets?: (Asset | TokenAsset)[]): Promise<Balance[]> {
    const balances: BinanceBalance[] = await this.bncClient.getBalance(address)

    return balances
      .map((balance) => {
        return {
          asset: (assetFromString(`${BNBChain}.${balance.symbol}`) as Asset | TokenAsset) || AssetBNB,
          amount: assetToBase(assetAmount(balance.free, 8)),
        }
      })
      .filter(
        (balance) => !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
      )
  }

  /**
   * @private
   * Search transactions with parameters.
   * @returns {Params} The parameters to be used for transaction search.
   */
  private async searchTransactions(params?: { [x: string]: string | undefined }): Promise<TxsPage> {
    // Construct the URL for transaction search
    const clientUrl = `${this.getClientUrl()}/api/v1/transactions`
    const url = new URL(clientUrl)
    // Set default time range for transaction search
    const endTime = Date.now()
    const diffTime = 90 * 24 * 60 * 60 * 1000
    url.searchParams.set('endTime', endTime.toString())
    url.searchParams.set('startTime', (endTime - diffTime).toString())
    // Set additional parameters if provided
    for (const key in params) {
      const value = params[key]
      if (value) {
        url.searchParams.set(key, value)
        // Adjust time range if only one time boundary is provided
        if (key === 'startTime' && !params['endTime']) {
          url.searchParams.set('endTime', (parseInt(value) + diffTime).toString())
        }
        if (key === 'endTime' && !params['startTime']) {
          url.searchParams.set('startTime', (parseInt(value) - diffTime).toString())
        }
      }
    }
    // Fetch transaction history from the server
    const txHistory = (await axios.get<BinanceTxPage>(url.toString())).data

    return {
      total: txHistory.total,
      txs: txHistory.tx.map(parseTx).filter(Boolean) as Tx[],
    }
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    return await this.searchTransactions({
      address: params && params.address,
      limit: params && params.limit?.toString(),
      offset: params && params.offset?.toString(),
      startTime: params && params.startTime && params.startTime.getTime().toString(),
      txAsset: params && params.asset,
    })
  }

  /**
   * Get the transaction details of a given transaction id.
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    // Fetch transaction data from the server
    const txResult: TransactionResult = (await axios.get(`${this.getClientUrl()}/api/v1/tx/${txId}?format=json`)).data
    const blockHeight = txResult.height

    let address = ''
    const msgs = txResult.tx.value.msg
    if (msgs.length) {
      const msg = msgs[0].value as SignedSend
      if (msg.inputs && msg.inputs.length) {
        address = msg.inputs[0].address
      } else if (msg.outputs && msg.outputs.length) {
        address = msg.outputs[0].address
      }
    }
    // Search for the transaction in the transaction history
    const txHistory = await this.searchTransactions({ address, blockHeight })
    const [transaction] = txHistory.txs.filter((tx) => tx.hash === txId)

    if (!transaction) {
      throw new Error('transaction not found')
    }

    return transaction
  }

  /**
   * Broadcast multi-send transaction.
   * @param {MultiSendParams} params The multi-send transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async multiSend({ walletIndex = 0, transactions, memo = '' }: MultiSendParams): Promise<TxHash> {
    // Get the derived address using the wallet index
    const derivedAddress = this.getAddress(walletIndex)
    // Execute the multi-send transaction
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey(walletIndex))

    const transferResult = await this.bncClient.multiSend(
      derivedAddress,
      transactions.map((transaction) => {
        return {
          to: transaction.to,
          coins: transaction.coins.map((coin) => {
            return {
              denom: coin.asset.symbol,
              amount: baseToAsset(coin.amount).amount().toString(),
            }
          }),
        }
      }),
      memo,
    )
    // Extract and return the transaction hash
    return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
  }

  /**
   * Transfer balances.
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer({ walletIndex, asset, amount, recipient, memo }: TxParams): Promise<TxHash> {
    // Initialize the Binance client and set the private key
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey(walletIndex || 0))
    // Execute the transfer transaction
    const transferResult = await this.bncClient.transfer(
      await this.getAddressAsync(walletIndex),
      recipient,
      baseToAsset(amount).amount().toString(),
      asset ? asset.symbol : AssetBNB.symbol,
      memo,
    )
    // Extract and return the transaction hash
    return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
  }
  /**
   * Broadcast a raw transaction.
   * @param {string} txHex The hexadecimal representation of the raw transaction.
   * @returns {string} The result of broadcasting the transaction.
   */
  async broadcastTx(txHex: string): Promise<string> {
    const tx = await this.bncClient.sendRawTransaction(txHex)
    return tx.result
  }

  /**
   * Get the current transfer fee.
   * @returns {TransferFee} The current transfer fee.
   */
  private async getTransferFee(): Promise<TransferFee> {
    // Fetch transfer fees from the Binance API
    const feesArray = (await axios.get<BinanceFees>(`${this.getClientUrl()}/api/v1/fees`)).data
    // Find and return the transfer fee
    const [transferFee] = feesArray.filter(isTransferFee)
    if (!transferFee) throw new Error('failed to get transfer fees')

    return transferFee
  }

  /**
   * Get the current fee.
   * If the fee rate cannot be obtained from Thorchain, it falls back to fetching transfer fees from the Binance API.
   *
   * @returns {Fees} The current fee.
   */
  async getFees(): Promise<Fees> {
    let singleTxFee: BaseAmount | undefined = undefined
    // Attempt to fetch fee rate from Thorchain
    try {
      singleTxFee = baseAmount(await this.getFeeRateFromThorchain())
    } catch (error) {
      console.log(error)
      console.warn(`Error pulling rates from thorchain, will try alternate`)
    }
    // If fee rate is not available from Thorchain, fetch transfer fees from the Binance API
    if (!singleTxFee) {
      const transferFee = await this.getTransferFee()
      singleTxFee = baseAmount(transferFee.fixed_fee_params.fee)
    }
    // Return the fee
    return singleFee(FeeType.FlatFee, singleTxFee)
  }

  /**
   * Get the current fee for multi-send transaction.
   * @returns {Fees} The current fee for multi-send transaction.
   */
  async getMultiSendFees(): Promise<Fees> {
    // Fetch transfer fees from the Binance API
    const transferFee = await this.getTransferFee()
    const multiTxFee = baseAmount(transferFee.multi_transfer_fee)
    // Return the fee object
    return {
      type: 'base' as FeeType,
      average: multiTxFee,
      fast: multiTxFee,
      fastest: multiTxFee,
    } as Fees
  }

  /**
   * Get the current fee for both single and multi-send transaction.
   *
   * @returns {SingleAndMultiFees} The current fee for both single and multi-send transaction.
   */
  async getSingleAndMultiFees(): Promise<{ single: Fees; multi: Fees }> {
    // Fetch transfer fees from the Binance API
    const transferFee = await this.getTransferFee()
    const singleTxFee = baseAmount(transferFee.fixed_fee_params.fee)
    const multiTxFee = baseAmount(transferFee.multi_transfer_fee)
    // Return the fee objects for both single and multi-send transactions
    return {
      single: {
        type: 'base' as FeeType,
        fast: singleTxFee,
        fastest: singleTxFee,
        average: singleTxFee,
      } as Fees,
      multi: {
        type: 'base' as FeeType,
        average: multiTxFee,
        fast: multiTxFee,
        fastest: multiTxFee,
      } as Fees,
    }
  }

  /**
   * Prepare transfer.
   * Currently not supported for Binance chain.
   * @param {TxParams&Address} params The transfer options.
   * @returns {PreparedTx} The unsigned transaction data.
   */
  async prepareTx(): Promise<PreparedTx> {
    throw Error(' Function not suported for BNB chain')
  }
}

export { Client }
