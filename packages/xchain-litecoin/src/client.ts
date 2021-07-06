import {
  Address,
  Balance,
  BaseXChainClient,
  FeeRate,
  FeeRates,
  Fees,
  FeesWithRates,
  Network,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxType,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { AssetLTC, Chain, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import * as Litecoin from 'bitcoinjs-lib'

import * as sochain from './sochain-api'
import { NodeAuth } from './types'
import { TxIO } from './types/sochain-api-types'
import * as Utils from './utils'

/**
 * LitecoinClient Interface
 */
interface LitecoinClient {
  getFeesWithRates(memo?: string): Promise<FeesWithRates>
  getFeesWithMemo(memo: string): Promise<Fees>
  getFeeRates(): Promise<FeeRates>
}

export type LitecoinClientParams = XChainClientParams & {
  sochainUrl?: string
  nodeUrl?: string
  nodeAuth?: NodeAuth | null
}

/**
 * Custom Litecoin client
 */
class Client extends BaseXChainClient implements LitecoinClient, XChainClient {
  private sochainUrl = ''
  private nodeUrl = ''
  private nodeAuth?: NodeAuth

  /**
   * Constructor
   * Client is initialised with network type
   * Pass strict null as nodeAuth to disable auth for node json rpc
   *
   * @param {LitecoinClientParams} params
   */
  constructor({
    network = Network.Testnet,
    sochainUrl = 'https://sochain.com/api/v2',
    phrase,
    nodeUrl,
    nodeAuth = {
      username: 'thorchain',
      password: 'password',
    },
    rootDerivationPaths = {
      [Network.Mainnet]: `m/84'/2'/0'/0/`,
      [Network.Testnet]: `m/84'/1'/0'/0/`,
    },
  }: LitecoinClientParams) {
    super(Chain.Litecoin, { network, rootDerivationPaths, phrase })
    this.nodeUrl =
      nodeUrl ??
      (() => {
        switch (network) {
          case Network.Mainnet:
            return 'https://ltc.thorchain.info'
          case Network.Testnet:
            return 'https://testnet.ltc.thorchain.info'
        }
      })()

    this.nodeAuth =
      // Leave possibility to send requests without auth info for user
      // by strictly passing nodeAuth as null value
      nodeAuth === null ? undefined : nodeAuth

    this.setSochainUrl(sochainUrl)
  }

  /**
   * Set/Update the sochain url.
   *
   * @param {string} url The new sochain url.
   * @returns {void}
   */
  setSochainUrl(url: string): void {
    this.sochainUrl = url
  }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url based on the network.
   */
  getExplorerUrl(): string {
    switch (this.network) {
      case Network.Mainnet:
        return 'https://ltc.bitaps.com'
      case Network.Testnet:
        return 'https://tltc.bitaps.com'
    }
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/${txID}`
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
  getAddress(index = 0): Address {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (this.phrase) {
      const ltcNetwork = Utils.ltcNetwork(this.network)
      const ltcKeys = this.getLtcKeys(this.phrase, index)

      const { address } = Litecoin.payments.p2wpkh({
        pubkey: ltcKeys.publicKey,
        network: ltcNetwork,
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
   * @throws {"Could not get private key from phrase"} Throws an error if failed creating LTC keys from the given phrase
   * */
  private getLtcKeys(phrase: string, index = 0): Litecoin.ECPairInterface {
    const ltcNetwork = Utils.ltcNetwork(this.network)

    const seed = getSeed(phrase)
    const master = Litecoin.bip32.fromSeed(seed, ltcNetwork).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return Litecoin.ECPair.fromPrivateKey(master.privateKey, { network: ltcNetwork })
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * Get the LTC balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @returns {Balance[]} The LTC balance of the address.
   */
  async getBalance(address: Address): Promise<Balance[]> {
    return Utils.getBalance({
      sochainUrl: this.sochainUrl,
      network: this.network,
      address,
    })
  }

  /**
   * Get transaction history of a given address with pagination options.
   * By default it will return the transaction history of the current wallet.
   *
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    // Sochain API doesn't have pagination parameter
    const offset = params?.offset ?? 0
    const limit = params?.limit || 10
    const response = await sochain.getAddress({
      sochainUrl: this.sochainUrl,
      network: this.network,
      address: `${params?.address}`,
    })
    const total = response.txs.length
    const transactions: Tx[] = []

    const txs = response.txs.filter((_, index) => offset <= index && index < offset + limit)
    for (const txItem of txs) {
      const rawTx = await sochain.getTx({
        sochainUrl: this.sochainUrl,
        network: this.network,
        hash: txItem.txid,
      })
      const tx: Tx = {
        asset: AssetLTC,
        from: rawTx.inputs.map((i: TxIO) => ({
          from: i.address,
          amount: assetToBase(assetAmount(i.value, Utils.LTC_DECIMAL)),
        })),
        to: rawTx.outputs
          // ignore tx with type 'nulldata'
          .filter((i: TxIO) => i.type !== 'nulldata')
          .map((i: TxIO) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, Utils.LTC_DECIMAL)) })),
        date: new Date(rawTx.time * 1000),
        type: TxType.Transfer,
        hash: rawTx.txid,
      }
      transactions.push(tx)
    }

    const result: TxsPage = {
      total,
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
  async getTransactionData(txId: string): Promise<Tx> {
    const rawTx = await sochain.getTx({
      sochainUrl: this.sochainUrl,
      network: this.network,
      hash: txId,
    })
    return {
      asset: AssetLTC,
      from: rawTx.inputs.map((i) => ({
        from: i.address,
        amount: assetToBase(assetAmount(i.value, Utils.LTC_DECIMAL)),
      })),
      to: rawTx.outputs.map((i) => ({ to: i.address, amount: assetToBase(assetAmount(i.value, Utils.LTC_DECIMAL)) })),
      date: new Date(rawTx.time * 1000),
      type: TxType.Transfer,
      hash: rawTx.txid,
    }
  }
  /**
   * Get the rates and fees.
   *
   * @param {string} memo The memo to be used for fee calculation (optional)
   * @returns {FeesWithRates} The fees and rates
   */
  async getFeesWithRates(memo?: string): Promise<FeesWithRates> {
    let rates: FeeRates | undefined = undefined
    try {
      rates = await this.getFeeRatesFromThorchain()
    } catch (error) {
      console.log(error)
      console.warn(`Error pulling rates from thorchain, will try alternate`)
    }
    rates = await this.getFeeRatesFromSoChain()

    const fees: Fees = {
      type: 'byte',
      fast: Utils.calcFee(rates.fast, memo),
      average: Utils.calcFee(rates.average, memo),
      fastest: Utils.calcFee(rates.fastest, memo),
    }

    return { fees, rates }
  }
  private async getFeeRatesFromSoChain(): Promise<FeeRates> {
    const nextBlockFeeRate = await sochain.getSuggestedTxFee()
    const rates: FeeRates = {
      fastest: nextBlockFeeRate * 5,
      fast: nextBlockFeeRate * 1,
      average: nextBlockFeeRate * 0.5,
    }

    return rates
  }

  /**
   * Get the current fees.
   *
   * @returns {Fees} The fees without memo
   */
  async getFees(): Promise<Fees> {
    const { fees } = await this.getFeesWithRates()
    return fees
  }

  /**
   * Get the fees for transactions with memo.
   * If you want to get `Fees` and `FeeRates` at once, use `getFeesAndRates` method
   *
   * @param {string} memo
   * @returns {Fees} The fees with memo
   */
  async getFeesWithMemo(memo: string): Promise<Fees> {
    const { fees } = await this.getFeesWithRates(memo)
    return fees
  }

  /**
   * Get the fee rates for transactions without a memo.
   * If you want to get `Fees` and `FeeRates` at once, use `getFeesAndRates` method
   *
   * @returns {FeeRates} The fee rate
   */
  async getFeeRates(): Promise<FeeRates> {
    const { rates } = await this.getFeesWithRates()
    return rates
  }

  /**
   * Transfer LTC.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const fromAddressIndex = params?.walletIndex || 0
    const feeRate = params.feeRate || (await this.getFeeRates()).fast
    const { psbt } = await Utils.buildTx({
      ...params,
      feeRate,
      sender: this.getAddress(fromAddressIndex),
      sochainUrl: this.sochainUrl,
      network: this.network,
    })
    const ltcKeys = this.getLtcKeys(this.phrase, fromAddressIndex)
    psbt.signAllInputs(ltcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex

    return await Utils.broadcastTx({
      network: this.network,
      txHex,
      nodeUrl: this.nodeUrl,
      auth: this.nodeAuth,
    })
  }
}

export { Client }
