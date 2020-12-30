import * as Bitcoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib
import * as Utils from './utils'
import * as blockChair from './blockchair-api'
import {
  TxHistoryParams,
  TxsPage,
  Address,
  XChainClient,
  Tx,
  TxParams,
  TxHash,
  Balance,
  Network,
  Fees,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { validatePhrase, getSeed } from '@xchainjs/xchain-crypto'
import { baseAmount, AssetBTC } from '@xchainjs/xchain-util'
import { FeesWithRates, FeeRate, FeeRates } from './types/client-types'
import { TxIO } from './types/blockchair-api-types'

/**
 * BitcoinClient Interface
 */
interface BitcoinClient {
  derivePath(): string
  getFeesWithRates(memo?: string): Promise<FeesWithRates>
  getFeesWithMemo(memo: string): Promise<Fees>
  getFeeRates(): Promise<FeeRates>
}

type BitcoinClientParams = XChainClientParams & {
  nodeUrl?: string
  nodeApiKey?: string
}

/**
 * Custom Bitcoin client
 */
class Client implements BitcoinClient, XChainClient {
  private net: Network
  private phrase = ''
  private nodeUrl = ''
  private nodeApiKey = ''

  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {BitcoinClientParams} params
   */
  constructor({ network = 'testnet', nodeUrl = '', nodeApiKey = '', phrase }: BitcoinClientParams) {
    this.net = network
    this.setNodeURL(nodeUrl)
    this.setNodeAPIKey(nodeApiKey)
    phrase && this.setPhrase(phrase)
  }

  /**
   * Set/Update the node url.
   *
   * @param {string} url The new node url.
   * @returns {void}
   */
  setNodeURL = (url: string): void => {
    this.nodeUrl = url
  }

  /**
   * Set/Update the node api key.
   *
   * @param {string} key The new node api key.
   * @returns {void}
   */
  setNodeAPIKey(key: string): void {
    this.nodeApiKey = key
  }

  /**
   * Set/update a new phrase.
   *
   * @param {string} phrase A new phrase.
   * @returns {Address} The address from the given phrase
   *
   * @throws {"Invalid phrase"}
   * Thrown if the given phase is invalid.
   */
  setPhrase = (phrase: string): Address => {
    if (validatePhrase(phrase)) {
      this.phrase = phrase
      const address = this.getAddress()
      return address
    } else {
      throw new Error('Invalid phrase')
    }
  }

  /**
   * Purge client.
   *
   * @returns {void}
   */
  purgeClient = (): void => {
    this.phrase = ''
  }

  /**
   * Set/update the current network.
   *
   * @param {Network} network `mainnet` or `testnet`.
   * @returns {void}
   *
   * @throws {"Network must be provided"}
   * Thrown if network has not been set before.
   */
  setNetwork = (net: Network): void => {
    if (!net) {
      throw new Error('Network must be provided')
    } else {
      this.net = net
    }
  }

  /**
   * Get the current network.
   *
   * @returns {Network} The current network. (`mainnet` or `testnet`)
   */
  getNetwork = (): Network => {
    return this.net
  }

  /**
   * Get DerivePath
   *
   * @returns {string} The bitcoin derivation path based on the network.
   */
  derivePath(): string {
    const { testnet, mainnet } = Utils.getDerivePath()
    return Utils.isTestnet(this.net) ? testnet : mainnet
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url based on the network.
   */
  getExplorerUrl = (): string => {
    const networkPath = Utils.isTestnet(this.net) ? '/testnet' : ''
    return `https://blockstream.info${networkPath}`
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  /**
   * Get the current address.
   *
   * Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
   * The address is then decoded into type P2WPKH and returned.
   *
   * @returns {Address} The current address.
   *
   * @throws {"Phrase must be provided"} Thrown if phrase has not been set before.
   * @throws {"Address not defined"} Thrown if failed creating account from phrase.
   */
  getAddress = (): Address => {
    if (this.phrase) {
      const btcNetwork = Utils.btcNetwork(this.net)
      const btcKeys = this.getBtcKeys(this.phrase)

      const { address } = Bitcoin.payments.p2wpkh({
        pubkey: btcKeys.publicKey,
        network: btcNetwork,
      })
      if (!address) {
        throw new Error('Address not defined')
      }
      return address
    }
    throw new Error('Phrase must be provided')
  }

  /**
   * @private
   * Get private key.
   *
   * Private function to get keyPair from the this.phrase
   *
   * @param {string} phrase The phrase to be used for generating privkey
   * @returns {ECPairInterface} The privkey generated from the given phrase
   *
   * @throws {"Could not get private key from phrase"} Throws an error if failed creating BTC keys from the given phrase
   * */
  private getBtcKeys = (phrase: string): Bitcoin.ECPairInterface => {
    const btcNetwork = Utils.btcNetwork(this.net)
    const derive_path = this.derivePath()

    const seed = getSeed(phrase)
    const master = Bitcoin.bip32.fromSeed(seed, btcNetwork).derivePath(derive_path)

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return Bitcoin.ECPair.fromPrivateKey(master.privateKey, { network: btcNetwork })
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress = (address: string): boolean => Utils.validateAddress(address, this.net)

  /**
   * Get the BTC balance of a given address.
   *
   * @param {Address} address (optional) By default, it will return the balance of the current wallet.
   * @returns {Array<Balance>} The BTC balance of the address.
   */
  getBalance = async (address?: string): Promise<Balance[]> => {
    try {
      return Utils.getBalance(address || this.getAddress(), this.nodeUrl, this.nodeApiKey)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params (optional) The options to get transaction history.
   * @returns {TxsPage} The transaction history.
   */
  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const limit = params?.limit ?? 10
    const offset = params?.offset ?? 0

    let totalCount = 0
    const transactions: Tx[] = []
    try {
      const address = params?.address ?? this.getAddress()
      //Calling getAddress without limit/offset to get total count
      const dAddr = await blockChair.getAddress(this.nodeUrl, address, this.nodeApiKey)
      totalCount = dAddr[address].transactions.length

      const dashboardAddress = await blockChair.getAddress(this.nodeUrl, address, this.nodeApiKey, limit, offset)
      const txList = dashboardAddress[address].transactions

      for (const hash of txList) {
        const rawTx = (await blockChair.getTx(this.nodeUrl, hash, this.nodeApiKey))[hash]
        const tx: Tx = {
          asset: AssetBTC,
          from: rawTx.inputs.map((i: TxIO) => ({ from: i.recipient, amount: baseAmount(i.value, 8) })),
          to: rawTx.outputs
            // ignore tx with type 'nulldata'
            .filter((i: TxIO) => i.type !== 'nulldata')
            .map((i: TxIO) => ({ to: i.recipient, amount: baseAmount(i.value, 8) })),
          date: new Date(`${rawTx.transaction.time} UTC`), //blockchair api doesn't append UTC so need to put that manually
          type: 'transfer',
          hash: rawTx.transaction.hash,
        }
        transactions.push(tx)
      }
    } catch (error) {
      return Promise.reject(error)
    }

    const result: TxsPage = {
      total: totalCount,
      txs: transactions,
    }
    return result
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const rawTx = (await blockChair.getTx(this.nodeUrl, txId, this.nodeApiKey))[txId]
      return {
        asset: AssetBTC,
        from: rawTx.inputs.map((i) => ({ from: i.recipient, amount: baseAmount(i.value, 8) })),
        to: rawTx.outputs.map((i) => ({ to: i.recipient, amount: baseAmount(i.value, 8) })),
        date: new Date(`${rawTx.transaction.time} UTC`), //blockchair api doesn't append UTC so need to put that manually
        type: 'transfer',
        hash: rawTx.transaction.hash,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the rates and fees.
   *
   * @param {string} memo (optional) The memo to be used for fee calculation
   * @returns {FeesWithRates} The fees and rates
   */
  getFeesWithRates = async (memo?: string): Promise<FeesWithRates> => {
    const btcStats = await blockChair.bitcoinStats(this.nodeUrl, this.nodeApiKey)
    const nextBlockFeeRate = btcStats.suggested_transaction_fee_per_byte_sat
    const rates: FeeRates = {
      fastest: nextBlockFeeRate * 5,
      fast: nextBlockFeeRate * 1,
      average: nextBlockFeeRate * 0.5,
    }

    const fees: Fees = {
      type: 'byte',
      fast: Utils.calcFee(rates.fast, memo),
      average: Utils.calcFee(rates.average, memo),
      fastest: Utils.calcFee(rates.fastest, memo),
    }

    return { fees, rates }
  }

  /**
   * Get the current fees.
   *
   * @returns {Fees} The fees without memo
   */
  getFees = async (): Promise<Fees> => {
    try {
      const { fees } = await this.getFeesWithRates()
      return fees
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the fees for transactions with memo.
   * If you want to get `Fees` and `FeeRates` at once, use `getFeesAndRates` method
   *
   * @param {string} memo
   * @returns {Fees} The fees with memo
   */
  getFeesWithMemo = async (memo: string): Promise<Fees> => {
    try {
      const { fees } = await this.getFeesWithRates(memo)
      return fees
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the fee rates for transactions without a memo.
   * If you want to get `Fees` and `FeeRates` at once, use `getFeesAndRates` method
   *
   * @returns {FeeRates} The fee rate
   */
  getFeeRates = async (): Promise<FeeRates> => {
    try {
      const { rates } = await this.getFeesWithRates()
      return rates
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Transfer BTC.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  transfer = async (params: TxParams & { feeRate: FeeRate }): Promise<TxHash> => {
    try {
      const { psbt } = await Utils.buildTx({
        ...params,
        sender: this.getAddress(),
        nodeUrl: this.nodeUrl,
        nodeApiKey: this.nodeApiKey,
        network: this.net,
      })
      const btcKeys = this.getBtcKeys(this.phrase)
      psbt.signAllInputs(btcKeys) // Sign all inputs
      psbt.finalizeAllInputs() // Finalise inputs
      const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

      return await Utils.broadcastTx({ txHex, nodeUrl: this.nodeUrl, nodeApiKey: this.nodeApiKey })
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

export { Client, Network }
