import * as Bitcoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib
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
}

function inputBytes(input: UTXO) {
  return TX_INPUT_BASE + (input.witnessUtxo.script ? input.witnessUtxo.script.length : TX_INPUT_PUBKEYHASH)
}

export const compileMemo = (memo: string) => {
  const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
  return Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
}

export function getVaultFee(inputs: UTXO[], data: Buffer, feeRate: number) {
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
  return vaultFee > 1000 ? vaultFee : 1000
}

export function getNormalFee(inputs: UTXO[], feeRate: number) {
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
  return normalFee > 1000 ? normalFee : 1000
}

export function arrayAverage(array: Array<number>) {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

export function filterByKeys(obj: object, filterKeys: Array<string>) {
  const filtered = {}
  filterKeys.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      ;(filtered as any)[key] = (obj as any)[key]
    }
  })
  return filtered
}
