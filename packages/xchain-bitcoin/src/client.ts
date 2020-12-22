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
import { baseAmount, AssetBTC, BaseAmount } from '@xchainjs/xchain-util'
import { FeesWithRates, FeeRate, FeeRates } from './types/client-types'
import { TxIO } from './types/blockchair-api-types'
import { UTXOs } from './types/common'

// https://blockchair.com/api/docs#link_300
// const baseUrl = 'https://api.blockchair.com/bitcoin/'
// const pathAddress = 'dashboards/address/'
// const pathTx = 'raw/transaction/'

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
 * Implements Client declared above
 */
class Client implements BitcoinClient, XChainClient {
  net: Network
  phrase = ''
  utxos: UTXOs
  nodeUrl = ''
  nodeApiKey = ''

  // Client is initialised with network type
  constructor({ network = 'testnet', nodeUrl = '', nodeApiKey = '', phrase }: BitcoinClientParams) {
    this.net = network
    this.setNodeURL(nodeUrl)
    this.setNodeAPIKey(nodeApiKey)
    phrase && this.setPhrase(phrase)
    this.utxos = []
  }

  setNodeURL = (url: string): void => {
    this.nodeUrl = url
  }

  setNodeAPIKey(key: string): void {
    this.nodeApiKey = key
  }

  // Sets this.phrase to be accessed later
  setPhrase = (phrase: string): Address => {
    if (validatePhrase(phrase)) {
      this.phrase = phrase
      const address = this.getAddress()
      return address
    } else {
      throw new Error('Invalid BIP39 phrase')
    }
  }

  purgeClient = (): void => {
    this.phrase = ''
    this.utxos = []
  }

  // update network
  setNetwork = (_net: Network): void => {
    this.net = _net
  }

  // Will return the desired network
  getNetwork = (): Network => {
    return this.net
  }

  derivePath(): string {
    const { testnet, mainnet } = Utils.getDerivePath()
    return Utils.isTestnet(this.net) ? testnet : mainnet
  }

  getExplorerUrl = (): string => {
    const networkPath = Utils.isTestnet(this.net) ? '/testnet' : ''
    return `https://blockstream.info${networkPath}`
  }

  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/address/${address}`
  }
  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  // Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
  // The address is then decoded into type P2WPKH and returned.
  getAddress = (): Address => {
    if (this.phrase) {
      const btcNetwork = Utils.btcNetwork(this.net)
      const btcKeys = this.getBtcKeys(this.phrase)

      const { address } = Bitcoin.payments.p2wpkh({
        pubkey: btcKeys.publicKey,
        network: btcNetwork,
      })
      if (!address) {
        throw new Error('address not defined')
      }
      return address
    }
    throw new Error('Phrase not set')
  }

  // Private function to get keyPair from the this.phrase
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

  // Will return true/false
  validateAddress = (address: string): boolean => Utils.validateAddress(address, this.net)

  // Returns balance of address
  getBalance = async (address?: string): Promise<Balance[]> => {
    try {
      return Utils.getBalance(address || this.getAddress(), this.nodeUrl, this.nodeApiKey)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  // Get transaction for the address
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
   * Calculates fees based on fee rate and memo
   */
  private calcFee = (feeRate: FeeRate, memo?: string): BaseAmount => {
    if (memo) {
      const OP_RETURN = Utils.compileMemo(memo)
      const vaultFee = Utils.getVaultFee(this.utxos, OP_RETURN, feeRate)
      return baseAmount(vaultFee)
    }
    const normalFee = Utils.getNormalFee(this.utxos, feeRate)
    return baseAmount(normalFee)
  }

  /**
   * Returns rates and fees
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
      fast: this.calcFee(rates.fast, memo),
      average: this.calcFee(rates.average, memo),
      fastest: this.calcFee(rates.fastest, memo),
    }

    return { fees, rates }
  }

  /**
   * Returns fees for transactions w/o a memo
   * Note: If you want to get `Fees` and `FeeRates` at once, use `getFeesAndRates` method
   */
  getFees = async (): Promise<Fees> => {
    try {
      const { fees } = await this.getFeesWithRates()
      return fees
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getDefaultFees = (): Fees => {
    const rates: FeeRates = {
      fastest: 50,
      fast: 20,
      average: 10,
    }

    return {
      type: 'byte',
      fast: this.calcFee(rates.fast),
      average: this.calcFee(rates.average),
      fastest: this.calcFee(rates.fastest),
    }
  }

  /**
   * Returns fees for transactions w/ a memo
   * Note: If you want to get `Fees` and `FeeRates` at once, use `getFeesAndRates` method
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
   * Returns fee rates for transactions w/ a memo
   * Note: If you want to get `Fees` and `FeeRates` at once, use `getFeesAndRates` method
   */
  getFeeRates = async (): Promise<FeeRates> => {
    try {
      const { rates } = await this.getFeesWithRates()
      return rates
    } catch (error) {
      return Promise.reject(error)
    }
  }

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
