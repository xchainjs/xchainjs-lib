import { Transfer, TransferEvent } from './types/binance-ws'

/**
 * Get `hash` from transfer event sent by Binance chain
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 */
export const getHashFromTransfer = (transfer?: { data?: Pick<Transfer, 'H'> }): string | undefined => transfer?.data?.H

/**
 * Get `hash` from memo
 */
export const getTxHashFromMemo = (transfer?: TransferEvent) => transfer?.data?.M.split(':')[1]
