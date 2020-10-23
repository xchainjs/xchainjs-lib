import { BaseAmount, Asset } from './types'

/**
 * Memo to swap
 *
 * @param asset Asset to swap
 * @param address Destination `address` to swap and send to someone. If `address` is emtpy, it sends back to self
 * @param limit Price protection. If the value isn't achieved then it is refunded.
 * ie, set 10000000 to be garuanteed a minimum of 1 full asset.
 * If LIM is ommitted, then there is no price protection
 *
 * @see https://docs.thorchain.org/developers/transaction-memos#transactions
 */
export const getSwapMemo = ({
  asset: { chain, symbol },
  address = '',
  limit,
}: {
  asset: Asset
  address?: string
  limit?: BaseAmount
}) => `SWAP:${chain}.${symbol}:${address}:${limit?.amount().toString() ?? ''}`

/**
 * Memo to deposit
 *
 * @param asset Asset to deposit into a specified pool
 * @param address (optional) For cross-chain deposits, an address is needed to cross-reference addresses
 * @see https://docs.thorchain.org/developers/transaction-memos#transactions
 */
export const getDepositMemo = ({ chain, symbol }: Asset, address = '') => `STAKE:${chain}.${symbol}:${address}`

/**
 * Memo to withdraw
 *
 * @param asset Asset to withdraw from a pool
 * @param percent Percent is in basis points (0-10000, where 10000=100%)
 *
 * @see https://docs.thorchain.org/developers/transaction-memos#transactions
 */
export const getWithdrawMemo = ({ chain, symbol }: Asset, percent: number) =>
  `WITHDRAW:${chain}.${symbol}:${percent.toString()}`
