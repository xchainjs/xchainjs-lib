import { FeeRate, Fees, FeesWithRates, Network, calcFees, standardFeeRates } from '@xchainjs/xchain-client'
import { UTXO } from '@xchainjs/xchain-providers'
import { Address, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import * as Dogecoin from 'bitcoinjs-lib'
import coininfo from 'coininfo'

import { MIN_TX_FEE } from './const'

const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
const TX_INPUT_PUBKEYHASH = 107
const TX_OUTPUT_BASE = 8 + 1 //9
const TX_OUTPUT_PUBKEYHASH = 25

function inputBytes(): number {
  return TX_INPUT_BASE + TX_INPUT_PUBKEYHASH
}

/**
 * Compile memo.
 *
 * @param {string} memo The memo to be compiled.
 * @returns {Buffer} The compiled memo.
 */
export const compileMemo = (memo: string): Buffer => {
  const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
  return Dogecoin.script.compile([Dogecoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
}

/**
 * Get the transaction fee.
 *
 * @param {UTXO[]} inputs The UTXOs.
 * @param {FeeRate} feeRate The fee rate.
 * @param {Buffer} data The compiled memo (Optional).
 * @returns {number} The fee amount.
 */
export function getFee(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
  let sum =
    TX_EMPTY_SIZE +
    inputs.reduce(function (a) {
      return a + inputBytes()
    }, 0) +
    inputs.length + // +1 byte for each input signature
    TX_OUTPUT_BASE +
    TX_OUTPUT_PUBKEYHASH +
    TX_OUTPUT_BASE +
    TX_OUTPUT_PUBKEYHASH

  if (data) {
    sum += TX_OUTPUT_BASE + data.length
  }
  const fee = sum * feeRate
  return fee > MIN_TX_FEE ? fee : MIN_TX_FEE
}

/**
 * Get the average value of an array.
 *
 * @param {number[]} array
 * @returns {number} The average value.
 */
export function arrayAverage(array: number[]): number {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

/**
 * Get Dogecoin network to be used with bitcoinjs.
 *
 * @param {Network} network
 * @returns {Dogecoin.networks.Network} The Doge network.
 */
export const dogeNetwork = (network: Network): Dogecoin.networks.Network => {
  switch (network) {
    case Network.Mainnet:
      return coininfo.dogecoin.main.toBitcoinJS()
    case Network.Stagenet:
      return coininfo.dogecoin.main.toBitcoinJS()
    case Network.Testnet: {
      // Latest coininfo on NPM doesn't contain dogetest config information
      const bip32 = {
        private: 0x04358394,
        public: 0x043587cf,
      }
      const test = coininfo.dogecoin.test
      test.versions.bip32 = bip32
      return test.toBitcoinJS()
    }
  }
}

/**
 * Validate the Doge address.
 *
 * @param {string} address
 * @param {Network} network
 * @returns {boolean} `true` or `false`.
 */
export const validateAddress = (address: Address, network: Network): boolean => {
  try {
    Dogecoin.address.toOutputScript(address, dogeNetwork(network))
    return true
  } catch (error) {
    return false
  }
}

/**
 * Calculate fees based on fee rate and memo.
 *
 * @param {FeeRate} feeRate
 * @param {string} memo
 * @returns {BaseAmount} The calculated fees based on fee rate and the memo.
 */
export const calcFee = (feeRate: FeeRate, memo?: string): BaseAmount => {
  const compiledMemo = memo ? compileMemo(memo) : null
  const fee = getFee([], feeRate, compiledMemo)
  return baseAmount(fee)
}

/**
 * Get the default fees with rates.
 *
 * @returns {FeesWithRates} The default fees and rates.
 */
export const getDefaultFeesWithRates = (): FeesWithRates => {
  const rates = {
    ...standardFeeRates(MIN_TX_FEE),
  }

  return {
    fees: calcFees(rates, calcFee),
    rates,
  }
}

/**
 * Get the default fees.
 *
 * @returns {Fees} The default fees.
 */
export const getDefaultFees = (): Fees => {
  const { fees } = getDefaultFeesWithRates()
  return fees
}

/**
 * Get address prefix based on the network.
 *
 * @param {Network} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return ''
    case Network.Testnet:
      return 'n'
  }
}
