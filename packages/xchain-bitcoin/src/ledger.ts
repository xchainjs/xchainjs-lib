import { Address, Network, TxParams } from '@xchainjs/xchain-client'
import { FeeRate } from './types/client-types'
import * as Utils from './utils'

export type LedgerTxInfo = {
  utxos: Utils.UTXOs
  newTxHex: string
}

export const createTxForLedger = async (
  params: TxParams & { feeRate: FeeRate; sender: Address; network: Network; nodeUrl: string; nodeApiKey: string },
): Promise<LedgerTxInfo> => {
  const { psbt, utxos } = await Utils.buildTx(params)

  return {
    utxos,
    newTxHex: psbt.data.globalMap.unsignedTx.toBuffer().toString('hex'),
  }
}
