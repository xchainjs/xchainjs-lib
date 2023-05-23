import * as dashcore from '@dashevo/dashcore-lib'
import { Address as DashAddress } from '@dashevo/dashcore-lib/typings/Address'
import { Script } from '@dashevo/dashcore-lib/typings/script/Script'
import { Transaction } from '@dashevo/dashcore-lib/typings/transaction/Transaction'
import { Input } from '@dashevo/dashcore-lib/typings/transaction/input/Input'
import {
  FeeOption,
  FeeRate,
  Fees,
  FeesWithRates,
  Network,
  TxParams,
  calcFees,
  standardFeeRates,
} from '@xchainjs/xchain-client'
import { Address, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import * as Dash from 'bitcoinjs-lib'
import * as coininfo from 'coininfo'

import * as insight from './insight-api'

export type UTXO = {
  hash: string
  index: number
  value: number
  txHex?: string
}

const TransactionBytes = {
  Version: 2,
  Type: 2,
  InputCount: 1,
  OutputCount: 1,
  LockTime: 4,
  InputPrevOutputHash: 32,
  InputPrevOutputIndex: 4,
  InputScriptLength: 1,
  InputSequence: 4,
  InputPubkeyHash: 107,
  OutputPubkeyHash: 25,
  OutputValue: 8,
  OutputOpReturn: 1,
  OutputScriptLength: 1,
}

export const TX_MIN_FEE = 1000
export const TX_DUST_THRESHOLD = dashcore.Transaction.DUST_AMOUNT

function accumulative(utxos: any[], outputs: any[], feeRate: number): { inputs: any[]; outputs: any[]; fee: number } {
  const TxEmptySize =
    TransactionBytes.Version +
    TransactionBytes.Type +
    TransactionBytes.InputCount +
    TransactionBytes.OutputCount +
    TransactionBytes.LockTime
  const TxInputBase =
    TransactionBytes.InputPrevOutputHash +
    TransactionBytes.InputPrevOutputIndex +
    TransactionBytes.InputScriptLength +
    TransactionBytes.InputSequence
  const TxOutputBase = TransactionBytes.OutputValue + TransactionBytes.OutputScriptLength

  if (!Number.isInteger(feeRate) || feeRate < 0) {
    throw new Error('feeRate must be a positive integral number')
  }

  const inputs: any[] = []
  const outputValueTotal = outputs.reduce((p: any, c: any) => p + c.value, 0)
  const outputByteLengthTotal = outputs.reduce(
    (p: any, c: any) => p + TxOutputBase + (c?.script?.length || TransactionBytes.OutputPubkeyHash),
    0,
  )

  let inputValueAccum = 0
  let bytesAccum = TxEmptySize + outputByteLengthTotal
  let feeAccum = bytesAccum * feeRate

  for (const utxo of utxos) {
    if (inputValueAccum >= outputValueTotal + feeAccum) {
      break
    }
    const byteLength = TxInputBase + (utxo?.script?.length || TransactionBytes.InputPubkeyHash)
    const fee = feeRate * byteLength
    if (fee > utxo.value) {
      continue
    }
    bytesAccum += byteLength
    inputValueAccum += utxo.value
    feeAccum += fee
    inputs.push(utxo)
  }

  const changeOutputByteLength = TxOutputBase + TransactionBytes.OutputPubkeyHash
  const feeAfterExtraOutput = feeRate * (bytesAccum + changeOutputByteLength)
  const remainderAfterExtraOutput = inputValueAccum - (outputValueTotal + feeAfterExtraOutput)

  if (remainderAfterExtraOutput > TX_DUST_THRESHOLD) {
    outputs = outputs.concat({ value: remainderAfterExtraOutput })
    feeAccum += changeOutputByteLength * feeRate
  }

  return { inputs, outputs, fee: feeAccum }
}

export function getFee(inputCount: number, feeRate: FeeRate, data: Buffer | null = null): number {
  let sum =
    TransactionBytes.Version +
    TransactionBytes.Type +
    TransactionBytes.InputCount +
    inputCount *
      (TransactionBytes.InputPrevOutputHash +
        TransactionBytes.InputPrevOutputIndex +
        TransactionBytes.InputScriptLength +
        TransactionBytes.InputPubkeyHash +
        TransactionBytes.InputSequence) +
    TransactionBytes.OutputCount +
    2 * (TransactionBytes.OutputValue + TransactionBytes.OutputScriptLength + TransactionBytes.OutputPubkeyHash) +
    TransactionBytes.LockTime
  if (data) {
    sum +=
      TransactionBytes.OutputValue + TransactionBytes.OutputScriptLength + TransactionBytes.OutputOpReturn + data.length
  }
  const fee = sum * feeRate
  return fee > TX_MIN_FEE ? fee : TX_MIN_FEE
}

export const dashNetwork = (network: Network): Dash.Network => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return coininfo.dash.main.toBitcoinJS()
    case Network.Testnet:
      return coininfo.dash.test.toBitcoinJS()
  }
}

export const validateAddress = (address: Address, network: Network): boolean => {
  try {
    Dash.address.toOutputScript(address, dashNetwork(network))
    return true
  } catch (error) {
    return false
  }
}

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
}): Promise<{ tx: Transaction; utxos: UTXO[] }> => {
  if (!validateAddress(recipient, network)) throw new Error('Invalid address')

  const insightUtxos = await insight.getAddressUtxos({ network, address: sender })
  if (insightUtxos.length === 0) throw new Error('No utxos to send')

  const utxos: UTXO[] = insightUtxos.map((x) => ({
    hash: x.txid,
    index: x.vout,
    value: x.satoshis,
  }))

  const targetOutputs = [
    {
      address: recipient,
      value: amount.amount().toNumber(),
    },
  ]

  const { inputs, outputs } = accumulative(utxos, targetOutputs, Number(feeRate.toFixed(0)))
  if (!inputs || !outputs) throw new Error('Balance insufficient for transaction')

  const tx: Transaction = new dashcore.Transaction().to(recipient, amount.amount().toNumber())

  inputs.forEach((utxo: UTXO) => {
    const insightUtxo = insightUtxos.find((x) => {
      return x.txid === utxo.hash && x.vout == utxo.index
    })
    if (insightUtxo === undefined) {
      throw new Error('Unable to match accumulative inputs with insight utxos')
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

  const changeOutput = outputs.find((o) => o.address === undefined)
  if (changeOutput) {
    const changeAddress: DashAddress = dashcore.Address.fromString(sender, network)
    const changeScript: Script = new dashcore.Script.buildPublicKeyHashOut(changeAddress)
    tx.addOutput(
      new dashcore.Transaction.Output({
        script: changeScript,
        satoshis: changeOutput.value,
      }),
    )
  }

  if (memo) {
    tx.addData(memo)
  }

  return { tx, utxos }
}

export const calcFee = (feeRate: FeeRate, memo?: string, utxos: UTXO[] = []): BaseAmount => {
  const script: Script = dashcore.Script.buildDataOut(`${memo}`, 'utf8')
  // @ts-ignore
  const scriptBuffer: Buffer = script.toBuffer()
  const fee = getFee(utxos.length, feeRate, scriptBuffer)
  return baseAmount(fee)
}

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

export const getDefaultFees = (): Fees => {
  const { fees } = getDefaultFeesWithRates()
  return fees
}

export const getPrefix = (network: Network) => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return 'X'
    case Network.Testnet:
      return 'y'
  }
}
