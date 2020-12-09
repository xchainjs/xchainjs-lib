import { LedgerTxInfo, LedgerTxParams } from './types/ledger'
import * as Utils from './utils'

export const createTxForLedger = async (params: LedgerTxParams): Promise<LedgerTxInfo> => {
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
