import * as dashcore from '@dashevo/dashcore-lib'
import { Address as DashAddress } from '@dashevo/dashcore-lib/typings/Address'
import { Script } from '@dashevo/dashcore-lib/typings/script/Script'
import { Transaction } from '@dashevo/dashcore-lib/typings/transaction/Transaction'
import { Input } from '@dashevo/dashcore-lib/typings/transaction/input/Input'
import { FeeRate, Network, TxParams, UTXO } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import * as Dash from 'bitcoinjs-lib'
import * as coininfo from 'coininfo'
import accumulative from 'coinselect/accumulative'

import * as insight from './insight-api'

export const TransactionBytes = {
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
    scriptPubKey: x.scriptPubKey,
  }))

  const feeRateWhole = Number(feeRate.toFixed(0))

  const targetOutputs = [
    {
      address: recipient,
      value: amount.amount().toNumber(),
    },
  ]

  const { inputs, outputs } = accumulative(utxos, targetOutputs, feeRateWhole)
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

  const senderAddress: DashAddress = dashcore.Address.fromString(sender, network)
  tx.change(senderAddress)

  if (memo) {
    tx.addData(memo)
  }

  return { tx, utxos }
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
