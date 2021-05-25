const bitcash = require('@psf/bitcoincashjs-lib')

import * as bchaddr from 'bchaddrjs'
import coininfo from 'coininfo'
import { Address, Balance, Fees, Network, Tx, TxFrom, TxParams, TxTo } from '@xchainjs/xchain-client'
import { AssetBCH, BaseAmount, baseAmount } from '@xchainjs/xchain-util/lib'
import {
  DerivePath,
  FeeRate,
  FeeRates,
  FeesWithRates,
  Transaction,
  AddressParams,
  GetChangeParams,
  UTXOs,
  UTXO,
  TransactionInput,
  TransactionOutput,
} from './types'
import { getAccount, getRawTransaction, getUnspentTransactions } from './haskoin-api'
import { Network as BCHNetwork, TransactionBuilder } from './types/bitcoincashjs-types'

export const BCH_DECIMAL = 8
export const DEFAULT_SUGGESTED_TRANSACTION_FEE = 1

const DUST_THRESHOLD = 1000
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
 * Get the balances of an address.
 *
 * @param {AddressParams} params
 * @returns {Array<Balance>} The balances of the given address.
 */
export const getBalance = async (params: AddressParams): Promise<Balance[]> => {
  try {
    const account = await getAccount(params)
    if (!account) {
      return Promise.reject(new Error('No bchBalance found'))
    }

    const confirmed = baseAmount(account.confirmed, BCH_DECIMAL)
    const unconfirmed = baseAmount(account.unconfirmed, BCH_DECIMAL)

    account.confirmed
    return [
      {
        asset: AssetBCH,
        amount: baseAmount(confirmed.amount().plus(unconfirmed.amount()), BCH_DECIMAL),
      },
    ]
  } catch (error) {
    return Promise.reject(new Error('Invalid address'))
  }
}

/**
 * Get the balance changes amount.
 *
 * @param {GetChangeParams} params
 * @returns {number} The change amount.
 */
const getChange = async ({ valueOut, bchBalance }: GetChangeParams): Promise<number> => {
  try {
    let change = 0
    if (bchBalance.amount.amount().minus(valueOut).isGreaterThan(DUST_THRESHOLD)) {
      change = bchBalance.amount.amount().minus(valueOut).toNumber()
    }
    return change
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Get DerivePath.
 *
 * @param {number} index (optional)
 * @returns {DerivePath} The bitcoin cash derivation path by the index. (both mainnet and testnet)
 */
export const getDerivePath = (index = 0): DerivePath => ({
  mainnet: `m/44'/145'/0'/0/${index}`,
  testnet: `m/44'/1'/0'/0/${index}`,
})

/**
 * Check if give network is a testnet.
 *
 * @param {Network} network
 * @returns {boolean} `true` or `false`
 */
export const isTestnet = (network: Network): boolean => {
  return network === 'testnet'
}

/**
 * Get BCH network to be used with bitcore-lib.
 *
 * @param {Network} network
 * @returns {} The BCH network.
 */
export const bchNetwork = (network: Network): BCHNetwork => {
  return isTestnet(network) ? coininfo.bitcoincash.test.toBitcoinJS() : coininfo.bitcoincash.main.toBitcoinJS()
}

/**
 * Get address prefix based on the network.
 *
 * @param {string} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: string) => (network === 'testnet' ? 'bchtest:' : 'bitcoincash:')

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
    type: 'transfer',
    hash: tx.txid,
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
  try {
    bitcash.address.toOutputScript(toLegacyAddress(address), bchNetwork(network))
    return true
  } catch (error) {
    return false
  }
}
/**
 * Scan UTXOs from sochain.
 *
 * @param {string} haskoinUrl sochain Node URL.
 * @param {Address} address
 * @returns {Array<UTXO>} The UTXOs of the given address.
 */
export const scanUTXOs = async (haskoinUrl: string, address: Address): Promise<UTXOs> => {
  const unspents = await getUnspentTransactions({ haskoinUrl, address })
  const utxos: UTXOs = []

  for (const utxo of unspents || []) {
    utxos.push({
      hash: utxo.txid,
      index: utxo.index,
      witnessUtxo: {
        value: utxo.value,
        script: bitcash.script.compile(Buffer.from(utxo.pkscript, 'hex')),
      },
      address: utxo.address,
      txHex: await getRawTransaction({ haskoinUrl, txId: utxo.txid }),
    } as UTXO)
  }

  return utxos
}

/**
 * Build transcation.
 *
 * @param {BuildParams} params The transaction build options.
 * @returns {Transaction}
 */
export const buildTx = async ({
  amount,
  recipient,
  memo,
  feeRate,
  sender,
  network,
  haskoinUrl,
}: TxParams & {
  feeRate: FeeRate
  sender: Address
  network: Network
  haskoinUrl: string
}): Promise<{
  builder: TransactionBuilder
  utxos: UTXOs
}> => {
  try {
    const sendAmount = amount.amount().toNumber()

    const utxos = await scanUTXOs(haskoinUrl, sender)
    if (utxos.length === 0) {
      return Promise.reject(Error('No utxos to send'))
    }

    const balance = await getBalance({ haskoinUrl, address: sender })
    const [bchBalance] = balance.filter((balance) => balance.asset.symbol === AssetBCH.symbol)
    if (!bchBalance) {
      return Promise.reject(new Error('No bchBalance found'))
    }

    if (!validateAddress(recipient, network)) {
      return Promise.reject(new Error('Invalid address'))
    }

    const feeRateWhole = Number(feeRate.toFixed(0))
    const compiledMemo = memo ? compileMemo(memo) : null
    const fee = getFee(utxos.length, feeRateWhole, compiledMemo)
    if (amount.amount().plus(fee).isGreaterThan(bchBalance.amount.amount())) {
      return Promise.reject(Error('Balance insufficient for transaction'))
    }

    const change = await getChange({ valueOut: sendAmount + fee, bchBalance })

    const transactionBuilder = new bitcash.TransactionBuilder(bchNetwork(network))

    utxos.forEach((utxo) =>
      transactionBuilder.addInput(bitcash.Transaction.fromBuffer(Buffer.from(utxo.txHex, 'hex')), utxo.index),
    )

    // Outputs
    transactionBuilder.addOutput(toLegacyAddress(recipient), sendAmount) // Add output {address, value}
    if (change > 0) {
      transactionBuilder.addOutput(toLegacyAddress(sender), change) // Add change
    }
    if (compiledMemo) {
      // if memo exists
      transactionBuilder.addOutput(compiledMemo, 0) // Add OP_RETURN {script, value}
    }

    return {
      builder: transactionBuilder,
      utxos,
    }
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Calculate fees based on fee rate and memo.
 *
 * @param {FeeRate} feeRate
 * @param {string} memo (optional)
 * @param {UnspentOutput} utxos (optional)
 * @returns {BaseAmount} The calculated fees based on fee rate and the memo.
 */
export const calcFee = (feeRate: FeeRate, memo?: string, utxos: UTXOs = []): BaseAmount => {
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
  const rates: FeeRates = {
    fastest: nextBlockFeeRate * 5,
    fast: nextBlockFeeRate * 1,
    average: nextBlockFeeRate * 0.5,
  }

  const fees: Fees = {
    type: 'byte',
    fast: calcFee(rates.fast),
    average: calcFee(rates.average),
    fastest: calcFee(rates.fastest),
  }

  return {
    fees,
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
