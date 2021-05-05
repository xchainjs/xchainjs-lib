import * as Bitcoin from 'bitcoinjs-lib'
import * as Utils from './utils'
import * as sochain from './sochain-api'
import {
  RootDerivationPaths,
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
import { AssetBTC, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { FeesWithRates, FeeRate, FeeRates } from './types/client-types'

/**
 * BitcoinClient Interface
 */
interface BitcoinClient {
  // derivePath(): string
  getFeesWithRates(memo?: string): Promise<FeesWithRates>
  getFeesWithMemo(memo: string): Promise<Fees>
  getFeeRates(): Promise<FeeRates>
}

type BitcoinClientParams = XChainClientParams & {
  sochainUrl?: string
  blockstreamUrl?: string
}

/**
 * Custom Bitcoin client
 */
class Client implements BitcoinClient, XChainClient {
  private net: Network
  private phrase = ''
  private sochainUrl = ''
  private blockstreamUrl = ''
  private rootDerivationPaths: RootDerivationPaths

  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {BitcoinClientParams} params
   */
  constructor({
    network = 'testnet',
    sochainUrl = 'https://sochain.com/api/v2',
    blockstreamUrl = 'https://blockstream.info',
    rootDerivationPaths = {
      mainnet: `m/44'/84'/0'/0'/0/`,
      testnet: `m/44'/84'/1'/0'/0/`,
    },
    phrase,
  }: BitcoinClientParams) {
    this.net = network
    this.rootDerivationPaths = this.fixRootPAths(rootDerivationPaths)
    this.setSochainUrl(sochainUrl)
    this.setBlockstreamUrl(blockstreamUrl)
    phrase && this.setPhrase(phrase)
  }

  fixRootPAths(rootDerivationPaths: RootDerivationPaths) {
    // for some reason the librarydoesn like the m/44' prefix, so if anyone passes that in we strip it
    return {
      mainnet: rootDerivationPaths.mainnet.replace("m/44'/", ''),
      testnet: rootDerivationPaths.testnet.replace("m/44'/", ''),
    }
  }
  // /**
  //  * Get the default sochain url.
  //  *
  //  * @returns {string} the default sochain url
  //  */
  // getDefaultSochainUrl = (): string => {
  //   return 'https://sochain.com/api/v2'
  // }

  /**
   * Set/Update the sochain url.
   *
   * @param {string} url The new sochain url.
   * @returns {void}
   */
  setSochainUrl = (url: string): void => {
    this.sochainUrl = url
  }

  // /**
  //  * Get the default blockstream url.
  //  *
  //  * @returns {string} the default blockstream url
  //  */
  // getDefaultBlockstreamUrl = (): string => {
  //   return 'https://blockstream.info'
  // }

  /**
   * Set/Update the blockstream url.
   *
   * @param {string} url The new blockstream url.
   * @returns {void}
   */
  setBlockstreamUrl = (url: string): void => {
    this.blockstreamUrl = url
  }

  /**
   * Set/update a new phrase.
   *
   * @param {string} phrase A new phrase.
   * @returns {Address} The first address from the given phrase
   *
   * @throws {"Invalid phrase"}
   * Thrown if the given phase is invalid.
   */
  setPhrase = (phrase: string): Address => {
    if (validatePhrase(phrase)) {
      this.phrase = phrase
      return this.getAddress(0)
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
    }
    this.net = net
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
   * Get getFullDerivationPath
   *
   * @param {number} index the HD wallet index
   * @returns {string} The bitcoin derivation path based on the network.
   */
  getFullDerivationPath(index: number): string {
    // for some reason the bitcoinjs lib doesnt like the full path

    return this.rootDerivationPaths[this.net] + `${index}`
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
  getAddress = (index = 0): Address => {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (this.phrase) {
      const btcNetwork = Utils.btcNetwork(this.net)
      const btcKeys = this.getBtcKeys(this.phrase, index)

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
  private getBtcKeys = (phrase: string, index = 0): Bitcoin.ECPairInterface => {
    const btcNetwork = Utils.btcNetwork(this.net)

    const seed = getSeed(phrase)
    const master = Bitcoin.bip32.fromSeed(seed, btcNetwork).derivePath(this.getFullDerivationPath(index))

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
   * @param {number} index By default, it will return the balance of the 0th address
   * @returns {Array<Balance>} The BTC balance of the address.
   */
  getBalance = async (index = 0): Promise<Balance[]> => {
    try {
      const address: Address = this.getAddress(index)
      return Utils.getBalance({
        sochainUrl: this.sochainUrl,
        network: this.net,
        address: address,
      })
    } catch (e) {
      return Promise.reject(e)
    }
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    // Sochain API doesn't have pagination parameter
    const offset = params?.offset ?? 0
    const limit = params?.limit || 10

    try {
      const address = typeof params?.address === 'number' ? this.getAddress(params.address) : params?.address + ''

      const response = await sochain.getAddress({
        sochainUrl: this.sochainUrl,
        network: this.net,
        address,
      })
      const total = response.txs.length
      const transactions: Tx[] = []

      const txs = response.txs.filter((_, index) => offset <= index && index < offset + limit)
      for (const txItem of txs) {
        const rawTx = await sochain.getTx({
          sochainUrl: this.sochainUrl,
          network: this.net,
          hash: txItem.txid,
        })
        const tx: Tx = {
          asset: AssetBTC,
          from: rawTx.inputs.map((i) => ({
            from: i.address,
            amount: assetToBase(assetAmount(i.value, Utils.BTC_DECIMAL)),
          })),
          to: rawTx.outputs
            .filter((i) => i.type !== 'nulldata')
            .map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, Utils.BTC_DECIMAL)) })),
          date: new Date(rawTx.time * 1000),
          type: 'transfer',
          hash: rawTx.txid,
        }
        transactions.push(tx)
      }

      const result: TxsPage = {
        total,
        txs: transactions,
      }
      return result
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const rawTx = await sochain.getTx({
        sochainUrl: this.sochainUrl,
        network: this.net,
        hash: txId,
      })
      return {
        asset: AssetBTC,
        from: rawTx.inputs.map((i) => ({
          from: i.address,
          amount: assetToBase(assetAmount(i.value, Utils.BTC_DECIMAL)),
        })),
        to: rawTx.outputs.map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, Utils.BTC_DECIMAL)) })),
        date: new Date(rawTx.time * 1000),
        type: 'transfer',
        hash: rawTx.txid,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Get the rates and fees.
   *
   * @param {string} memo The memo to be used for fee calculation (optional)
   * @returns {FeesWithRates} The fees and rates
   */
  getFeesWithRates = async (memo?: string): Promise<FeesWithRates> => {
    const txFee = await sochain.getSuggestedTxFee()
    const rates: FeeRates = {
      fastest: txFee * 5,
      fast: txFee * 1,
      average: txFee * 0.5,
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
  transfer = async (params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> => {
    try {
      const fromAddressIndex = params?.from || 0

      // set the default fee rate to `fast`
      const feeRate = params.feeRate || (await this.getFeeRates()).fast
      const { psbt } = await Utils.buildTx({
        ...params,
        feeRate,
        sender: this.getAddress(fromAddressIndex),
        sochainUrl: this.sochainUrl,
        network: this.net,
      })

      const btcKeys = this.getBtcKeys(this.phrase, fromAddressIndex)
      psbt.signAllInputs(btcKeys) // Sign all inputs
      psbt.finalizeAllInputs() // Finalise inputs
      const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

      return await Utils.broadcastTx({ network: this.net, txHex, blockstreamUrl: this.blockstreamUrl })
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

export { Client, Network }
