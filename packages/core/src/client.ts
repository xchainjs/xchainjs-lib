import axios from 'axios'
import { BroadcastTxDTO, BtcChainOptions } from './types/blockchair-types'

export type AsgardexClient = {
  setPhrase(phrase?: string): void;
  generatePhrase(): void
  getBalance(address?: string): Promise<number>;
  getTransactions(address: string): Promise<any>;
  getExplorerUrl(): string;
  transfer(params: TxParams): any;
}

export type TxParams = {
  amount: number,
  recipient: string,
  memo?: string,
  feeRate: number
}

export const broadcastTx = async (chain: string, txHex: string): Promise<string> => {

  try {
    const response: BroadcastTxDTO = await axios.post(`https://api.blockchair.com/${chain}/push/transaction)`, { data: txHex })
    return response.data.transaction_hash
  } catch (error) {
    return Promise.reject(error)
  }

}

export const getBtcChainAddressBalance = async (chain: BtcChainOptions, address: string) => {

  try {
    const response: BroadcastTxDTO = await axios.get(`https://api.blockchair.com/${chain}/addresses?${address}`)
    return response.data.transaction_hash
  } catch (error) {
    return Promise.reject(error)
  }

}
