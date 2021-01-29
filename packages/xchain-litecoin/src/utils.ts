import * as Litecoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib
import * as sochain from './sochain-api'
import { Address, Balance, Fees, Network, TxHash, TxParams } from '@xchainjs/xchain-client'
import { AssetLTC, assetToString, BaseAmount, baseAmount, assetToBase, assetAmount } from '@xchainjs/xchain-util'
import { LtcAddressUTXOs, LtcAddressUTXO } from './types/sochain-api-types'
import { FeeRate, FeeRates, FeesWithRates } from './types/client-types'
import { BroadcastTxParams, DerivePath, UTXO, UTXOs } from './types/common'
import { MIN_TX_FEE } from './const'
import coininfo from 'coininfo'

const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
const TX_INPUT_PUBKEYHASH = 107
const TX_OUTPUT_BASE = 8 + 1 //9
const TX_OUTPUT_PUBKEYHASH = 25
const DUST_THRESHOLD = 1000

function inputBytes(input: UTXO): number {
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
  return Litecoin.script.compile([Litecoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
}

/**
 * Get the vault transaction fee.
 *
 * @param {UTXOs} inputs The UTXOs.
 * @param {Buffer} data The compiled memo.
 * @param {FeeRate} feeRate The fee rate.
 * @returns {number} The fee amount.
 */
export function getVaultFee(inputs: UTXOs, data: Buffer, feeRate: FeeRate): number {
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
  return vaultFee > MIN_TX_FEE ? vaultFee : MIN_TX_FEE
}

/**
 * Get the normal transaction fee.
 *
 * @param {UTXOs} inputs The UTXOs.
 * @param {FeeRate} feeRate The fee rate.
 * @returns {number} The fee amount.
 */
export function getNormalFee(inputs: UTXOs, feeRate: FeeRate): number {
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
  return normalFee > MIN_TX_FEE ? normalFee : MIN_TX_FEE
}

/**
 * Get the average value of an array.
 *
 * @param {Array<number>} array
 * @returns {number} The average value.
 */
export function arrayAverage(array: Array<number>): number {
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
 * Get Litecoin network to be used with bitcoinjs.
 *
 * @param {Network} network
 * @returns {Litecoin.Network} The LTC network.
 */
export const ltcNetwork = (network: Network): Litecoin.Network => {
  return isTestnet(network) ? coininfo.litecoin.test.toBitcoinJS() : coininfo.litecoin.main.toBitcoinJS()
}

/**
 * Get the balances of an address.
 *
 * @param {string} nodeUrl sochain Node URL.
 * @param {string} network
 * @param {string} address
 * @returns {Array<Balance>} The balances of the given address.
 */
export const getBalance = async (nodeUrl: string, network: string, address: string): Promise<Balance[]> => {
  try {
    const balance = await sochain.getBalance(nodeUrl, network, address)
    return [
      {
        asset: AssetLTC,
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
 * @param {string} address
 * @param {string} nodeUrl sochain Node URL.
 * @returns {number} The change amount.
 */
const getChange = async (valueOut: number, nodeUrl: string, network: string, address: string): Promise<number> => {
  try {
    const balances = await getBalance(nodeUrl, network, address)
    const ltcBalance = balances.find((balance) => assetToString(balance.asset) === assetToString(AssetLTC))
    let change = 0

    if (ltcBalance && ltcBalance.amount.amount().minus(valueOut).isGreaterThan(DUST_THRESHOLD)) {
      change = ltcBalance.amount.amount().minus(valueOut).toNumber()
    }
    return change
  } catch (e) {
    return Promise.reject(e)
  }
}

/**
 * Validate the LTC address.
 *
 * @param {string} address
 * @param {Network} network
 * @returns {boolean} `true` or `false`.
 */
export const validateAddress = (address: string, network: Network): boolean => {
  try {
    Litecoin.address.toOutputScript(address, ltcNetwork(network))
    return true
  } catch (error) {
    return false
  }
}

/**
 * Scan UTXOs from sochain.
 *
 * @param {string} nodeUrl sochain Node URL.
 * @param {string} network
 * @param {Address} address
 * @returns {Array<UTXO>} The UTXOs of the given address.
 */
export const scanUTXOs = async (nodeUrl: string, network: string, address: Address): Promise<UTXOs> => {
  const utxos: LtcAddressUTXOs = await sochain.getUnspentTxs(nodeUrl, network, address)

  return utxos.map(
    (utxo: LtcAddressUTXO): UTXO => {
      return {
        hash: utxo.txid,
        index: utxo.output_no,
        witnessUtxo: {
          // value: bn(utxo.value).toNumber(),
          value: assetToBase(assetAmount(utxo.value, 8)).amount().toNumber(),
          script: Buffer.from(utxo.script_hex, 'hex'),
        },
      }
    },
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
  nodeUrl,
}: TxParams & {
  feeRate: FeeRate
  sender: Address
  network: Network
  nodeUrl: string
}): Promise<{ psbt: Litecoin.Psbt; utxos: UTXOs }> => {
  try {
    const utxos = await scanUTXOs(nodeUrl, network, sender)
    if (utxos.length === 0) {
      return Promise.reject(Error('No utxos to send'))
    }

    const balance = await getBalance(nodeUrl, network, sender)
    const ltcBalance = balance.find((balance) => balance.asset.symbol === AssetLTC.symbol)
    if (!ltcBalance) {
      return Promise.reject(new Error('No ltcBalance found'))
    }

    if (!validateAddress(recipient, network)) {
      return Promise.reject(new Error('Invalid address'))
    }
    const feeRateWhole = Number(feeRate.toFixed(0))
    const compiledMemo = memo ? compileMemo(memo) : null
    const fee = compiledMemo ? getVaultFee(utxos, compiledMemo, feeRateWhole) : getNormalFee(utxos, feeRateWhole)
    if (amount.amount().plus(fee).isGreaterThan(ltcBalance.amount.amount())) {
      return Promise.reject(Error('Balance insufficient for transaction'))
    }
    const psbt = new Litecoin.Psbt({ network: ltcNetwork(network) }) // Network-specific
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
    const change = await getChange(amount.amount().toNumber() + fee, nodeUrl, network, sender)
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
export const broadcastTx = async ({ network, txHex, nodeUrl }: BroadcastTxParams): Promise<TxHash> => {
  return await sochain.broadcastTx(nodeUrl, network, txHex)
}

/**
 * Get DerivePath.
 *
 * @param {number} index (optional)
 * @returns {DerivePath} The litecoin derivation path by the index. (both mainnet and testnet)
 */
export const getDerivePath = (index = 0): DerivePath => ({
  mainnet: `84'/0'/0'/0/${index}`,
  testnet: `84'/1'/0'/0/${index}`,
})

/**
 * Calculate fees based on fee rate and memo.
 *
 * @param {FeeRate} feeRate
 * @param {string} memo
 * @returns {BaseAmount} The calculated fees based on fee rate and the memo.
 */
export const calcFee = (feeRate: FeeRate, memo?: string): BaseAmount => {
  if (memo) {
    const OP_RETURN = compileMemo(memo)
    const vaultFee = getVaultFee([], OP_RETURN, feeRate)
    return baseAmount(vaultFee)
  }
  const normalFee = getNormalFee([], feeRate)
  return baseAmount(normalFee)
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
 * @param {string} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export const getPrefix = (network: string) => (network === 'testnet' ? 'tb1' : 'bc1')
