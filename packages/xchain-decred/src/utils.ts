import {
  Address,
  //   Address,
  Balance,
  FeeRate,
  //   FeeOption,
  //   FeeRate,
  //   Fees,
  //   FeesWithRates,
  Network,
  TxHash,
  TxParams,
  //   TxHash,
  //   TxParams,
  //   calcFees,
  //   standardFeeRates,
} from '@xchainjs/xchain-client'
import {
  // assetAmount,
  AssetDCR,
  BaseAmount,
  baseAmount,
  // assetToBase,
  // BaseAmount,
  // assetAmount,
  // assetToBase,
  // baseAmount
} from '@xchainjs/xchain-util'
import * as Decred from 'decredjs-lib'

//
// import { DCR_DECIMAL, MIN_TX_FEE } from './const'
import * as dcrdata from './dcrdata-api'
import {
  BroadcastTxParams,
  UTXO,
  // BroadcastTxParams,
  // UTXO,
} from './types/common'
import {
  AddressParams,
  DcrUTXO,
  ScanUTXOParam,
  // DcrAddressUTXO,
  // ScanUTXOParam
} from './types/dcrdata-api-types'
// import { DCR_DECIMAL } from '@xchainjs/xchain-decred/src/const'
//
// const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
// const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
// const TX_INPUT_PUBKEYHASH = 107
// const TX_OUTPUT_BASE = 8 + 1 //9
// const TX_OUTPUT_PUBKEYHASH = 25
//
// const inputBytes = (input: UTXO): number => {
//   return TX_INPUT_BASE + (input.witnessUtxo.script ? input.witnessUtxo.script.length : TX_INPUT_PUBKEYHASH)
// }
// /**
//  * Compile memo.
//  *
//  * @param {string} memo The memo to be compiled.
//  * @returns {Buffer} The compiled memo.
//  */
// export const compileMemo = (memo: string): Buffer => {
//   const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
//   return Decred.script.compile([Decred.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
// }
//
/**
 * Get the transaction fee.
 *
 * @param {UTXO[]} inputs The UTXOs.
 * @param {FeeRate} feeRate The fee rate.
 * @param {Buffer} data The compiled memo (Optional).
 * @returns {number} The fee amount.
 */
export const getFee = (inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number => {
  let sum = 32 + inputs.length * 165 + 36 * 2

  if (data) {
    sum += 11 + data.length
  }
  const fee = sum * feeRate
  return fee > 10000 ? fee : 10000
}
//
// /**
//  * Get the average value of an array.
//  *
//  * @param {number[]} array
//  * @returns {number} The average value.
//  */
// export const arrayAverage = (array: number[]): number => {
//   let sum = 0
//   array.forEach((value) => (sum += value))
//   return sum / array.length
// }
//
// /**
//  * Get Bitcoin network to be used with bitcoinjs.
//  *
//  * @param {Network} network
//  * @returns {Decred.Network} The BTC network.
//  */
export const dcrNetwork = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
      return Decred.Networks.dcrdlivenet
    case Network.Testnet:
      return Decred.Networks.dcrdtestnet
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
export const getBalance = async (params: AddressParams): Promise<Balance[]> => {
  switch (params.network) {
    case Network.Mainnet:
      return [
        {
          asset: AssetDCR,
          amount: await dcrdata.getBalance(params),
        },
      ]
    case Network.Testnet:
      return [
        {
          asset: AssetDCR,
          amount: await dcrdata.getBalance(params),
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
  return Decred.Address.isValid(address, dcrNetwork(network))
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
  dcrdataUrl,
  network,
  address,
  confirmedOnly = true, // default: scan only confirmed UTXOs
}: ScanUTXOParam): Promise<DcrUTXO[]> => {
  let utxos: DcrUTXO[] = []

  const addressParam: AddressParams = {
    dcrdataUrl,
    network,
    address,
  }

  if (confirmedOnly) {
    utxos = await dcrdata.getConfirmedUnspentTxs(addressParam)
  } else {
    utxos = await dcrdata.getUnspentTxs(addressParam)
  }

  return utxos
}

function uintOrNaN(v: number) {
  if (typeof v !== 'number') return NaN
  if (!isFinite(v)) return NaN
  if (Math.floor(v) !== v) return NaN
  if (v < 0) return NaN
  return v
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
  dcrdataUrl,
  spendPendingUTXO = false, // default: prevent spending uncomfirmed UTXOs
}: TxParams & {
  feeRate: FeeRate
  sender: Address
  network: Network
  dcrdataUrl: string
  spendPendingUTXO?: boolean
  /* eslint-disable @typescript-eslint/no-explicit-any*/
}): Promise<{ tx: any; utxos: DcrUTXO[] }> => {
  // search only confirmed UTXOs if pending UTXO is not allowed
  const confirmedOnly = !spendPendingUTXO
  const utxos = await scanUTXOs({ dcrdataUrl, network, address: sender, confirmedOnly })

  if (utxos.length === 0) throw new Error('No utxos to send')
  if (!validateAddress(recipient, network)) throw new Error('Invalid address')

  let feeRateWhole = 10
  if (!feeRate || Object.keys(feeRate).length == 0) {
    feeRateWhole = Math.ceil(await dcrdata.getSuggestedTxFee(network)) // round up to whole atoms/B
  } else {
    feeRateWhole = Number(feeRate.toFixed(0))
  }
  if (!isFinite(uintOrNaN(feeRateWhole)) || feeRateWhole <= 0) throw new Error('Inoccrect feeRate')

  const transaction = new Decred.Transaction()
  // We have 3 outputs
  transaction.to(recipient, amount.amount().toNumber())
  transaction.change(sender)
  if (memo) transaction.addData(memo)
  // ============= select UTXOs as input ===================
  let inAccum = 0
  for (let i = 0; i < utxos.length; ++i) {
    const utxo = Decred.Transaction.UnspentOutput(utxos[i])
    // ignore UTXO that's NOT p2pkh
    if (!utxo.script.isPublicKeyHashOut()) continue
    const inputSize = 165 // nbytes, see https://devdocs.decred.org/developer-guides/transactions/transaction-format/
    const utxoValue = utxo.atoms
    const utxoFee = feeRateWhole * inputSize // assuming feeRate unit is atoms/B
    if (utxoFee > utxoValue) {
      if (i === utxos.length - 1) throw new Error('Insufficient funds')
      continue
    }
    transaction.from(utxos[i])
    inAccum += utxos[i].satoshis

    if (
      inAccum <
      amount
        .amount()
        .plus(transaction._estimateSize() * feeRateWhole)
        .toNumber()
    ) {
      continue
    } else {
      break
    }
  }
  // ============= END of selection ========================
  return { tx: transaction, utxos: utxos }
}

/**
 * Broadcast the transaction.
 *
 * @param {BroadcastTxParams} params The transaction broadcast options.
 * @returns {TxHash} The transaction hash.
 */
export const broadcastTx = async ({ network, txHex, dcrdataUrl }: BroadcastTxParams): Promise<TxHash> => {
  return await dcrdata.broadcastTx({ network, txHex, dcrdataUrl })
}

/**
 * Calculate fees based on fee rate and memo.
 *
 * @param {FeeRate} feeRate
 * @param {string} memo
 * @returns {BaseAmount} The calculated fees based on fee rate and the memo.
 */
export const calcFee = (feeRate: FeeRate, memo?: string): BaseAmount => {
  const fee = getFee([], feeRate, memo ? Buffer.from(memo, 'utf-8') : null)
  return baseAmount(fee)
}

/**
 * Get the default fees with rates.
 *
 * @returns {FeesWithRates} The default fees and rates.
 */
// export const getDefaultFeesWithRates = (): FeesWithRates => {
//   const rates = {
//     ...standardFeeRates(20),
//     [FeeOption.Fastest]: 50,
//   }
//
//   return {
//     fees: calcFees(rates, calcFee),
//     rates,
//   }
// }

/**
 * Get the default fees.
 *
 * @returns {Fees} The default fees.
 */
// export const getDefaultFees = (): Fees => {
//   const { fees } = getDefaultFeesWithRates()
//   return fees
// }

/**
 * Get address prefix based on the network.
 *
 * @param {Network} network
 * @returns {string} The address prefix based on the network.
 *
 **/
// export const getPrefix = (network: Network) => {
//   switch (network) {
//     case Network.Mainnet:
//       return 'bc1'
//     case Network.Testnet:
//       return 'tb1'
//   }
// }
