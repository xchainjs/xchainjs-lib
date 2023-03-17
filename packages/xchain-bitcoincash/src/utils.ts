import * as bitcash from '@psf/bitcoincashjs-lib'
import {
  FeeRate,
  Fees,
  FeesWithRates,
  Network,
  Tx,
  TxFrom,
  TxTo,
  TxType,
  calcFees,
  standardFeeRates,
} from '@xchainjs/xchain-client'
import { Address, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import * as bchaddr from 'bchaddrjs'
import coininfo from 'coininfo'

import { AssetBCH } from './const'
import { Transaction, TransactionInput, TransactionOutput, UTXO } from './types'
import { Network as BCHNetwork } from './types/bitcoincashjs-types'

export const BCH_DECIMAL = 8
export const DEFAULT_SUGGESTED_TRANSACTION_FEE = 1

const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
const TX_INPUT_PUBKEYHASH = 107
const TX_OUTPUT_BASE = 8 + 1 //9
const TX_OUTPUT_PUBKEYHASH = 25

/**
 * Compile memo.
 *
 * @param {string} memo The memo to be compiled.
 * @returns {Buffer} The compiled memo.
 */
export const compileMemo = (memo: string): Buffer => {
  const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
  return bitcash.script.compile([bitcash.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
}

/**
 * Get the transaction fee.
 *
 * reference to https://github.com/Permissionless-Software-Foundation/bch-js/blob/acc0300a444059d612daec2564da743c11e27139/src/bitcoincash.js#L408
 *
 * @param {number} inputs The inputs count.
 * @param {number} outputs The outputs count.
 * @param {FeeRate} feeRate The fee rate.
 * @param {Buffer} data The compiled memo (Optional).
 * @returns {number} The fee amount.
 */
export function getFee(inputs: number, feeRate: FeeRate, data: Buffer | null = null): number {
  let totalWeight = TX_EMPTY_SIZE

  totalWeight += (TX_INPUT_PUBKEYHASH + TX_INPUT_BASE) * inputs
  totalWeight += (TX_OUTPUT_BASE + TX_OUTPUT_PUBKEYHASH) * 2
  if (data) {
    totalWeight += 9 + data.length
  }

  return Math.ceil(totalWeight * feeRate)
}

/**
 * Get BCH network to be used with bitcore-lib.
 *
 * @param {Network} network
 * @returns {} The BCH network.
 */
export const bchNetwork = (network: Network): BCHNetwork => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return coininfo.bitcoincash.main.toBitcoinJS()
    case Network.Testnet:
      return coininfo.bitcoincash.test.toBitcoinJS()
  }
}

/**
 * BCH new addresses strategy has no any prefixes.
 * Any possible prefixes at the TX addresses will be stripped out with parseTransaction
 **/
export const getPrefix = () => ''

/**
 * Strips bchtest or bitcoincash prefix from address
 *
 * @param {Address} address
 * @returns {Address} The address with prefix removed
 *
 */
export const stripPrefix = (address: Address): Address => address.replace(/(bchtest:|bitcoincash:)/, '')

/**
 * Convert to Legacy Address.
 *
 * @param {Address} address
 * @returns {Address} Legacy address.
 */
export const toLegacyAddress = (address: Address): Address => {
  return bchaddr.toLegacyAddress(address)
}

/**
 * Convert to Cash Address.
 *
 * @param {Address} address
 * @returns {Address} Cash address.
 */
export const toCashAddress = (address: Address): Address => {
  return bchaddr.toCashAddress(address)
}

/**
 * Checks whether address is Cash Address
 *
 * @param {Address} address
 * @returns {boolean} Is cash address.
 */
export const isCashAddress = (address: Address): boolean => {
  return bchaddr.isCashAddress(address)
}

/**
 * Parse transaction.
 *
 * @param {Transaction} tx
 * @returns {Tx} Parsed transaction.
 *
 **/
export const parseTransaction = (tx: Transaction): Tx => {
  return {
    asset: AssetBCH,
    from: tx.inputs
      // For correct type inference `Array.prototype.filter` needs manual type guard to be defined
      .filter((input): input is Omit<TransactionInput, 'address'> & { address: string } => !!input.address)
      .map(
        (input) =>
          ({
            from: stripPrefix(input.address),
            amount: baseAmount(input.value, BCH_DECIMAL),
          } as TxFrom),
      ),
    to: tx.outputs
      // For correct type inference `Array.prototype.filter` needs manual type guard to be defined
      .filter((output): output is Omit<TransactionOutput, 'address'> & { address: string } => !!output.address)
      .map(
        (output) =>
          ({
            to: stripPrefix(output.address),
            amount: baseAmount(output.value, BCH_DECIMAL),
          } as TxTo),
      ),
    date: new Date(tx.time * 1000),
    type: TxType.Transfer,
    hash: tx.txid,
  }
}

/**
 * Converts `Network` to `bchaddr.Network`
 *
 * @param {Network} network
 * @returns {string} bchaddr network
 */
export const toBCHAddressNetwork = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return bchaddr.Network.Mainnet
    case Network.Testnet:
      return bchaddr.Network.Testnet
  }
}

/**
 * Validate the BCH address.
 *
 * @param {string} address
 * @param {Network} network
 * @returns {boolean} `true` or `false`.
 */
export const validateAddress = (address: string, network: Network): boolean => {
  const toAddress = toCashAddress(address)
  return bchaddr.isValidAddress(toAddress) && bchaddr.detectAddressNetwork(toAddress) === toBCHAddressNetwork(network)
}

/**
 * Calculate fees based on fee rate and memo.
 *
 * @param {FeeRate} feeRate
 * @param {string} memo (optional)
 * @param {UnspentOutput} utxos (optional)
 * @returns {BaseAmount} The calculated fees based on fee rate and the memo.
 */
export const calcFee = (feeRate: FeeRate, memo?: string, utxos: UTXO[] = []): BaseAmount => {
  const compiledMemo = memo ? compileMemo(memo) : null
  const fee = getFee(utxos.length, feeRate, compiledMemo)
  return baseAmount(fee)
}

/**
 * Get the default fees with rates.
 *
 * @returns {FeesWithRates} The default fees and rates.
 */
export const getDefaultFeesWithRates = (): FeesWithRates => {
  const nextBlockFeeRate = 1
  const rates = standardFeeRates(nextBlockFeeRate)

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
