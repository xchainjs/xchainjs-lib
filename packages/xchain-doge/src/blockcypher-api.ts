import { Network } from '@xchainjs/xchain-client'
import axios from 'axios'

const DEFAULT_SUGGESTED_TRANSACTION_FEE = 150000

/**
 * Get Dogecoin suggested transaction fee.
 *
 * @returns {number} The Dogecoin suggested transaction fee per bytes in sat.
 */
export const getSuggestedTxFee = async ({ blockcypherUrl }: { blockcypherUrl: string }): Promise<number> => {
  try {
    const response = await axios.get(`${blockcypherUrl}/doge/main`)
    return response.data.low_fee_per_kb / 1000 // feePerKb to feePerByte
  } catch (error) {
    return DEFAULT_SUGGESTED_TRANSACTION_FEE
  }
}

export const getSendTxUrl = ({ blockcypherUrl, network }: { blockcypherUrl: string; network: Network }) => {
  if (network === 'testnet') {
    throw new Error('Testnet URL is not available for blockcypher')
  } else {
    return `${blockcypherUrl}/doge/main/txs/push`
  }
}
