import { TxHash } from '@xchainjs/xchain-client/lib'
import { LedgerTxInfo, LedgerTxParams } from './types/ledger'
import * as Utils from './utils'
import * as blockChair from './blockchair-api'

export const createTx = async (params: LedgerTxParams): Promise<LedgerTxInfo> => {
  try {
    const { psbt, utxos } = await Utils.buildTx(params)

    return {
      utxos,
      newTxHex: psbt.data.globalMap.unsignedTx.toBuffer().toString('hex'),
    }
  } catch (e) {
    return Promise.reject(e)
  }
}

export const broadcastTx = async (txHex: string, nodeUrl: string, nodeApiKey: string): Promise<TxHash> => {
  return await blockChair.broadcastTx(nodeUrl, txHex, nodeApiKey)
}
