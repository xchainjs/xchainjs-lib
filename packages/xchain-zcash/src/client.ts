/* eslint-disable ordered-imports/ordered-imports */
import {
  Address,
  Balance,
  Fee,
  FeeRate,
  Network,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  UTXOClient,
} from '@xchainjs/xchain-client'

import * as UtxoLib from '@bitgo/utxo-lib'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Chain } from '@xchainjs/xchain-util'

import { ZcashClientParams } from './types'
import * as Utils from './utils'
import * as zcash from 'bitcoinjs-lib'

/**
 * Custom Zcash client
 */
class Client extends UTXOClient {
  private nodeUrl = ''
  private sochainUrl = ''
  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {ZcashClientParams} params
   */
  constructor({
    network = Network.Testnet,
    phrase,
    nodeUrl,
    rootDerivationPaths = {
      [Network.Mainnet]: `44'/133'/0'/0/`,
      [Network.Stagenet]: `44'/133'/0'/0/`,
      [Network.Testnet]: `44'/133'/1'/0/`,
    },
    sochainUrl = 'https://sochain.com/api/v2',
  }: ZcashClientParams) {
    super(Chain.Zcash, { network, phrase, rootDerivationPaths })
    this.nodeUrl =
      nodeUrl ??
      (() => {
        switch (network) {
          case Network.Mainnet:
          case Network.Stagenet:
            return 'https://zec.thorchain.info'
          case Network.Testnet:
            return 'https://testnet.zec.thorchain.info'
        }
      })()

    // TODO: Remove it, needed to get rid of tsc warning
    // "'nodeUrl' is declared but its value is never read."
    console.log('nodeUrl', this.nodeUrl)
    this.sochainUrl = sochainUrl
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
      // TODO: Add urls
      case Network.Mainnet:
      case Network.Stagenet:
        return 'https://zcashblockexplorer.com'
      case Network.Testnet:
        return 'https://www.sochain.com/testnet/zcash'
    }
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl(address: Address): string {
    // TODO: Check/Update URL
    return `${this.getExplorerUrl()}/address/${address}`
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl(txID: string): string {
    // TODO: Check/Update URL
    return `${this.getExplorerUrl()}/transactions/${txID}`
  }

  /**
   * Get getFullDerivationPath
   *
   * @param {number} index the HD wallet index
   * @returns {string} The bitcoin derivation path based on the network.
   */
  getFullDerivationPath(index: number): string {
    if (this.rootDerivationPaths) {
      return (this.rootDerivationPaths[this.network] + `${index}`) as string
    } else {
      return ''
    }
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
      const zecNetwork = Utils.zecNetwork(this.network)
      const zecKeys = this.getZecKeys(this.phrase, index)

      const { address } = UtxoLib.payments.p2wpkh({
        pubkey: zecKeys.publicKey,
        network: zecNetwork,
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
  private getZecKeys(phrase: string, index = 0): zcash.ECPairInterface {
    const zecNetwork = Utils.zecNetwork(this.network)
    // const zec = coininfo.zcash.main
    // const zecBitcoinJsLib = zec.toBitcoinJS()

    console.log('zecNetwork', zecNetwork)
    const seed = getSeed(phrase)
    console.log('seed', seed)
    // const masterHDNode = zcash.HDNode.fromSeedBuffer(seed, zecNetwork)
    // console.log('masterHDNode', masterHDNode)
    // console.log('masterHDNode.derivePath', masterHDNode.derivePath(this.getFullDerivationPath(index)).keyPair)
    const master = zcash.bip32.fromSeed(seed, zecNetwork).derivePath(this.getFullDerivationPath(index))
    console.log('master', master)
    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return zcash.ECPair.fromPrivateKey(master.privateKey, { network: zecNetwork })
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress(address: string): boolean {
    throw new Error(`validateAddress needs to be implemented ${address}`)
  }

  protected getSuggestedFeeRate(): Promise<FeeRate> {
    return Promise.reject(`getSuggestedFeeRate needs to be implemented`)
  }

  protected calcFee(feeRate: FeeRate, memo?: string): Promise<Fee> {
    return Promise.reject(`calcFee needs to be implemented ${JSON.stringify({ feeRate, memo }, null, 2)}`)
  }

  /**
   * Get the ZEC balance of a given address.
   *
   * @param {Address} address By default, it will return the balance of the current wallet. (optional)
   * @returns {Balance[]} The ZEC balance of the address.
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
    return Promise.reject(`getTransactions needs to be implemented ${JSON.stringify(params, null, 2)}`)
  }

  /**
   * Get the transaction details of a given transaction id.
   *
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    return Promise.reject(`getTransactionData needs to be implemented ${txId}`)
  }

  /**
   * Transfer ZEC.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    return Promise.reject(`transfer needs to be implemented ${JSON.stringify({ params }, null, 2)}`)
  }
}

export { Client }
