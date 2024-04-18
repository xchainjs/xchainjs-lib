import { TxParams as BaseTxParams } from '@xchainjs/xchain-client'
import { TxParams as BaseEvmTxParams } from '@xchainjs/xchain-evm'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

/**
 * UTXO transfer params
 */
export type UtxoTxParams = BaseTxParams & { asset: Asset; feeRate?: BaseAmount }
/**
 * EVM transfer params
 */
export type EvmTxParams = BaseEvmTxParams & { asset: Asset }
