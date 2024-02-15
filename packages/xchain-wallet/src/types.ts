import { TxParams as BaseTxParams } from '@xchainjs/xchain-client'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

/**
 * UTXO transfer params
 */
export type UtxoTxParams = BaseTxParams & { asset: Asset; feeRate?: BaseAmount }
/**
 * EVM transfer params
 */
export type EvmTxParams = BaseTxParams & { asset: Asset; gasPrice?: BaseAmount }
