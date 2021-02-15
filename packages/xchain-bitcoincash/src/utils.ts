import * as bitcash from 'bitcore-lib-cash'
import { Address, Fees, Network, Tx, TxFrom, TxParams, TxTo } from '@xchainjs/xchain-client'
import { AssetBCH, BaseAmount, baseAmount } from '@xchainjs/xchain-util/lib'
import { DerivePath, FeeRate, FeeRates, FeesWithRates, Transaction } from './types'
import { getAccount, getUnspentTransactions } from './haskoin-api'

export const BCH_DECIMAL = 8
export const DEFAULT_SUGGESTED_TRANSACTION_FEE = 1

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
export const bchNetwork = (network: Network): bitcash.Networks.Network => {
  return isTestnet(network) ? bitcash.Networks.testnet : bitcash.Networks.mainnet
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
 * Decode BCH address.
 *
 * @param {string} address
 * @returns {string} Decoded BCH address.
 *
 **/
export const decodeAddress = (address: string, network: string): string => {
  const prefix = getPrefix(network)
  if (address.startsWith(prefix)) {
    return address.substring(prefix.length, address.length)
  }

  return address
}

/**
 * Encode BCH address.
 *
 * @param {string} address
 * @returns {string} Encoded BCH address.
 *
 **/
export const encodeAddress = (address: string, network: string): string => {
  const prefix = getPrefix(network)
  if (address.startsWith(prefix)) {
    return address
  }

  return getPrefix(network) + address
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
      .filter((input) => !!input.address)
      .map(
        (input) =>
          ({
            from: input.address,
            amount: baseAmount(input.value, BCH_DECIMAL),
          } as TxFrom),
      ),
    to: tx.outputs
      .filter((output) => !!output.address)
      .map(
        (output) =>
          ({
            to: output.address,
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
    bitcash.Address.fromString(address, bchNetwork(network))
    return true
  } catch (error) {
    return false
  }
}
/**
 * Scan UTXOs from sochain.
 *
 * @param {string} clientUrl sochain Node URL.
 * @param {Address} address
 * @returns {Array<UTXO>} The UTXOs of the given address.
 */
export const scanUTXOs = async (clientUrl: string, address: Address): Promise<bitcash.Transaction.UnspentOutput[]> => {
  const unspents = await getUnspentTransactions({ clientUrl, address })
  return (unspents || []).map((unspent) =>
    bitcash.Transaction.UnspentOutput.fromObject({
      address: unspent.address,
      txId: unspent.txid,
      outputIndex: unspent.index,
      script: bitcash.Script.fromHex(unspent.pkscript),
      satoshis: unspent.value,
    }),
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
  clientUrl,
}: TxParams & {
  feeRate: FeeRate
  sender: Address
  network: Network
  clientUrl: string
}): Promise<bitcash.Transaction> => {
  try {
    const utxos = await scanUTXOs(clientUrl, sender)
    if (utxos.length === 0) {
      return Promise.reject(Error('No utxos to send'))
    }

    const bchBalance = (await getAccount({ clientUrl, address: sender }))?.confirmed
    if (!bchBalance) {
      return Promise.reject(new Error('No bchBalance found'))
    }

    if (!validateAddress(recipient, network)) {
      return Promise.reject(new Error('Invalid address'))
    }

    const transaction = new bitcash.Transaction()
      .feePerByte(feeRate)
      .from(utxos)
      .to(recipient, amount.amount().toNumber())
      .change(sender)
    return memo ? transaction.addData(memo) : transaction
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
export const calcFee = (
  feeRate: FeeRate,
  memo?: string,
  utxos: bitcash.Transaction.UnspentOutput[] = [],
): BaseAmount => {
  const ramdom_address = new bitcash.PrivateKey().toAddress()
  const transaction = new bitcash.Transaction()
    .feePerByte(feeRate)
    .from(utxos)
    .to(ramdom_address, 0)
    .change(ramdom_address)

  return baseAmount(memo ? transaction.addData(memo).getFee() : transaction.getFee())
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
