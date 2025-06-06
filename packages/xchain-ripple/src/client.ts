import { AssetInfo, FeeRate, Network, PreparedTx, TxParams } from '@xchainjs/xchain-client'
import { Address, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import { Client as UTXOClient, UtxoClientParams } from '@xchainjs/xchain-utxo'
import { AssetXRP, XRP_DECIMAL, XRPChain } from './const'
import { getSeed } from '@xchainjs/xchain-crypto'
import * as Utils from './utils'

// Default parameters for the XRP client
export const defaultXRPParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  feeBounds: {
    lower: 10, // Minimum fee in drops
    upper: 1000000, // Maximum fee in drops
  },
}
/**
 * Custom XRP client
 */
export default class Client extends UTXOClient {
  private nodeUrl: string

  constructor(params: UtxoClientParams = defaultXRPParams) {
    super(XRPChain, params)
    this.nodeUrl =
      params.nodeUrl || (params.network === Network.Mainnet ? 'https://xrplcluster.com' : 'https://testnet.xrpl.org')
  }

  // Get address from the seed phrase
  public getAddress(index = 0): string {
    if (!this.phrase) throw new Error('Phrase not set')
    // Generate seed from mnemonic phrase
    const seed = getSeed(this.phrase)
    // Derive key pair using XRP-compatible derivation path (BIP44: m/44'/144'/0'/0/index)
    const keyPair = this.deriveKeyPair(seed, index)
    // Generate and return XRP address
    return this.generateAddress(keyPair)
  }

  /**
   * Retrieves the current address asynchronously.
   *
   * Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
   * The address is then decoded into type P2WPKH and returned.
   *
   * @returns {Address} A promise that resolves to the current address
   *
   * @throws {"Phrase must be provided"} Thrown if phrase has not been set before.
   * @throws {"Address not defined"} Thrown if failed creating account from phrase.
   */
  public async getAddressAsync(walletIndex = 0): Promise<Address> {
    return this.getAddress(walletIndex)
  }

  // Derive key pair for XRP using BIP44 derivation path
  private deriveKeyPair(seed: Buffer, index: number) {
    const { derivePath } = require('ripple-keypairs')
    const derivationPath = `m/44'/144'/0'/0/${index}`
    const { privateKey, publicKey } = derivePath(seed.toString('hex'), derivationPath)
    return { publicKey, privateKey }
  }

  // Generate XRP address from public key
  private generateAddress(keyPair: { publicKey: string; privateKey: string }): string {
    const { deriveAddress } = require('ripple-keypairs')
    return deriveAddress(keyPair.publicKey)
  }
  /**
   * Returns information about the asset used by the client.
   *
   * @returns {AssetInfo} Information about the XRP asset.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetXRP,
      decimal: XRP_DECIMAL,
    }
    return assetInfo
  }

  // protected compileMemo(memo: string): Buffer {
  //   throw new Error('Method not implemented.')
  // }
  // protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null): number {
  //   throw new Error('Method not implemented.')
  // }

  /**
   * Validates the given Litecoin address.
   *
   * @param {string} address The Litecoin address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address)
  }

  prepareTx(params: TxParams): Promise<PreparedTx> {
    throw new Error('Method not implemented.')
  }

  // Get transaction data by hash
  async getTransactionData(txHash: string) {
    try {
      const response = await axios.post(this.nodeUrl, {
        method: 'tx',
        params: [{ transaction: txHash, binary: false }],
      })
      const tx = response.data.result
      return {
        hash: tx.hash,
        from: [{ from: tx.Account, amount: baseAmount(tx.Amount, XRP_DECIMAL) }],
        to: [{ to: tx.Destination, amount: baseAmount(tx.Amount, XRP_DECIMAL) }],
        date: new Date(tx.date * 1000),
        type: 'transfer',
      }
    } catch (error: any) {
      throw new Error(`Failed to get transaction: ${error.message}`)
    }
  }

  // Transfer XRP
  async transfer(params: { amount: BaseAmount; recipient: string; memo?: string; feeRate?: number }) {
    const { amount, recipient, memo, feeRate = 10 } = params
    if (!this.phrase) throw new Error('Phrase not set')

    const sender = this.getAddress()
    const tx = {
      TransactionType: 'Payment',
      Account: sender,
      Destination: recipient,
      Amount: amount.amount().toString(),
      Fee: feeRate.toString(), // In drops
      ...(memo && { Memos: [{ Memo: { MemoData: Buffer.from(memo).toString('hex') } }] }),
    }

    try {
      const response = await axios.post(this.nodeUrl, {
        method: 'submit',
        params: [{ tx_json: tx, secret: this.phrase }],
      })
      return response.data.result.tx_json.hash
    } catch (error: any) {
      throw new Error(`Transfer failed: ${error.message}`)
    }
  }

  // Get fee rates (in drops)
  async getFeeRates() {
    try {
      const response = await axios.post(this.nodeUrl, {
        method: 'fee',
        params: [{}],
      })
      const fee = response.data.result.drops
      return {
        fast: Number(fee.median_fee),
        fastest: Number(fee.open_ledger_fee),
        average: Number(fee.minimum_fee),
      }
    } catch (error: any) {
      throw new Error(`Failed to get fees: ${error.message}`)
    }
  }
}

export { Client }
