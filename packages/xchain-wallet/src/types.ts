import { Balance, TxParams as BaseTxParams } from '@xchainjs/xchain-client'
import { TxParams as BaseEvmTxParams } from '@xchainjs/xchain-evm'
import { Asset, BaseAmount, Chain, SynthAsset, TokenAsset } from '@xchainjs/xchain-util'
import { TxParams as BaseUtxoTxParams } from '@xchainjs/xchain-utxo'

/**
 * UTXO transfer params
 */
export type UtxoTxParams = BaseUtxoTxParams & { asset: Asset; feeRate?: BaseAmount }
/**
 * EVM transfer params
 */
export type EvmTxParams = BaseEvmTxParams & { asset: Asset | TokenAsset }

/**
 * Cosmos transfer params
 */
export type CosmosTxParams = BaseTxParams & { asset: Asset | TokenAsset | SynthAsset }

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
