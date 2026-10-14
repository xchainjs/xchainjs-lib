import { Balance, TxParams as BaseTxParams } from '@xchainjs/xchain-client'
import { TxParams as BaseEvmTxParams } from '@xchainjs/xchain-evm'
import { TxParams as BaseRadixTxParams } from '@xchainjs/xchain-radix'
import { Asset, BaseAmount, Chain, SynthAsset, TokenAsset } from '@xchainjs/xchain-util'
import { TxParams as BaseUtxoTxParams } from '@xchainjs/xchain-utxo'

export type UtxoTxParams = BaseUtxoTxParams & { asset: Asset; feeRate?: BaseAmount }

export type RadixTxParams = BaseRadixTxParams & { asset: Asset | TokenAsset }

export type EvmTxParams = BaseEvmTxParams & { asset: Asset | TokenAsset }

export type CosmosTxParams = BaseTxParams & { asset: Asset | TokenAsset | SynthAsset }

type FulfilledBalance = { status: 'fulfilled'; balances: Balance[] }
type RejectedBalance = { status: 'rejected'; reason: string }
export type ChainBalances = Record<Chain, FulfilledBalance | RejectedBalance>
