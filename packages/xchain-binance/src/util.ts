import { Transfer, TransferEvent } from './types/binance-ws'
import { TransferFee, DexFees, Fee, TxType as BinanceTxType } from './types/binance'
import { TxType } from '@xchainjs/xchain-client'

/**
 * Get `hash` from transfer event sent by Binance chain
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 */
export const getHashFromTransfer = (transfer?: { data?: Pick<Transfer, 'H'> }): string | undefined => transfer?.data?.H

/**
 * Get `hash` from memo
 */
export const getTxHashFromMemo = (transfer?: TransferEvent) => transfer?.data?.M.split(':')[1]

/**
 * Type guard for runtime checks of `Fee`
 */
export const isFee = (v: Fee | TransferFee | DexFees): v is Fee =>
  !!(v as Fee)?.msg_type && (v as Fee)?.fee !== undefined && (v as Fee)?.fee_for !== undefined

/**
 * Type guard for `FreezeFee`
 */
export const isFreezeFee = (v: Fee | TransferFee | DexFees): v is Fee => (v as Fee)?.msg_type === 'tokensFreeze'

/**
 * Type guard for `TransferFee`
 */
export const isTransferFee = (v: Fee | TransferFee | DexFees): v is TransferFee =>
  isFee((v as TransferFee)?.fixed_fee_params) && !!(v as TransferFee)?.multi_transfer_fee

/**
 * Type guard for `DexFees`
 */
export const isDexFees = (v: Fee | TransferFee | DexFees): v is DexFees => (v as DexFees)?.dex_fee_fields?.length > 0

/**
 * Get TxType
 */
export const getTxType = (t: BinanceTxType): TxType => {
  if (t === 'TRANSFER' || t === 'DEPOSIT') return 'transfer'
  if (t === 'FREEZE_TOKEN') return 'freeze'
  if (t === 'UN_FREEZE_TOKEN') return 'unfreeze'
  return 'unknown'
}
