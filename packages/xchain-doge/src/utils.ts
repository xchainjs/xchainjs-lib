import {
  Balance,
  FeeRate,
  Fees,
  FeesWithRates,
  Network,
  TxHash,
  TxParams,
  calcFees,
  standardFeeRates,
} from '@xchainjs/xchain-client'
import { Address, BaseAmount, assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import * as Dogecoin from 'bitcoinjs-lib'
import coininfo from 'coininfo'
import accumulative from 'coinselect/accumulative'

import { AssetDOGE, DOGE_DECIMAL, MIN_TX_FEE } from './const'
import * as nodeApi from './node-api'
import * as sochain from './sochain-api'
import { BroadcastTxParams, UTXO } from './types/common'
import { DogeAddressUTXO } from './types/sochain-api-types'

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
 * Get the balances of an address.
 *
 * @param params
 * @returns {Balance[]} The balances of the given address.
 */
export const getBalance = async (params: {
  apiKey: string
  sochainUrl: string
  network: Network
  address: string
}): Promise<Balance[]> => {
  try {
    const balance = await sochain.getBalance(params)
    return [
      {
        asset: AssetDOGE,
        amount: balance,
      },
    ]
  } catch (error) {
    throw new Error(`Could not get balances for address ${params.address}`)
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

// Stores list of txHex in memory to avoid requesting same data
const txHexMap: Record<TxHash, string> = {}

/**
 * Helper to get `hex` of `Tx`
 *
 * It will try to get it from cache before requesting it from Sochain
 */
const getTxHex = async ({
  apiKey,
  txHash,
  sochainUrl,
  network,
}: {
  apiKey: string
  sochainUrl: string
  txHash: TxHash
  network: Network
}): Promise<string> => {
  // try to get hex from cache
  const txHex = txHexMap[txHash]
  if (!!txHex) return txHex
  // or get it from Sochain
  const { tx_hex } = await sochain.getTx({ apiKey, hash: txHash, sochainUrl, network })
  // cache it
  txHexMap[txHash] = tx_hex
  return tx_hex
}

/**
 * Scan UTXOs from sochain.
 *
 * @param params
 * @returns {UTXO[]} The UTXOs of the given address.
 */
export const scanUTXOs = async ({
  apiKey,
  sochainUrl,
  network,
  address,
  withTxHex,
}: {
  apiKey: string
  sochainUrl: string
  network: Network
  address: string
  withTxHex: boolean
}): Promise<UTXO[]> => {
  const utxos: DogeAddressUTXO[] = await sochain.getUnspentTxs({
    apiKey,
    sochainUrl,
    network,
    address,
    page: 1,
  })
  return await Promise.all(
    utxos.map(async (utxo) => ({
      hash: utxo.hash,
      index: utxo.index,
      value: assetToBase(assetAmount(utxo.value, DOGE_DECIMAL)).amount().toNumber(),
      txHex: withTxHex ? await getTxHex({ apiKey, txHash: utxo.hash, sochainUrl, network }) : undefined,
    })),
  )
}

/**
 * Build transcation.
 *
 * @param {BuildParams} params The transaction build options.
 * @returns {Transaction}
 */
export const buildTx = async ({
  apiKey,
  amount,
  recipient,
  memo,
  feeRate,
  sender,
  network,
  sochainUrl,
  withTxHex = false,
}: TxParams & {
  apiKey: string
  feeRate: FeeRate
  sender: Address
  network: Network
  sochainUrl: string
  withTxHex?: boolean
}): Promise<{ psbt: Dogecoin.Psbt; utxos: UTXO[] }> => {
  if (!validateAddress(recipient, network)) throw new Error('Invalid address')

  const utxos = await scanUTXOs({ apiKey, sochainUrl, network, address: sender, withTxHex })
  if (utxos.length === 0) throw new Error('No utxos to send')
  const feeRateWhole = Number(feeRate.toFixed(0))
  const compiledMemo = memo ? compileMemo(memo) : null

  const targetOutputs = []
  //1. output to recipient
  targetOutputs.push({
    address: recipient,
    value: amount.amount().toNumber(),
  })
  //2. add output memo to targets (optional)
  if (compiledMemo) {
    targetOutputs.push({ script: compiledMemo, value: 0 })
  }
  const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)

  // .inputs and .outputs will be undefined if no solution was found
  if (!inputs || !outputs) throw new Error('Balance insufficient for transaction')

  const psbt = new Dogecoin.Psbt({ network: dogeNetwork(network) }) // Network-specific
  // TODO: Doge recommended fees is greater than the recommended by Bitcoinjs-lib (for BTC),
  //       so we need to increase the maximum fee rate. Currently, the fast rate fee is near ~750000sats/byte
  // https://thornode.ninerealms.com/thorchain/inbound_addresses?height=7526662 (09-27-2022)
  // For now we increase it by 10x
  psbt.setMaximumFeeRate(7500000)
  const params = { sochainUrl, network, address: sender }
  for (const utxo of inputs) {
    psbt.addInput({
      hash: utxo.hash,
      index: utxo.index,
      nonWitnessUtxo: Buffer.from((await sochain.getUnspentTxs ({ apiKey, hash: utxo.hash, ...params })).tx_hex, 'hex'),
    })
  }

  // Outputs
  outputs.forEach((output: Dogecoin.PsbtTxOutput) => {
    if (!output.address) {
      //an empty address means this is the  change address
      output.address = sender
    }
    if (!output.script) {
      psbt.addOutput(output)
    } else {
      //we need to add the compiled memo this way to
      //avoid dust error tx when accumulating memo output with 0 value
      if (compiledMemo) {
        psbt.addOutput({ script: compiledMemo, value: 0 })
      }
    }
  })

  return { psbt, utxos }
}

/**
 * Broadcast the transaction.
 *
 * @param {BroadcastTxParams} params The transaction broadcast options.
 * @returns {TxHash} The transaction hash.
 */
export const broadcastTx = async (params: BroadcastTxParams): Promise<TxHash> => {
  if (params.network === Network.Testnet) {
    return await nodeApi.broadcastTxToSochain(params)
  } else {
    return await nodeApi.broadcastTxToBlockCypher(params)
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
