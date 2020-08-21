import * as BIP39 from 'bip39' // https://github.com/bitcoinjs/bip39
import * as Bitcoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib
import * as WIF from 'wif' // https://github.com/bitcoinjs/wif
import moment from 'moment'
import * as Utils from './utils'
import {
  getAddressTxs,
  getAddressUtxos,
  getTxInfo,
  getAddressInfo,
  getFeeEstimates,
  getBlocks,
  broadcastTx,
} from './electrs-api'
import { Estimates, Txs, Blocks, Address } from './types/electrs-api-types'
import { FeeOptions } from './types/client-types'

// https://blockchair.com/api/docs#link_300
// const baseUrl = 'https://api.blockchair.com/bitcoin/'
// const pathAddress = 'dashboards/address/'
// const pathTx = 'raw/transaction/'

/**
 * Class variables accessed across functions
 */

enum Network {
  TEST = 'testnet',
  MAIN = 'mainnet',
}

/**
 * BitcoinClient Interface. Potentially to become AsgardClient
 */
interface BitcoinClient {
  generatePhrase(): string
  setPhrase(phrase?: string): void
  validatePhrase(phrase: string): boolean
  purgeClient(): void
  setNetwork(net: Network): void
  getNetwork(net: Network): Bitcoin.networks.Network
  setBaseUrl(endpoint: string): void
  getAddress(): string
  validateAddress(address: string): boolean
  scanUTXOs(): Promise<void>
  getBalance(): number
  getBalanceForAddress(address?: string): Promise<number>
  getTransactions(address: string): Promise<Txs>
  getBlockTime(): Promise<number>
  getTxWeight(addressTo: string, memo?: string): Promise<number>
  calcFees(addressTo: string, memo?: string): Promise<object>
  vaultTx(addressVault: string, valueOut: number, memo: string, feeRate: number): Promise<string>
  normalTx(addressTo: string, valueOut: number, feeRate: number): Promise<string>
}

/**
 * Implements Client declared above
 */
class Client implements BitcoinClient {
  net: Network
  phrase = ''
  electrsAPI = ''
  utxos: Utils.UTXO[]

  // Client is initialised with network type
  constructor(_net: Network = Network.TEST, _electrsAPI = '', _phrase?: string) {
    this.net = _net
    _phrase && this.setPhrase(_phrase)
    _electrsAPI && this.setBaseUrl(_electrsAPI)
    this.utxos = []
  }

  generatePhrase = (): string => {
    return BIP39.generateMnemonic()
  }

  // Sets this.phrase to be accessed later
  setPhrase = (phrase?: string) => {
    if (phrase) {
      if (BIP39.validateMnemonic(phrase)) {
        this.phrase = phrase
      } else {
        throw new Error('Invalid BIP39 phrase')
      }
    }
  }

  validatePhrase(phrase: string): boolean {
    if (phrase) {
      return BIP39.validateMnemonic(phrase)
    } else {
      return false
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
  getNetwork(net: Network): Bitcoin.networks.Network {
    if (net === Network.TEST) {
      return Bitcoin.networks.testnet
    } else {
      return Bitcoin.networks.bitcoin
    }
  }

  setBaseUrl(endpoint: string): void {
    this.electrsAPI = endpoint
  }

  // Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
  // The address is then decoded into type P2WPKH and returned.
  getAddress = (): string => {
    if (this.phrase) {
      const network = this.getNetwork(this.net)
      const btcKeys = this.getBtcKeys(this.net, this.phrase)
      const { address } = Bitcoin.payments.p2wpkh({
        pubkey: btcKeys.publicKey,
        network: network,
      })
      if (!address) {
        throw new Error('address not defined')
      }
      return address
    }
    throw new Error('Phrase not set')
  }

  // Private function to get keyPair from the this.phrase
  private getBtcKeys(_net: Network, _phrase: string): Bitcoin.ECPairInterface {
    const network = this.getNetwork(_net)
    const buffer = BIP39.mnemonicToSeedSync(_phrase)
    const wif = WIF.encode(network.wif, buffer, true)
    return Bitcoin.ECPair.fromWIF(wif, network)
  }

  // Will return true/false
  validateAddress = (address: string): boolean => {
    const network = this.getNetwork(this.net)
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
      const utxos = await getAddressUtxos(this.electrsAPI, address)

      for (let i = 0; i < utxos.length; i++) {
        const txHash = utxos[i].txid
        const value = utxos[i].value
        const index = utxos[i].vout
        const txData = await getTxInfo(this.electrsAPI, txHash)
        const script = txData.vout[index].scriptpubkey
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

  // Returns balance of all UTXOs
  getBalance = (): number => {
    if (this.utxos && this.utxos.length > 0) {
      const reducer = (accumulator: number, currentValue: number) => accumulator + currentValue
      const sumBalance = this.utxos.map((e) => e.witnessUtxo.value).reduce(reducer)
      return sumBalance
    } else {
      return 0
    }
  }

  getBalanceForAddress = async (address: string): Promise<number> => {
    const addressInfo: Address = await getAddressInfo(this.electrsAPI, address)
    return addressInfo.chain_stats.funded_txo_sum - addressInfo.chain_stats.spent_txo_sum
  }

  // Given a desired output, return change
  private getChange = (valueOut: number): number => {
    const balance = this.getBalance()
    let change = 0
    if (balance > 0) {
      if (balance - valueOut > Utils.dustThreshold) {
        change = balance - valueOut
      }
    }
    return change
  }

  getTransactions = async (address: string): Promise<Txs> => {
    let transactions = []
    try {
      transactions = await getAddressTxs(this.electrsAPI, address)
    } catch (error) {
      return Promise.reject(error)
    }
    return transactions
  }

  getBlockTime = async (): Promise<number> => {
    const blocks: Blocks = await getBlocks(this.electrsAPI)
    const times: Array<number> = []
    blocks.forEach((block, index: number) => {
      if (index !== 0) {
        const block1PublishTime = moment.unix(blocks[index - 1].timestamp)
        const block2PublishTime = moment.unix(block.timestamp)
        times.push(block1PublishTime.diff(block2PublishTime, 'seconds'))
      }
    })
    const avgBlockPublishTime = Utils.arrayAverage(times)
    return avgBlockPublishTime
  }

  getTxWeight = async (addressTo: string, memo?: string): Promise<number> => {
    const network = this.getNetwork(this.net)
    const btcKeys = this.getBtcKeys(this.net, this.phrase)
    const balance = this.getBalance()
    const balancePlaceholder = balance - Utils.dustThreshold - 1
    const psbt = new Bitcoin.Psbt({ network: network }) // Network-specific
    this.utxos.forEach((UTXO) =>
      psbt.addInput({
        hash: UTXO.hash,
        index: UTXO.index,
        witnessUtxo: UTXO.witnessUtxo,
      }),
    )
    psbt.addOutput({ address: addressTo, value: balancePlaceholder }) // Add output
    psbt.addOutput({ address: this.getAddress(), value: 1 }) // change output
    if (memo) {
      const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
      const OP_RETURN = Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
      psbt.addOutput({ script: OP_RETURN, value: 0 }) // Add OP_RETURN {script, value}
    }
    psbt.signAllInputs(btcKeys) // Sign all inputs
    const tx = psbt.finalizeAllInputs().extractTransaction() // Finalise inputs, extract tx
    const inputs = this.utxos.length // Add weight for each input sig
    return tx.virtualSize() + inputs
  }

  // returns an object of the fee rate, estimated fee, and estimatedTxTime for getting a transaction in to the x'th blocks
  // eg. { ..., '3': { 'feeRate': 87.882, 'estimatedFee': 4231, 'estimatedTxTime': 1820 }, ... }
  // = getting a tx into one of the next 3 blocks would require a feerate >= 87.882 sat/byte,
  // for a total of 4231 sats in fees and take approximately 1820 seconds to confirm
  // contains calculated fees for getting into next 1-10 blocks
  calcFees = async (addressTo: string, memo?: string): Promise<FeeOptions> => {
    if (this.utxos.length === 0) {
      throw new Error('No utxos to send')
    }
    const calcdFees: FeeOptions = {}
    const avgBlockPublishTime = await this.getBlockTime()
    let feeRates: Estimates = await getFeeEstimates(this.electrsAPI)
    // remove estimates for >10 next blocks
    const string1to10 = Array.from({ length: 10 }, (_v, i) => `${i + 1}`)
    feeRates = Utils.filterByKeys(feeRates, string1to10)
    const txWeight = await this.getTxWeight(addressTo, memo)
    Object.keys(feeRates).forEach((key) => {
      calcdFees[key] = {
        feeRate: feeRates[key],
        estimatedFee: txWeight * feeRates[key],
        estimatedTxTime: Number(key) * avgBlockPublishTime,
      }
    })
    return calcdFees
  }

  // Generates a valid transaction hex to broadcast
  vaultTx = async (addressVault: string, valueOut: number, memo: string, feeRate: number): Promise<string> => {
    if (this.utxos.length === 0) {
      throw new Error('No utxos to send')
    }
    const balance = this.getBalance()
    const network = this.getNetwork(this.net)
    const btcKeys = this.getBtcKeys(this.net, this.phrase)
    const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
    const OP_RETURN = Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
    const txWeight = await this.getTxWeight(addressVault, memo)
    const fee = txWeight * feeRate
    if (fee + valueOut > balance) {
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
    psbt.addOutput({ address: addressVault, value: valueOut }) // Add output {address, value}
    const change = this.getChange(valueOut + fee)
    if (change > 0) {
      psbt.addOutput({ address: this.getAddress(), value: change }) // Add change
    }
    psbt.addOutput({ script: OP_RETURN, value: 0 }) // Add OP_RETURN {script, value}
    psbt.signAllInputs(btcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex
    return await broadcastTx(this.electrsAPI, txHex) // Broadcast TX and get txid
  }

  // Generates a valid transaction hex to broadcast
  normalTx = async (addressTo: string, valueOut: number, feeRate: number): Promise<string> => {
    if (this.utxos.length === 0) {
      throw new Error('No utxos to send')
    }
    const balance = this.getBalance()
    const network = this.getNetwork(this.net)
    const btcKeys = this.getBtcKeys(this.net, this.phrase)
    const txWeight = await this.getTxWeight(addressTo)
    const fee = txWeight * feeRate
    if (fee + valueOut > balance) {
      throw new Error('Balance insufficient for transaction')
    }
    const psbt = new Bitcoin.Psbt({ network: network }) // Network-specific
    this.utxos.forEach((UTXO) =>
      psbt.addInput({
        hash: UTXO.hash,
        index: UTXO.index,
        witnessUtxo: UTXO.witnessUtxo,
      }),
    )
    psbt.addOutput({ address: addressTo, value: valueOut }) // Add output {address, value}
    const change = this.getChange(valueOut + fee)
    if (change > 0) {
      psbt.addOutput({ address: this.getAddress(), value: change }) // Add change
    }
    psbt.signAllInputs(btcKeys) // Sign all inputs
    psbt.finalizeAllInputs() // Finalise inputs
    const txHex = psbt.extractTransaction().toHex() // TX extracted and formatted to hex
    return await broadcastTx(this.electrsAPI, txHex) // Broadcast TX and get txid
  }
}

export { Client, Network }
