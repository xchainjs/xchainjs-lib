import { LedgerTxInfo, LedgerTxInfoParams } from './types/ledger'
import * as Utils from './utils'

/**
 * Create transaction info.
 *
 * @param {LedgerTxInfoParams} params The transaction build options.
 * @returns {LedgerTxInfo} The transaction info used for ledger sign.
 */
export const createTxInfo = async (params: LedgerTxInfoParams): Promise<LedgerTxInfo> => {
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
