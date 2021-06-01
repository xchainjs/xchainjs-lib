import * as Bitcoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib
import * as sochain from './sochain-api'
import * as blockStream from './blockstream-api'
import { Address, Balance, Fees, Network, TxHash, TxParams } from '@xchainjs/xchain-client'
import { assetAmount, AssetBTC, assetToBase, BaseAmount, baseAmount } from '@xchainjs/xchain-util'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import accumulative from 'coinselect/accumulative'

import { AddressParams, BtcAddressUTXOs, ScanUTXOParam } from './types/sochain-api-types'
import { FeeRate, FeeRates, FeesWithRates } from './types/client-types'
import { BroadcastTxParams, UTXO, UTXOs } from './types/common'
import { MIN_TX_FEE } from './const'

const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
const TX_INPUT_PUBKEYHASH = 107
const TX_OUTPUT_BASE = 8 + 1 //9
const TX_OUTPUT_PUBKEYHASH = 25

export const BTC_DECIMAL = 8

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
 * @param {UTXOs} inputs The UTXOs.
 * @param {FeeRate} feeRate The fee rate.
 * @param {Buffer} data The compiled memo (Optional).
 * @returns {number} The fee amount.
 */
export const getFee = (inputs: UTXOs, feeRate: FeeRate, data: Buffer | null = null): number => {
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
 * @param {Array<number>} array
 * @returns {number} The average value.
 */
export const arrayAverage = (array: Array<number>): number => {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

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
 * Get Bitcoin network to be used with bitcoinjs.
 *
 * @param {Network} network
 * @returns {Bitcoin.Network} The BTC network.
 */
export const btcNetwork = (network: Network): Bitcoin.Network => {
  return isTestnet(network) ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
}

/**
 * Get the balances of an address.
 *
 * @param {string} sochainUrl sochain Node URL.
 * @param {Network} network
 * @param {Address} address
 * @returns {Array<Balance>} The balances of the given address.
 */
export const getBalance = async (params: AddressParams): Promise<Balance[]> => {
  try {
    const balance = await sochain.getBalance(params)
    return [
      {
        asset: AssetBTC,
        amount: balance,
      },
    ]
  } catch (error) {
    return Promise.reject(new Error('Invalid address'))
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

/**
 * Scan UTXOs from sochain.
 *
 * @param {string} sochainUrl sochain Node URL.
 * @param {Network} network
 * @param {Address} address
 * @returns {Array<UTXO>} The UTXOs of the given address.
 */
export const scanUTXOs = async ({
  sochainUrl,
  network,
  address,
  confirmedOnly = true, // default: scan only confirmed UTXOs
}: ScanUTXOParam): Promise<UTXOs> => {
  let utxos: BtcAddressUTXOs = []
  const addressParam: AddressParams = {
    sochainUrl,
    network,
    address,
  }

  if (confirmedOnly) {
    utxos = await sochain.getConfirmedUnspentTxs(addressParam)
  } else {
    utxos = await sochain.getUnspentTxs(addressParam)
  }

  return utxos.map(
    (utxo) =>
      ({
        hash: utxo.txid,
        index: utxo.output_no,
        value: assetToBase(assetAmount(utxo.value, BTC_DECIMAL)).amount().toNumber(),
        witnessUtxo: {
          value: assetToBase(assetAmount(utxo.value, BTC_DECIMAL)).amount().toNumber(),
          script: Buffer.from(utxo.script_hex, 'hex'),
        },
      } as UTXO),
  )
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
  spendPendingUTXO = false, // default: prevent spending uncomfirmed UTXOs
}: TxParams & {
  feeRate: FeeRate
  sender: Address
  network: Network
  sochainUrl: string
  spendPendingUTXO?: boolean
}): Promise<{ psbt: Bitcoin.Psbt; utxos: UTXOs }> => {
  try {
    // search only confirmed UTXOs if pending UTXO is not allowed
    const confirmedOnly = !spendPendingUTXO
    const utxos = await scanUTXOs({ sochainUrl, network, address: sender, confirmedOnly })

    if (utxos.length === 0) {
      return Promise.reject(Error('No utxos to send'))
    }

    if (!validateAddress(recipient, network)) {
      return Promise.reject(new Error('Invalid address'))
    }

    const feeRateWhole = Number(feeRate.toFixed(0))
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
    if (!inputs || !outputs) {
      return Promise.reject(Error('Insufficient Balance for transaction'))
    }

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

    return { psbt, utxos }
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Broadcast the transaction.
 *
 * @param {BroadcastTxParams} params The transaction broadcast options.
 * @returns {TxHash} The transaction hash.
 */
export const broadcastTx = async ({ network, txHex, blockstreamUrl }: BroadcastTxParams): Promise<TxHash> => {
  return await blockStream.broadcastTx({ network, txHex, blockstreamUrl })
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
  const rates: FeeRates = {
    fastest: 50,
    fast: 20,
    average: 10,
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

/**
 * Get address prefix based on the network.
 *
 * @param {Network} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: Network) => (network === 'testnet' ? 'tb1' : 'bc1')
