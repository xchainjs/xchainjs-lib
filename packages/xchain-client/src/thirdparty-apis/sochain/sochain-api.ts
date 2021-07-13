import { BaseAmount, Chain, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import axios from 'axios'

import { Address, Network } from '../../types'

import {
  AddressDTO,
  AddressParams,
  AddressUTXO,
  GetBalanceDTO,
  SochainResponse,
  Transaction,
  TxConfirmedStatus,
  TxHashParams,
  UnspentTXsParams,
  UnspentTxsDTO,
} from './sochain-api-types'

// =======================================
// BTC specific constants - TODO refactor
// =======================================
const DEFAULT_SUGGESTED_TRANSACTION_FEE = 127
/**
 * Minimum transaction fee
 * 1000 satoshi/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/bitcoin/bitcoin/blob/db88db47278d2e7208c50d16ab10cb355067d071/src/validation.h#L56
 */
// const MIN_TX_FEE = 1000

export class SochainAPI {
  private chain: Chain
  private sochainUrl = 'https://chain.so/api/v2'

  constructor(chain: Chain) {
    this.chain = chain
  }

  private toSochainNetwork(network: Network): string {
    if (this.chain === 'BTC') {
      switch (network) {
        case Network.Mainnet:
          return 'BTC'
        case Network.Testnet:
          return 'BTCTEST'
      }
    } else if (this.chain === 'LTC') {
      switch (network) {
        case Network.Mainnet:
          return 'LTC'
        case Network.Testnet:
          return 'LTCTEST'
      }
    }
    // TODO sochain supports doge, dash & zcash, shoudl be easy to add those as well when we are ready
    throw Error(`chain: ${this.chain} and network: ${network} not supported yet!`)
  }

  /**
   * Get address information.
   *
   * @see https://sochain.com/api#get-display-data-address
   *
   * @param {string} address
   * @returns {AddressDTO}
   */
  async getAddress({ address, network }: AddressParams): Promise<AddressDTO> {
    const url = `${this.sochainUrl}/address/${this.toSochainNetwork(network)}/${address}`
    const response = await axios.get(url)
    const addressResponse: SochainResponse<AddressDTO> = response.data
    return addressResponse.data
  }

  /**
   * Get transaction by hash.
   *
   * @see https://sochain.com/api#get-tx
   *
   * @param {string} hash The transaction hash.
   * @returns {Transactions}
   */
  async getTx({ hash, network }: TxHashParams): Promise<Transaction> {
    const url = `${this.sochainUrl}/get_tx/${this.toSochainNetwork(network)}/${hash}`
    const response = await axios.get(url)
    const tx: SochainResponse<Transaction> = response.data
    return tx.data
  }

  /**
   * Get address balance.
   *
   * @see https://sochain.com/api#get-balance
   *
   * @param {string} address
   * @returns {number}
   */
  async getBalance(address: Address, network: Network, decmials: number): Promise<BaseAmount> {
    const url = `${this.sochainUrl}/get_address_balance/${this.toSochainNetwork(network)}/${address}`
    const response = await axios.get(url)
    const balanceResponse: SochainResponse<GetBalanceDTO> = response.data
    const confirmed = assetAmount(balanceResponse.data.confirmed_balance, decmials)
    const unconfirmed = assetAmount(balanceResponse.data.unconfirmed_balance, decmials)
    const netAmt = confirmed.amount().plus(unconfirmed.amount())
    const result = assetToBase(assetAmount(netAmt, decmials))
    return result
  }

  /**
   * Get unspent txs
   *
   * @see https://sochain.com/api#get-unspent-tx
   *
   * @param {string} address
   * @returns {AddressUTXO[]}
   */
  async getUnspentTxs({ address, network, startingFromTxId }: UnspentTXsParams): Promise<AddressUTXO[]> {
    let resp = null
    if (startingFromTxId) {
      resp = await axios.get(
        `${this.sochainUrl}/get_tx_unspent/${this.toSochainNetwork(network)}/${address}/${startingFromTxId}`,
      )
    } else {
      resp = await axios.get(`${this.sochainUrl}/get_tx_unspent/${this.toSochainNetwork(network)}/${address}`)
    }
    const response: SochainResponse<UnspentTxsDTO> = resp.data
    const txs = response.data.txs
    if (txs.length === 100) {
      //fetch the next batch
      const lastTxId = txs[99].txid

      const nextBatch = await this.getUnspentTxs({
        address,
        network,
        startingFromTxId: lastTxId,
      })
      return txs.concat(nextBatch)
    } else {
      return txs
    }
  }

  /**
   * Get Tx Confirmation status
   *
   * @see https://sochain.com/api#get-is-tx-confirmed
   *
   * @param {string} hash tx id
   * @returns {TxConfirmedStatus}
   */
  async getIsTxConfirmed({ hash, network }: TxHashParams): Promise<TxConfirmedStatus> {
    const { data } = await axios.get<SochainResponse<TxConfirmedStatus>>(
      `${this.sochainUrl}/is_tx_confirmed/${this.toSochainNetwork(network)}/${hash}`,
    )
    return data.data
  }

  /**
   * Get unspent txs and filter out pending UTXOs
   *
   * @see https://sochain.com/api#get-unspent-tx
   *
   * @param {string} address
   * @returns {AddressUTXO[]}
   */
  async getConfirmedUnspentTxs({ address, network }: AddressParams): Promise<AddressUTXO[]> {
    const txs = await this.getUnspentTxs({
      address,
      network,
    })

    const confirmedUTXOs: AddressUTXO[] = []

    await Promise.all(
      txs.map(async (tx: AddressUTXO) => {
        const { is_confirmed: isTxConfirmed } = await this.getIsTxConfirmed({
          hash: tx.txid,
          network,
        })

        if (isTxConfirmed) {
          confirmedUTXOs.push(tx)
        }
      }),
    )

    return confirmedUTXOs
  }

  /**
   * Get Bitcoin suggested transaction fee.
   *
   * @returns {number} The Bitcoin suggested transaction fee per bytes in sat.
   */
  async getSuggestedTxFee(): Promise<number> {
    //Note: sochain does not provide fee rate related data
    //So use Bitgo API for fee estimation
    //Refer: https://app.bitgo.com/docs/#operation/v2.tx.getfeeestimate
    try {
      const response = await axios.get('https://app.bitgo.com/api/v2//tx/fee')
      return response.data.feePerKb / 1000 // feePerKb to feePerByte
    } catch (error) {
      return DEFAULT_SUGGESTED_TRANSACTION_FEE
    }
  }
}
