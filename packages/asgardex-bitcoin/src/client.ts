import * as BIP39 from 'bip39' // https://github.com/bitcoinjs/bip39
import * as Bitcoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib
import * as WIF from 'wif' // https://github.com/bitcoinjs/wif
import * as Utils from './utils'
// const axios = require('axios').default
import { getAddressTxs, getAddressUtxos, getTxInfo, getAddressInfo } from './electrs-api'

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
  setNetwork(net: Network): void
  getNetwork(net: Network): Bitcoin.networks.Network
  generatePhrase(): string
  setPhrase(phrase?: string): void
  validatePhrase(phrase: string): boolean
  getAddress(): string
  validateAddress(address: string): boolean
  scanUTXOs(address: string): Promise<void>
  getBalance(): number
  getBalanceForAddress(address?: string): Promise<number>
  vaultTx(addressVault: string, valueOut: number, memo: string, feeRate: number): Promise<string>
  normalTx(addressTo: string, valueOut: number, feeRate: number): Promise<string>
  purgeClient(): void
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
    _electrsAPI && this.setElectrsAPI(_electrsAPI)
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

  purgeClient = (): void => {
    this.phrase = ''
    this.utxos = []
  }

  validatePhrase(phrase: string): boolean {
    if (phrase) {
      return BIP39.validateMnemonic(phrase)
    } else {
      return false
    }
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

  setElectrsAPI(endpoint: string): void {
    this.electrsAPI = endpoint
  }

  // Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
  // The address is then decoded into type P2PWPK and returned.
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
  scanUTXOs = async (address: string) => {
    try {
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
      console.error(error)
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
    const addressInfo = await getAddressInfo(this.electrsAPI, address)
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

  getTransactions = async (address: string): Promise<Array<object>> => {
    let transactions = []
    try {
      transactions = await getAddressTxs(this.electrsAPI, address)
    } catch (error) {
      return Promise.reject(error)
    }
    return transactions
  }

  // Generates a valid transaction hex to broadcast
  vaultTx = async (addressVault: string, valueOut: number, memo: string, feeRate: number): Promise<string> => {
    const network = this.getNetwork(this.net)
    const btcKeys = this.getBtcKeys(this.net, this.phrase)
    const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
    const OP_RETURN = Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
    const fee = Utils.getVaultFee(this.utxos, OP_RETURN, feeRate)

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
    psbt.addOutput({ address: addressVault, value: valueOut - fee }) // Add output {address, value}
    const change = this.getChange(valueOut)
    if (change > 0) {
      psbt.addOutput({ address: this.getAddress(), value: change }) // Add change
    }
    psbt.addOutput({ script: OP_RETURN, value: 0 }) // Add OP_RETURN {script, value}
    psbt.signInput(0, btcKeys) // Sign input0 with key-pair
    psbt.finalizeAllInputs() // Finalise inputs
    const tx = psbt.extractTransaction() // TX can be extracted in JSON
    return tx.toHex()
  }

  // Generates a valid transaction hex to broadcast
  normalTx = async (addressTo: string, valueOut: number, feeRate: number): Promise<string> => {
    const network = this.getNetwork(this.net)
    const btcKeys = this.getBtcKeys(this.net, this.phrase)

    const fee = Utils.getNormalFee(this.utxos, feeRate)

    const psbt = new Bitcoin.Psbt({ network: network }) // Network-specific
    this.utxos.forEach((UTXO) =>
      psbt.addInput({
        hash: UTXO.hash,
        index: UTXO.index,
        witnessUtxo: UTXO.witnessUtxo,
      }),
    )
    psbt.addOutput({ address: addressTo, value: valueOut - fee }) // Add output {address, value}
    const change = this.getChange(valueOut)
    if (change > 0) {
      psbt.addOutput({ address: this.getAddress(), value: change }) // Add change
    }
    psbt.signInput(0, btcKeys) // Sign input0 with key-pair
    psbt.finalizeAllInputs() // Finalise inputs
    const tx = psbt.extractTransaction() // TX can be extracted in JSON
    return tx.toHex()
  }
}

export { Client, Network }
