import { Balance, FeeOption, FeeRates, Tx, TxsPage, UTXO, UtxoOnlineDataProvider } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

import { getFeeEstimate } from './bitgo-api'

export interface BitgoConfig {
  baseUrl: string
  chain: Chain
}

export class BitgoProvider implements UtxoOnlineDataProvider {
  private config: BitgoConfig
  constructor(config: BitgoConfig) {
    this.config = config
  }

  async getFeeRates(): Promise<FeeRates> {
    const gasFeeEstimateResponse = await getFeeEstimate(
      `${this.config.baseUrl}/api/v2/${this.config.chain.toLowerCase()}`,
      {
        numBlocks: 2,
      },
    )

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

  getConfirmedUnspentTxs(): Promise<UTXO[]> {
    throw new Error('Method not implemented.')
  }
  getUnspentTxs(): Promise<UTXO[]> {
    throw new Error('Method not implemented.')
  }
  broadcastTx(): Promise<string> {
    throw new Error('Method not implemented.')
  }
  getBalance(): Promise<Balance[]> {
    throw new Error('Method not implemented.')
  }
  getTransactions(): Promise<TxsPage> {
    throw new Error('Method not implemented.')
  }
  getTransactionData(): Promise<Tx> {
    throw new Error('Method not implemented.')
  }
}
