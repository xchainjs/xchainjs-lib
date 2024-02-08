// Import necessary modules and types from external packages and files
import { FeeType, Fees, Network, Tx, TxType, singleFee } from '@xchainjs/xchain-client'
import { assetAmount, assetFromString, assetToBase, baseAmount } from '@xchainjs/xchain-util'
// Import constants from the 'const' file
import { BNBChain } from './const'
// Import types from the 'types' file
import { Account, DexFees, Fee, TransferFee, Tx as BinanceTx, TxType as BinanceTxType } from './types/binance'
import { Transfer, TransferEvent } from './types/binance-ws'
import { DerivePath } from './types/common'

/**
 * Function to extract hash from a transfer event
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 * @param {TransferEvent} transfer The transfer event. (optional)
 * @returns {string|undefined} The hash from transfer event.
 */
export const getHashFromTransfer = (transfer?: { data?: Pick<Transfer, 'H'> }): string | undefined => transfer?.data?.H

/**
 * Function to extract hash from a memo
 * @param {TransferEvent} transfer The transfer event. (optional)
 * @returns {string|undefined} The hash from the memo.
 */
export const getTxHashFromMemo = (transfer?: TransferEvent) => transfer?.data?.M.split(':')[1]

/**
 * Type guard function for 'Fee'
 * @param {Fee|TransferFee|DexFees} v
 * @returns {boolean} `true` or `false`.
 */
export const isFee = (v: Fee | TransferFee | DexFees): v is Fee =>
  !!(v as Fee)?.msg_type && (v as Fee)?.fee !== undefined && (v as Fee)?.fee_for !== undefined

/**
 * Type guard function for 'TransferFee'
 * @param {Fee|TransferFee|DexFees} v
 * @returns {boolean} `true` or `false`.
 */
export const isTransferFee = (v: Fee | TransferFee | DexFees): v is TransferFee =>
  isFee((v as TransferFee)?.fixed_fee_params) && !!(v as TransferFee)?.multi_transfer_fee

/**
 * Type guard function for 'DexFees'
 * @param {Fee|TransferFee|DexFees} v
 * @returns {boolean} `true` or `false`.
 */
export const isDexFees = (v: Fee | TransferFee | DexFees): v is DexFees => (v as DexFees)?.dex_fee_fields?.length > 0

/**
 * Type guard function for 'Account'
 * @param {unknown} v
 * @returns {boolean} `true` or `false`.
 */
export const isAccount = (v: unknown): v is Account =>
  typeof (v as Account).account_number === 'number' &&
  typeof (v as Account).address === 'string' &&
  Array.isArray((v as Account).balances) &&
  Array.isArray((v as Account).public_key) &&
  typeof (v as Account).flags === 'number' &&
  typeof (v as Account).sequence === 'number'

/**
 * Function to determine the transaction type
 * @param {BinanceTxType} t
 * @returns {TxType} `transfer` or `unknown`.
 */
export const getTxType = (t: BinanceTxType): TxType => {
  if (t === 'TRANSFER' || t === 'DEPOSIT') return TxType.Transfer
  return TxType.Unknown
}

/**
 * Function to parse a transaction
 * @param {BinanceTx} t The transaction to be parsed. (optional)
 * @returns {Tx|null} The transaction parsed from the binance tx.
 */
export const parseTx = (tx: BinanceTx): Tx | null => {
  const asset = assetFromString(`${BNBChain}.${tx.txAsset}`)

  if (!asset) return null

  return {
    asset,
    from: [
      {
        from: tx.fromAddr,
        amount: assetToBase(assetAmount(tx.value, 8)),
      },
    ],
    to: [
      {
        to: tx.toAddr,
        amount: assetToBase(assetAmount(tx.value, 8)),
      },
    ],
    date: new Date(tx.timeStamp),
    type: getTxType(tx.txType),
    hash: tx.txHash,
  }
}

/**
 * Function to get derivation path
 * @param {number} index (optional)
 * @returns {DerivePath} The binance derivation path by the index.
 */
export const getDerivePath = (index = 0): DerivePath => [44, 714, 0, 0, index]

/**
 * Function to get default fees
 * @returns {Fees} The default fee.
 */
export const getDefaultFees = (): Fees => {
  return singleFee(FeeType.FlatFee, baseAmount(37500))
}

/**
 * Function to get address prefix based on the network
 * @param {Network} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'bnb'
    case Network.Testnet:
      return 'tbnb'
  }
}
