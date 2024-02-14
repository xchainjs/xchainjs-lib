import { TxParams as BaseTxParams } from '@xchainjs/xchain-client'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

export type UtxoTxParams = BaseTxParams & { asset: Asset; feeRate?: BaseAmount }
export type EvmTxParams = BaseTxParams & { asset: Asset; gasPrice?: BaseAmount }
