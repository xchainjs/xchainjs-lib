import * as Bitcoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib
import { FeeRate } from './types/client-types'
/**
 * Bitcoin byte syzes
 */
const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
const TX_INPUT_PUBKEYHASH = 107
const TX_OUTPUT_BASE = 8 + 1 //9
const TX_OUTPUT_PUBKEYHASH = 25
export const dustThreshold = 1000

/**
 * Interaces
 */
export interface Witness {
  value: number
  script: Buffer
}
export interface UTXO {
  hash: string
  index: number
  witnessUtxo: Witness
  txHex: string
}

export type LedgerTxInfo = {
  utxos: Array<UTXO>
  newTxHex: string
}

function inputBytes(input: UTXO): number {
  return TX_INPUT_BASE + (input.witnessUtxo.script ? input.witnessUtxo.script.length : TX_INPUT_PUBKEYHASH)
}

export const compileMemo = (memo: string): Buffer => {
  const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
  return Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
}

/**
 * Minimum transaction fee
 * 1000 satoshi/kB (similar to current `minrelaytxfee`)
 * @see https://github.com/bitcoin/bitcoin/blob/db88db47278d2e7208c50d16ab10cb355067d071/src/validation.h#L56
 */
export const MIN_TX_FEE = 1000

export function getVaultFee(inputs: UTXO[], data: Buffer, feeRate: FeeRate): number {
  const vaultFee =
    (TX_EMPTY_SIZE +
      inputs.reduce(function (a, x) {
        return a + inputBytes(x)
      }, 0) +
      inputs.length + // +1 byte for each input signature
      TX_OUTPUT_BASE +
      TX_OUTPUT_PUBKEYHASH +
      TX_OUTPUT_BASE +
      TX_OUTPUT_PUBKEYHASH +
      TX_OUTPUT_BASE +
      data.length) *
    feeRate
  return vaultFee > MIN_TX_FEE ? vaultFee : MIN_TX_FEE
}

export function getNormalFee(inputs: UTXO[], feeRate: FeeRate): number {
  const normalFee =
    (TX_EMPTY_SIZE +
      inputs.reduce(function (a, x) {
        return a + inputBytes(x)
      }, 0) +
      inputs.length + // +1 byte for each input signature
      TX_OUTPUT_BASE +
      TX_OUTPUT_PUBKEYHASH +
      TX_OUTPUT_BASE +
      TX_OUTPUT_PUBKEYHASH) *
    feeRate
  return normalFee > MIN_TX_FEE ? normalFee : MIN_TX_FEE
}

export function arrayAverage(array: Array<number>): number {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}
