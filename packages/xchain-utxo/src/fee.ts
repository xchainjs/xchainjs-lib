import { TX_SIZE_CONSTANTS, TxSizeConstants } from './constants'

/** `ceil(size × ceil(feeRate))`: the same fee the estimate, the selector and the max path all pay. */
export const calculateTxFee = (
  inputCount: number,
  outputCount: number,
  feeRate: number,
  sizes: TxSizeConstants = TX_SIZE_CONSTANTS,
): number => {
  const txSize = sizes.BASE_TX_SIZE + inputCount * sizes.BYTES_PER_INPUT + outputCount * sizes.BYTES_PER_OUTPUT
  return Math.ceil(txSize * Math.ceil(feeRate))
}

const varintSize = (value: number): number => (value < 253 ? 1 : value <= 0xffff ? 3 : 5)

/** Size of an output with a script of `scriptLength` bytes: 8 value + script length varint + script. */
export const outputBytes = (scriptLength: number): number => 8 + varintSize(scriptLength) + scriptLength
