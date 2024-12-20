import * as dashcore from '@dashevo/dashcore-lib'
import { Address as DashAddress } from '@dashevo/dashcore-lib/typings/Address'
import { Script } from '@dashevo/dashcore-lib/typings/script/Script'
import { Transaction } from '@dashevo/dashcore-lib/typings/transaction/Transaction'
import { Input } from '@dashevo/dashcore-lib/typings/transaction/input/Input'
import { FeeRate, Network } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { TxParams, UTXO } from '@xchainjs/xchain-utxo'
import * as Dash from 'bitcoinjs-lib'
import * as coininfo from 'coininfo'
import accumulative from 'coinselect/accumulative'

import * as insight from './insight-api'

/**
 * Object containing the sizes (in bytes) of various components in a Dash transaction.
 */
export const TransactionBytes = {
  Version: 2, // Size of transaction version
  Type: 2, // Size of transaction type
  InputCount: 1, // Size of input count
  OutputCount: 1, // Size of output count
  LockTime: 4, // Size of lock time
  InputPrevOutputHash: 32, // Size of input previous output hash
  InputPrevOutputIndex: 4, // Size of input previous output index
  InputScriptLength: 1, // Size of input script length
  InputSequence: 4, // Size of input sequence
  InputPubkeyHash: 107, // Size of input pubkey hash
  OutputPubkeyHash: 25, // Size of output pubkey hash
  OutputValue: 8, // Size of output value
  OutputOpReturn: 1, // Size of output OP_RETURN
  OutputScriptLength: 1, // Size of output script length
}

/**
 * Minimum transaction fee in duff (smallest unit of Dash).
 */
export const TX_MIN_FEE = 1000

/**
 * Threshold value for dust amount in Dash transactions.
 */
export const TX_DUST_THRESHOLD = dashcore.Transaction.DUST_AMOUNT

/**
 * Function to determine the Dash network based on the provided network type.
 * @param {Network} network The network type (Mainnet, Testnet, or Stagenet).
 * @returns {Dash.Network} The Dash network information.
 */
export const dashNetwork = (network: Network): Dash.Network => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return coininfo.dash.main.toBitcoinJS() // Convert Dash mainnet to BitcoinJS format
    case Network.Testnet:
      return coininfo.dash.test.toBitcoinJS() // Convert Dash testnet to BitcoinJS format
  }
}

/**
 * Function to validate a Dash address for a given network.
 * @param {Address} address The Dash address to validate.
 * @param {Network} network The network type (Mainnet, Testnet, or Stagenet).
 * @returns {boolean} True if the address is valid for the network, false otherwise.
 */
export const validateAddress = (address: Address, network: Network): boolean => {
  try {
    Dash.address.toOutputScript(address, dashNetwork(network)) // Convert address to output script
    return true // Address is valid
  } catch (error) {
    return false // Address is invalid
  }
}

/**
 * Function to build a Dash transaction.
 * @param {TxParams} params Transaction parameters including amount, recipient, memo, fee rate, sender, and network.
 * @returns {Promise<{ tx: Transaction; utxos: UTXO[] }>} Promise that resolves with the built transaction and its UTXOs.
 */
export const buildTx = async ({
  amount,
  recipient,
  memo,
  feeRate,
  sender,
  network,
}: TxParams & {
  feeRate: FeeRate
  sender: Address
  network: Network
  withTxHex?: boolean
}): Promise<{ tx: Transaction; utxos: UTXO[]; inputs: UTXO[] }> => {
  // Validate recipient address
  if (!validateAddress(recipient, network)) throw new Error('Invalid address')

  // Retrieve UTXOs for the sender address
  const insightUtxos = await insight.getAddressUtxos({ network, address: sender })
  if (insightUtxos.length === 0) throw new Error('No UTXOs to send')

  // Map UTXOs to required format
  const utxos: UTXO[] = insightUtxos.map((x) => ({
    hash: x.txid,
    index: x.vout,
    value: x.satoshis,
    scriptPubKey: x.scriptPubKey,
  }))

  // Convert fee rate to integer
  const feeRateWhole = Number(feeRate.toFixed(0))

  // Define target outputs
  const targetOutputs = [
    {
      address: recipient,
      value: amount.amount().toNumber(), // Convert amount to number
    },
  ]

  // Calculate inputs and outputs for the transaction
  const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)
  if (!inputs || !outputs) throw new Error('Insufficient balance for transaction')

  // Initialize new Dash transaction
  const tx: Transaction = new dashcore.Transaction().to(recipient, amount.amount().toNumber())

  // Add inputs to the transaction
  inputs.forEach((utxo: UTXO) => {
    const insightUtxo = insightUtxos.find((x) => x.txid === utxo.hash && x.vout == utxo.index)
    if (insightUtxo === undefined) {
      throw new Error('Unable to match accumulative inputs with insight UTXOs')
    }
    const scriptBuffer: Buffer = Buffer.from(insightUtxo.scriptPubKey, 'hex')
    const script: Script = new dashcore.Script(scriptBuffer)
    const input: Input = new dashcore.Transaction.Input.PublicKeyHash({
      prevTxId: Buffer.from(insightUtxo.txid, 'hex'),
      outputIndex: insightUtxo.vout,
      script: '',
      output: new dashcore.Transaction.Output({
        satoshis: utxo.value,
        script,
      }),
    })
    tx.uncheckedAddInput(input)
  })

  // Define sender address
  const senderAddress: DashAddress = dashcore.Address.fromString(sender, network)
  tx.change(senderAddress)

  // Add memo to the transaction if provided
  if (memo) {
    tx.addData(memo)
  }

  return { tx, utxos, inputs } // Return the built transaction and its UTXOs
}

/**
 * Function to get the prefix for a given network.
 * @param {Network} network The network type (Mainnet, Testnet, or Stagenet).
 * @returns {string} The prefix for the network.
 */
export const getPrefix = (network: Network): string => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'X' // Mainnet and Stagenet prefix
    case Network.Testnet:
      return 'y' // Testnet prefix
  }
}
