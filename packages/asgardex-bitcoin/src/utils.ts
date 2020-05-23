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
 * Witness and UTXO interaces
 */
export interface Witness {
  value: number
  script: Buffer
}
export interface UTXO {
  hash: string
  index: number
  witnessUtxo: Witness
}

function inputBytes(input: UTXO) {
  return TX_INPUT_BASE + (input.witnessUtxo.script ? input.witnessUtxo.script.length : TX_INPUT_PUBKEYHASH)
}

export function getVaultFee(inputs: UTXO[], data: Buffer, feeRate: number) {
  return (
    (TX_EMPTY_SIZE +
      inputs.reduce(function (a, x) {
        return a + inputBytes(x)
      }, 0) +
      TX_OUTPUT_BASE +
      TX_OUTPUT_PUBKEYHASH +
      TX_OUTPUT_BASE +
      TX_OUTPUT_PUBKEYHASH +
      TX_OUTPUT_BASE +
      data.length) *
    feeRate
  )
}

export function getNormalFee(inputs: UTXO[], feeRate: number) {
  return (
    (TX_EMPTY_SIZE +
      inputs.reduce(function (a, x) {
        return a + inputBytes(x)
      }, 0) +
      TX_OUTPUT_BASE +
      TX_OUTPUT_PUBKEYHASH +
      TX_OUTPUT_BASE +
      TX_OUTPUT_PUBKEYHASH) *
    feeRate
  )
}
