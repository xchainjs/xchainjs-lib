import * as BIP39 from 'bip39'
import * as Bitcoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib
import * as WIF from 'wif' // https://github.com/bitcoinjs/wif
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
import * as xchainCrypto from '@xchainjs/xchain-crypto'
import { baseAmount, assetToString, AssetBTC, BaseAmount } from '@xchainjs/xchain-util'
import { FeesWithRates, FeeRate, FeeRates } from './types/client-types'

// https://blockchair.com/api/docs#link_300
// const baseUrl = 'https://api.blockchair.com/bitcoin/'
// const pathAddress = 'dashboards/address/'
// const pathTx = 'raw/transaction/'

/**
 * BitcoinClient Interface
 */
interface BitcoinClient {
  validateAddress(address: string): boolean
  getFeesWithRates(memo?: string): Promise<FeesWithRates>
  getFeesWithMemo(memo: string): Promise<Fees>
  getFeeRates(): Promise<FeeRates>
  scanUTXOs(): Promise<void>
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
  utxos: Utils.UTXO[]
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

  setNodeURL(url: string): void {
    this.nodeUrl = url
  }

  setNodeAPIKey(key: string): void {
    this.nodeApiKey = key
  }

  generatePhrase = (): string => {
    return xchainCrypto.generatePhrase()
  }

  // Sets this.phrase to be accessed later
  setPhrase = (phrase: string): Address => {
    if (xchainCrypto.validatePhrase(phrase)) {
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
  setNetwork(_net: Network): void {
    this.net = _net
  }

  // Will return the desired network
  getNetwork(): Network {
    return this.net
  }

  getExplorerUrl(): string {
    const networkPath = this.net === 'testnet' ? '/testnet' : ''
    return `https://blockstream.info${networkPath}`
  }

  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/address/${address}`
  }
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  // Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
  // The address is then decoded into type P2WPKH and returned.
  getAddress = (): Address => {
    if (this.phrase) {
      const network = this.getNetwork()
      const btcNetwork = network === 'testnet' ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
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
  private getBtcKeys(_phrase: string): Bitcoin.ECPairInterface {
    const network = this.getNetwork() == 'testnet' ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    const seed = BIP39.mnemonicToSeedSync(_phrase)
    const wif = WIF.encode(network.wif, seed, true)
    // TODO (@junkai121) Use `xchainCrypto.getSeed` while fixing it https://github.com/xchainjs/xchainjs-lib/issues/88
    // const seed = xchainCrypto.getSeed(_phrase)
    return Bitcoin.ECPair.fromWIF(wif, network)
  }

  // Will return true/false
  validateAddress = (address: string): boolean => {
    const network = this.getNetwork() == 'testnet' ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    try {
      Bitcoin.address.toOutputScript(address, network)
      return true
    } catch (error) {
      return false
    }
  }

  // Scans UTXOs on Address
  scanUTXOs = async (): Promise<void> => {
    try {
      const address = this.getAddress()
      const dashboardsAddress = await blockChair.getAddress(this.nodeUrl, address, this.nodeApiKey)

      this.utxos = [] // clear existing utxos
      const utxos = dashboardsAddress[address].utxo

      for (let i = 0; i < utxos.length; i++) {
        const txHash = utxos[i].transaction_hash
        const value = utxos[i].value
        const index = utxos[i].index
        const txData = await blockChair.getRawTx(this.nodeUrl, txHash, this.nodeApiKey)
        const script = txData[txHash].decoded_raw_transaction.vout[index].scriptPubKey.hex
        // TODO: check scriptpubkey_type is op_return

        const witness = {
          value: value,
          script: Buffer.from(script, 'hex'),
        }

        const utxoObject = {
          hash: txHash,
          index: index,
          witnessUtxo: witness,
        }
        this.utxos.push(utxoObject)
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  // Returns balance of address
  getBalance = async (address?: string): Promise<Balance[]> => {
    if (!address) {
      address = this.getAddress()
    }

    try {
      // const chain = this.net === 'testnet' ? 'bitcoin/testnet' : 'bitcoin'
      const dashboardAddress = await blockChair.getAddress(this.nodeUrl, address, this.nodeApiKey)
      return [
        {
          asset: AssetBTC,
          amount: baseAmount(dashboardAddress[address].address.balance),
        },
      ]
    } catch (error) {
      return Promise.reject(new Error('Invalid address'))
    }
  }

  // Given a desired output, return change
  private getChange = async (valueOut: number): Promise<number> => {
    const balances = await this.getBalance()
    const btcBalance = balances.find((balance) => assetToString(balance.asset) === assetToString(AssetBTC))
    let change = 0

    if (btcBalance && btcBalance.amount.amount().minus(valueOut).isGreaterThan(Utils.dustThreshold)) {
      change = btcBalance.amount.amount().minus(valueOut).toNumber()
    }
    return change
  }

  // Get transaction for the address
  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const address = params?.address ?? this.getAddress()
    const limit = params?.limit ?? 10
    const offset = params?.offset ?? 0

    let totalCount = 0
    const transactions: Tx[] = []
    try {
      //Calling getAddress without limit/offset to get total count
      const dAddr = await blockChair.getAddress(this.nodeUrl, address, this.nodeApiKey)
      totalCount = dAddr[address].transactions.length

      const dashboardAddress = await blockChair.getAddress(this.nodeUrl, address, this.nodeApiKey, limit, offset)
      const txList = dashboardAddress[address].transactions

      for (const hash of txList) {
        const rawTx = (await blockChair.getTx(this.nodeUrl, hash, this.nodeApiKey))[hash]
        const tx: Tx = {
          asset: AssetBTC,
          from: rawTx.inputs.map((i) => ({ from: i.recipient, amount: baseAmount(i.value, 8) })),
          to: rawTx.outputs.map((i) => ({ to: i.recipient, amount: baseAmount(i.value, 8) })),
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
    await this.scanUTXOs()
    if (this.utxos.length === 0) {
      throw new Error('No utxos to send')
    }

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

  transfer = async ({
    asset = AssetBTC,
    amount,
    recipient,
    memo,
    feeRate,
  }: TxParams & { feeRate: FeeRate }): Promise<TxHash> => {
    await this.scanUTXOs()
    const balance = await this.getBalance()
    const btcBalance = balance.find((balance) => balance.asset.symbol === asset.symbol)
    if (!btcBalance) {
      throw new Error('No btcBalance found')
    }
    if (this.utxos.length === 0) {
      throw new Error('No utxos to send')
    }
    if (!this.validateAddress(recipient)) {
      throw new Error('Invalid address')
    }
    const network = this.getNetwork() == 'testnet' ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    const btcKeys = this.getBtcKeys(this.phrase)
    const feeRateWhole = Number(feeRate.toFixed(0))
    const compiledMemo = memo ? Utils.compileMemo(memo) : null
    const fee = compiledMemo
      ? Utils.getVaultFee(this.utxos, compiledMemo, feeRateWhole)
      : Utils.getNormalFee(this.utxos, feeRateWhole)
    if (amount.amount().plus(fee).isGreaterThan(btcBalance.amount.amount())) {
      throw new Error('Balance insufficient for transaction')
    }
    const psbt = new Bitcoin.Psbt({ network: network }) // Network-specific
    //Inputs
    this.utxos.forEach((UTXO) =>
      psbt.addInput({
        hash: UTXO.hash,
        index: UTXO.index,
        witnessUtxo: UTXO.witnessUtxo,
      }),
    )
    // Outputs
    psbt.addOutput({ address: recipient, value: amount.amount().toNumber() }) // Add output {address, value}
    const change = await this.getChange(amount.amount().toNumber() + fee)
    if (change > 0) {
      psbt.addOutput({ address: this.getAddress(), value: change }) // Add change
    }
    if (compiledMemo) {
      // if memo exists
      psbt.addOutput({ script: compiledMemo, value: 0 }) // Add OP_RETURN {script, value}
    }
    psbt.signAllInputs(btcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex
    return await blockChair.broadcastTx(this.nodeUrl, txHex, this.nodeApiKey)
  }
}

export { Client, Network }
