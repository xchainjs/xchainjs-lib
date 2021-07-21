import {
  Address,
  Balance,
  Fee,
  // Fee,
  FeeRate,
  FeeType,
  Network,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  UTXOClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Fees, FeesWithRates } from '@xchainjs/xchain-client/src'
import { getSeed } from '@xchainjs/xchain-crypto'
import { dcrNetwork } from '@xchainjs/xchain-decred/src/utils'
import { Chain, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import * as Decred from 'decredjs-lib'

import * as dcrdata from './dcrdata-api'
import * as utils from './utils'

export type DecredClientParams = XChainClientParams & {
  dcrdataUrl?: string
}

/**
 * Custom Bitcoin client
 */
class Client extends UTXOClient {
  private dcrdataUrl = ''

  /**
   * Constructor
   * Client is initialised with network type
   *
   * @param {DecredClientParams} params
   */
  constructor({
    network = Network.Testnet,
    // dcrdataUrl = 'https://dcrdata.decred.org', // this is not used.
    rootDerivationPaths = {
      [Network.Mainnet]: `m/44'/42'/0'`,
      [Network.Testnet]: `m/44'/1'/0'`,
    },
    phrase = '',
  }: DecredClientParams) {
    super(Chain.Decred, { network, rootDerivationPaths, phrase })
    // this.setDcrdataUrl(dcrdataUrl)
  }

  /**
   * Set/Update the dcrdata url.
   *
   * @param {string} url The new dcrdata url.
   * @returns {void}
   */
  // setDcrdataUrl(url: string): void {
  //   this.dcrdataUrl = url
  // }

  /**
   * Get the explorer url.
   *
   * @returns {string} The explorer url based on the network.
   */
  getExplorerUrl(): string {
    switch (this.network) {
      case Network.Mainnet:
        return 'https://dcrdata.decred.org'
      case Network.Testnet:
        return 'https://testnet.dcrdata.org'
    }
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address based on the network.
   */
  getExplorerAddressUrl(address: string): string {
    return `${this.getExplorerUrl()}/api/address/${address}` // TODO: Verify: this only returns the last 10 tx
  }
  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID The transaction id
   * @returns {string} The explorer url for the given transaction id based on the network.
   */
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/api/tx/${txID}`
  }

  /**
   * Get the current address.
   *
   * Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
   * The address is then decoded into type P2PKH and returned.
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
      const privkey = this.getDcrKey(this.phrase, index)
      if (!privkey) {
        throw new Error('Could not get private key from phrase')
      }
      const address = privkey.publicKey.toAddress().toString()
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
  private getDcrKey(phrase: string, index = 0) {
    // const dcrNetwork = Utils.dcrNetwork(this.network)
    let dn, path
    switch (this.network) {
      case Network.Mainnet:
        dn = Decred.Networks.dcrdlivenet
        path = `${this.rootDerivationPaths?.mainnet}/${index}'`
        break
      case Network.Testnet:
        dn = Decred.Networks.dcrdtestnet
        path = `${this.rootDerivationPaths?.testnet}/${index}'`
        break
    }
    const seed = getSeed(phrase)
    // Decred.fromSeed returns a HDPrivatekey.
    const master = Decred.HDPrivateKey.fromSeed(seed.toString('hex'), dn)
    const dmaster = master.derive(path)
    const privkey = dmaster.privateKey

    if (!privkey) {
      throw new Error('Could not get private key from phrase')
    }

    return privkey
  }

  /**
   * Validate the given address.
   *
   * @param {Address} address
   * @returns {boolean} `true` or `false`
   */
  validateAddress(address: string): boolean {
    //return Utils.validateAddress(address, this.network)
    return Decred.Address.isValid(address, dcrNetwork(this.network))
  }

  /**
   * Get the BTC balance of a given address.
   *
   * @param {Address} the BTC address
   * @returns {Balance[]} The BTC balance of the address.
   */
  async getBalance(address: Address): Promise<Balance[]> {
    return utils.getBalance({
      dcrdataUrl: this.dcrdataUrl,
      network: this.network,
      address: address,
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
    return await dcrdata.getAddress(
      {
        address: params?.address + '',
        dcrdataUrl: this.dcrdataUrl,
        network: this.network,
      },
      params?.offset,
      params?.limit,
    )

    return {} as Promise<TxsPage>
  }

  /**
   * Get the transaction details of a given transaction id.
   * This does not include "data" output that has no value and no destination address
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    return dcrdata.getTx(txId, this.network)
  }

  //
  async getFeesWithRates(_?: string): Promise<FeesWithRates> {
    const feerates = { average: 10, fast: 20, fastest: 30 }
    const fees = {
      average: assetToBase(assetAmount(0.0001)),
      fast: assetToBase(assetAmount(0.0002)),
      fastest: assetToBase(assetAmount(0.0003)),
      type: FeeType.PerByte,
    }
    return { rates: feerates, fees: fees }
  }
  async getFees(memo?: string): Promise<Fees> {
    const { fees } = await this.getFeesWithRates(memo)
    return fees
  }

  protected async getSuggestedFeeRate(): Promise<FeeRate> {
    //return await dcrdata.getSuggestedTxFee(this.network)
    return {} as Promise<FeeRate>
  }

  protected async calcFee(feeRate: FeeRate, memo?: string): Promise<Fee> {
    return utils.calcFee(feeRate, memo)
  }

  /**
   * Transfer BTC.
   *
   * @param {TxParams&FeeRate} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const fromAddressIndex = params?.walletIndex || 0

    // set the default fee rate to `fast`
    // const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    const feeRate = params.feeRate || 15

    /**
     * do not spend pending UTXOs when adding a memo
     * https://github.com/xchainjs/xchainjs-lib/issues/330
     */
    const spendPendingUTXO: boolean = params.memo ? false : true

    const { tx } = await utils.buildTx({
      ...params,
      feeRate,
      sender: this.getAddress(fromAddressIndex),
      dcrdataUrl: this.dcrdataUrl,
      network: this.network,
      spendPendingUTXO,
    })

    if (tx._inputAmount < tx._outputAmount) {
      throw new Error('Insufficient Balance for transaction')
    }
    const dcrKeys = this.getDcrKey(this.phrase, fromAddressIndex)
    tx.sign(dcrKeys)
    const txbin = tx.serialize()
    // console.log(txbin)
    const txHex = txbin.toString('hex')
    return await utils.broadcastTx({ network: this.network, txHex, dcrdataUrl: this.dcrdataUrl })
  }
}

export { Client }
