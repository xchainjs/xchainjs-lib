import {
  Balance,
  FeeOption,
  FeeRate,
  Fees,
  FeesWithRates,
  Network,
  TxHash,
  TxParams,
  calcFees,
  standardFeeRates,
} from '@xchainjs/xchain-client'
import { Address, AssetBTC, BaseAmount, assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import * as Bitcoin from 'bitcoinjs-lib'
import accumulative from 'coinselect/accumulative'

import { BTC_DECIMAL, MIN_TX_FEE } from './const'
import * as haskoinApi from './haskoin-api'
import * as sochain from './sochain-api'
import { BroadcastTxParams, UTXO } from './types/common'
import * as HaskoinApiTypes from './types/haskoin-api-types'
import { AddressParams, BtcAddressUTXO, ScanUTXOParam } from './types/sochain-api-types'

const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
const TX_INPUT_PUBKEYHASH = 107
const TX_OUTPUT_BASE = 8 + 1 //9
const TX_OUTPUT_PUBKEYHASH = 25

const inputBytes = (input: UTXO): number => {
  return TX_INPUT_BASE + (input.witnessUtxo.script ? input.witnessUtxo.script.length : TX_INPUT_PUBKEYHASH)
}

/**
 * Compile memo.
 *
 * @param {string} memo The memo to be compiled.
 * @returns {Buffer} The compiled memo.
 */
export const compileMemo = (memo: string): Buffer => {
  const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
  return Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
}

/**
 * Get the transaction fee.
 *
 * @param {UTXO[]} inputs The UTXOs.
 * @param {FeeRate} feeRate The fee rate.
 * @param {Buffer} data The compiled memo (Optional).
 * @returns {number} The fee amount.
 */
export const getFee = (inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number => {
  let sum =
    TX_EMPTY_SIZE +
    inputs.reduce((a, x) => a + inputBytes(x), 0) +
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
export const arrayAverage = (array: number[]): number => {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

/**
 * Get Bitcoin network to be used with bitcoinjs.
 *
 * @param {Network} network
 * @returns {Bitcoin.Network} The BTC network.
 */
export const btcNetwork = (network: Network): Bitcoin.Network => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return Bitcoin.networks.bitcoin
    case Network.Testnet:
      return Bitcoin.networks.testnet
  }
}

/**
 * Get the balances of an address.
 *
 * @param {string} sochainUrl sochain Node URL.
 * @param {Network} network
 * @param {Address} address
 * @returns {Balance[]} The balances of the given address.
 */
export const getBalance = async ({
  params,
  haskoinUrl,
  confirmedOnly,
}: {
  params: AddressParams
  haskoinUrl: string
  confirmedOnly: boolean
}): Promise<Balance[]> => {
  switch (params.network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return [
        {
          asset: AssetBTC,
          amount: await haskoinApi.getBalance({ haskoinUrl, address: params.address, confirmedOnly }),
        },
      ]
    case Network.Testnet:
      return [
        {
          asset: AssetBTC,
          amount: await sochain.getBalance({ ...params, confirmedOnly }),
        },
      ]
  }
}

/**
 * Validate the BTC address.
 *
 * @param {Address} address
 * @param {Network} network
 * @returns {boolean} `true` or `false`.
 */
export const validateAddress = (address: Address, network: Network): boolean => {
  try {
    Bitcoin.address.toOutputScript(address, btcNetwork(network))
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
  txHash,
  sochainUrl,
  network,
}: {
  sochainUrl: string
  txHash: TxHash
  network: Network
}): Promise<string> => {
  // try to get hex from cache
  const txHex = txHexMap[txHash]
  if (!!txHex) return txHex
  // or get it from Sochain
  const { tx_hex } = await sochain.getTx({ hash: txHash, sochainUrl, network })
  // cache it
  txHexMap[txHash] = tx_hex
  return tx_hex
}

/**
 * Scan UTXOs from sochain.
 *
 * @param {string} sochainUrl sochain Node URL.
 * @param {Network} network
 * @param {Address} address
 * @returns {UTXO[]} The UTXOs of the given address.
 */
export const scanUTXOs = async ({
  sochainUrl,
  haskoinUrl,
  network,
  address,
  confirmedOnly = true, // default: scan only confirmed UTXOs
  withTxHex = false,
}: ScanUTXOParam): Promise<UTXO[]> => {
  switch (network) {
    case Network.Testnet: {
      const addressParam: AddressParams = {
        sochainUrl,
        network,
        address,
      }

      // Get UTXOs from Sochain
      const utxos: BtcAddressUTXO[] = confirmedOnly
        ? await sochain.getConfirmedUnspentTxs(addressParam)
        : await sochain.getUnspentTxs(addressParam)

      return await Promise.all(
        utxos.map(async (utxo) => ({
          hash: utxo.txid,
          index: utxo.output_no,
          value: assetToBase(assetAmount(utxo.value, BTC_DECIMAL)).amount().toNumber(),
          witnessUtxo: {
            value: assetToBase(assetAmount(utxo.value, BTC_DECIMAL)).amount().toNumber(),
            script: Buffer.from(utxo.script_hex, 'hex'),
          },
          txHex: withTxHex ? await getTxHex({ txHash: utxo.txid, sochainUrl, network }) : undefined,
        })),
      )
    }
    case Network.Mainnet:
    case Network.Stagenet: {
      // Get UTXOs from Haskoin
      const utxos: HaskoinApiTypes.UtxoData[] = confirmedOnly
        ? await haskoinApi.getConfirmedUnspentTxs({ address, haskoinUrl, sochainUrl, network })
        : await haskoinApi.getUnspentTxs({ address, haskoinUrl })

      return await Promise.all(
        utxos.map(async (utxo) => ({
          hash: utxo.txid,
          index: utxo.index,
          value: baseAmount(utxo.value, BTC_DECIMAL).amount().toNumber(),
          witnessUtxo: {
            value: baseAmount(utxo.value, BTC_DECIMAL).amount().toNumber(),
            script: Buffer.from(utxo.pkscript, 'hex'),
          },
          txHex: withTxHex ? await getTxHex({ txHash: utxo.txid, sochainUrl, network }) : undefined,
        })),
      )
    }
  }
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
  sochainUrl,
  haskoinUrl,
  spendPendingUTXO = false, // default: prevent spending uncomfirmed UTXOs
  withTxHex = false,
}: TxParams & {
  feeRate: FeeRate
  sender: Address
  network: Network
  sochainUrl: string
  haskoinUrl: string
  spendPendingUTXO?: boolean
  withTxHex?: boolean
}): Promise<{ psbt: Bitcoin.Psbt; utxos: UTXO[]; inputs: UTXO[] }> => {
  // search only confirmed UTXOs if pending UTXO is not allowed
  const confirmedOnly = !spendPendingUTXO
  const utxos = await scanUTXOs({ sochainUrl, haskoinUrl, network, address: sender, confirmedOnly, withTxHex })

  if (memo && memo.length > 80) {
    throw new Error('memo too long, must not be longer than 80 chars.')
  }
  if (utxos.length === 0)
    throw new Error('No confirmed UTXOs. Please wait until your balance has been confirmed on-chain.')
  if (!validateAddress(recipient, network)) throw new Error('Invalid address')

  const feeRateWhole = Math.ceil(feeRate)
  const compiledMemo = memo ? compileMemo(memo) : null

  const targetOutputs = []

  //1. add output amount and recipient to targets
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
  if (!inputs || !outputs) throw new Error('Insufficient Balance for transaction')

  const psbt = new Bitcoin.Psbt({ network: btcNetwork(network) }) // Network-specific

  // psbt add input from accumulative inputs
  inputs.forEach((utxo: UTXO) =>
    psbt.addInput({
      hash: utxo.hash,
      index: utxo.index,
      witnessUtxo: utxo.witnessUtxo,
    }),
  )

  // psbt add outputs from accumulative outputs
  outputs.forEach((output: Bitcoin.PsbtTxOutput) => {
    if (!output.address) {
      //an empty address means this is the  change ddress
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

  return { psbt, utxos, inputs }
}

/**
 * Broadcast the transaction.
 *
 * @param {BroadcastTxParams} params The transaction broadcast options.
 * @returns {TxHash} The transaction hash.
 */
export const broadcastTx = async ({ haskoinUrl, txHex }: BroadcastTxParams): Promise<TxHash> => {
  return await haskoinApi.broadcastTx({ haskoinUrl, txHex })
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
    ...standardFeeRates(20),
    [FeeOption.Fastest]: 50,
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
      return 'bc1'
    case Network.Testnet:
      return 'tb1'
  }
}
