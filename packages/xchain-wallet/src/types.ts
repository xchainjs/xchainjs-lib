import { Balance, TxParams as BaseTxParams } from '@xchainjs/xchain-client'
import { TxParams as BaseEvmTxParams } from '@xchainjs/xchain-evm'
import { Asset, BaseAmount, Chain } from '@xchainjs/xchain-util'

/**
 * UTXO transfer params
 */
export type UtxoTxParams = BaseTxParams & { asset: Asset; feeRate?: BaseAmount }
/**
 * EVM transfer params
 */
export type EvmTxParams = BaseEvmTxParams & { asset: Asset }

/**
 * Fulfilled balance from a Chain
 */
type FulfilledBalance = { status: 'fulfilled'; balances: Balance[] }
/**
 * Rejected balance from a Chain
 */
type RejectedBalance = { status: 'rejected'; reason: string }
/**
 * Balances by chain, which can be fulfilled or rejected
 */
export type ChainBalances = Record<Chain, FulfilledBalance | RejectedBalance>
