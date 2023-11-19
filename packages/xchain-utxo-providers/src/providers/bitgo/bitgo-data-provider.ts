import { Balance, FeeOption, FeeRates, Tx, TxsPage, UTXO, UtxoOnlineDataProvider } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

import { getFeeEstimate } from './bitgo-api'

export interface BitgoConfig {
  baseUrl: string
  chain: Chain
  isTestnet?: boolean
}

export class BitgoProvider implements UtxoOnlineDataProvider {
  private baseUrl: string
  private blockchainId: string

  constructor(config: BitgoConfig) {
    this.baseUrl = config.baseUrl
    this.blockchainId = `${config.isTestnet ? 't' : ''}${config.chain.toLowerCase()}`
  }

  /**
   * Returns a fee rate estimation from Bitgo API service. If low and medium rates can not be retrieve from node, the will be 50% and 75% of fastest fee rate
   * @returns {FeeRates} Estimated fee rates
   */
  async getFeeRates(): Promise<FeeRates> {
    const gasFeeEstimateResponse = await getFeeEstimate(`${this.baseUrl}/api/v2/${this.blockchainId}`, {
      numBlocks: 2,
    })

    const fastestRate = gasFeeEstimateResponse.feePerKb / 1000

    return {
      [FeeOption.Average]: gasFeeEstimateResponse.feeByBlockTarget?.['6']
        ? gasFeeEstimateResponse.feeByBlockTarget?.['6'] / 1000
        : fastestRate * 0.5,
      [FeeOption.Fast]: gasFeeEstimateResponse.feeByBlockTarget?.['3']
        ? gasFeeEstimateResponse.feeByBlockTarget?.['3'] / 1000
        : fastestRate * 0.75,
      [FeeOption.Fastest]: fastestRate,
    }
  }

  /**
   *  @throws {Error} Method not implemented.
   */
  getConfirmedUnspentTxs(): Promise<UTXO[]> {
    throw new Error('Method not implemented.')
  }

  /**
   *  @throws {Error} Method not implemented.
   */
  getUnspentTxs(): Promise<UTXO[]> {
    throw new Error('Method not implemented.')
  }

  /**
   *  @throws {Error} Method not implemented.
   */
  broadcastTx(): Promise<string> {
    throw new Error('Method not implemented.')
  }

  /**
   *  @throws {Error} Method not implemented.
   */
  getBalance(): Promise<Balance[]> {
    throw new Error('Method not implemented.')
  }

  /**
   *  @throws {Error} Method not implemented.
   */
  getTransactions(): Promise<TxsPage> {
    throw new Error('Method not implemented.')
  }

  /**
   *  @throws {Error} Method not implemented.
   */
  getTransactionData(): Promise<Tx> {
    throw new Error('Method not implemented.')
  }
}
