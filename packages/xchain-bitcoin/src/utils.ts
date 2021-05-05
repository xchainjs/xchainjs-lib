import * as Bitcoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib
import * as sochain from './sochain-api'
import * as blockStream from './blockstream-api'
import { Address, Balance, Fees, Network, TxHash, TxParams } from '@xchainjs/xchain-client'
import { assetAmount, AssetBTC, assetToBase, assetToString, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import { AddressParams, BtcAddressUTXOs } from './types/sochain-api-types'
import { FeeRate, FeeRates, FeesWithRates, GetChangeParams } from './types/client-types'
import { BroadcastTxParams, UTXO, UTXOs } from './types/common'
import { MIN_TX_FEE } from './const'

const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
const TX_INPUT_PUBKEYHASH = 107
const TX_OUTPUT_BASE = 8 + 1 //9
const TX_OUTPUT_PUBKEYHASH = 25
const DUST_THRESHOLD = 1000

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
 * Get the balance changes amount.
 *
 * @param {number} valueOut
 * @param {Address} address
 * @param {string} sochainUrl sochain Node URL.
 * @returns {number} The change amount.
 */
const getChange = async ({ valueOut, sochainUrl, network, address }: GetChangeParams): Promise<number> => {
  try {
    const balances = await getBalance({ sochainUrl, network, address })
    const [btcBalance] = balances.filter((balance) => assetToString(balance.asset) === assetToString(AssetBTC))
    let change = 0

    if (btcBalance && btcBalance.amount.amount().minus(valueOut).isGreaterThan(DUST_THRESHOLD)) {
      change = btcBalance.amount.amount().minus(valueOut).toNumber()
    }
    return change
  } catch (e) {
    return Promise.reject(e)
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
export const scanUTXOs = async (params: AddressParams): Promise<UTXOs> => {
  const utxos: BtcAddressUTXOs = await sochain.getUnspentTxs(params)

  return utxos.map(
    (utxo) =>
      ({
        hash: utxo.txid,
        index: utxo.output_no,
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
}: TxParams & {
  feeRate: FeeRate
  sender: Address
  network: Network
  sochainUrl: string
}): Promise<{ psbt: Bitcoin.Psbt; utxos: UTXOs }> => {
  try {
    const utxos = await scanUTXOs({ sochainUrl, network, address: sender })
    if (utxos.length === 0) {
      return Promise.reject(Error('No utxos to send'))
    }

    const balance = await getBalance({ sochainUrl, network, address: sender })
    const [btcBalance] = balance.filter((balance) => balance.asset.symbol === AssetBTC.symbol)
    if (!btcBalance) {
      return Promise.reject(new Error('No btcBalance found'))
    }

    if (!validateAddress(recipient, network)) {
      return Promise.reject(new Error('Invalid address'))
    }
    const feeRateWhole = Number(feeRate.toFixed(0))
    const compiledMemo = memo ? compileMemo(memo) : null
    const fee = getFee(utxos, feeRateWhole, compiledMemo)
    if (amount.amount().plus(fee).isGreaterThan(btcBalance.amount.amount())) {
      return Promise.reject(Error('Balance insufficient for transaction'))
    }
    const psbt = new Bitcoin.Psbt({ network: btcNetwork(network) }) // Network-specific
    //Inputs
    utxos.forEach((utxo) =>
      psbt.addInput({
        hash: utxo.hash,
        index: utxo.index,
        witnessUtxo: utxo.witnessUtxo,
      }),
    )

    // Outputs
    psbt.addOutput({ address: recipient, value: amount.amount().toNumber() }) // Add output {address, value}
    const change = await getChange({ valueOut: amount.amount().toNumber() + fee, sochainUrl, network, address: sender })
    if (change > 0) {
      psbt.addOutput({ address: sender, value: change }) // Add change
    }
    if (compiledMemo) {
      // if memo exists
      psbt.addOutput({ script: compiledMemo, value: 0 }) // Add OP_RETURN {script, value}
    }

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

// /**
//  * Get DerivePath.
//  *
//  * @param {number} index (optional)
//  * @returns {DerivePath} The bitcoin derivation path by the index. (both mainnet and testnet)
//  */
// export const getDerivePath = (index = 0): DerivePath => ({
//   mainnet: `84'/0'/0'/0/${index}`,
//   testnet: `84'/1'/0'/0/${index}`,
// })

// /**
//  * Get default root paths
//  * @param {Network} network
//  * @returns default root path
//  */
// export const getRootPath = (net: Network): string => {
//   const rootPaths = {
//     mainnet: `84'/0'/0'/0/`,
//     testnet: `84'/1'/0'/0/`,
//   }
//   return rootPaths[net]
// }

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
