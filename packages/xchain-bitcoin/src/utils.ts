import * as Bitcoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib
import * as blockChair from './blockchair-api'
import { Address, Balance, Network, TxHash, TxParams } from '@xchainjs/xchain-client/lib'
import { AssetBTC, assetToString, baseAmount } from '@xchainjs/xchain-util/lib'
import { BtcAddressUTXOs, BtcAddressUTXO } from './types/blockchair-api-types'
import { FeeRate } from './types/client-types'
import { BroadcastTxParams, DerivePath, UTXO, UTXOs } from './types/common'
import { MIN_TX_FEE } from './const'
/**
 * Bitcoin byte syzes
 */
const TX_EMPTY_SIZE = 4 + 1 + 1 + 4 //10
const TX_INPUT_BASE = 32 + 4 + 1 + 4 // 41
const TX_INPUT_PUBKEYHASH = 107
const TX_OUTPUT_BASE = 8 + 1 //9
const TX_OUTPUT_PUBKEYHASH = 25
const DUST_THRESHOLD = 1000

function inputBytes(input: UTXO): number {
  return TX_INPUT_BASE + (input.witnessUtxo.script ? input.witnessUtxo.script.length : TX_INPUT_PUBKEYHASH)
}

export const compileMemo = (memo: string): Buffer => {
  const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
  return Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script
}

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

export function arrayAverage(array: Array<number>): number {
  let sum = 0
  array.forEach((value) => (sum += value))
  return sum / array.length
}

export const isTestnet = (net: Network): boolean => {
  return net === 'testnet'
}

export const btcNetwork = (network: Network): Bitcoin.Network => {
  return isTestnet(network) ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
}

// Returns balance of address
export const getBalance = async (address: string, nodeUrl: string, nodeApiKey: string): Promise<Balance[]> => {
  try {
    // const chain = this.net === 'testnet' ? 'bitcoin/testnet' : 'bitcoin'
    const dashboardAddress = await blockChair.getAddress(nodeUrl, address, nodeApiKey)
    return [
      {
        asset: AssetBTC,
        amount: baseAmount(dashboardAddress[address].address.balance),
      },
    ]
  } catch (error) {
    return Promise.reject(new Error('Invalid address'))
  }
}

// Given a desired output, return change
const getChange = async (valueOut: number, address: string, nodeUrl: string, nodeApiKey: string): Promise<number> => {
  try {
    const balances = await getBalance(address, nodeUrl, nodeApiKey)
    const btcBalance = balances.find((balance) => assetToString(balance.asset) === assetToString(AssetBTC))
    let change = 0

    if (btcBalance && btcBalance.amount.amount().minus(valueOut).isGreaterThan(DUST_THRESHOLD)) {
      change = btcBalance.amount.amount().minus(valueOut).toNumber()
    }
    return change
  } catch (e) {
    return Promise.reject(e)
  }
}

// Will return true/false
export const validateAddress = (address: string, network: Network): boolean => {
  try {
    Bitcoin.address.toOutputScript(address, btcNetwork(network))
    return true
  } catch (error) {
    return false
  }
}

// Scans UTXOs on Address
export const scanUTXOs = async (address: Address, nodeUrl: string, nodeApiKey: string): Promise<UTXOs> => {
  const dashboardsAddress = await blockChair.getAddress(nodeUrl, address, nodeApiKey)
  const utxos: BtcAddressUTXOs = dashboardsAddress[address].utxo

  return Promise.all(
    utxos.map(
      ({ transaction_hash: hash, value, index }: BtcAddressUTXO): Promise<UTXO> =>
        new Promise((resolve, reject) =>
          blockChair
            .getRawTx(nodeUrl, hash, nodeApiKey)
            .then((txData) => {
              const script = txData[hash].decoded_raw_transaction.vout[index].scriptPubKey.hex
              // TODO: check scriptpubkey_type is op_return

              const witnessUtxo = {
                value,
                script: Buffer.from(script, 'hex'),
              }

              return resolve({
                hash,
                index,
                witnessUtxo,
                txHex: txData[hash].raw_transaction,
              })
            })
            .catch((err) => reject(err)),
        ),
    ),
  )
}

export const buildTx = async ({
  amount,
  recipient,
  memo,
  feeRate,
  sender,
  network,
  nodeUrl,
  nodeApiKey,
}: TxParams & {
  feeRate: FeeRate
  sender: Address
  network: Network
  nodeUrl: string
  nodeApiKey: string
}): Promise<{ psbt: Bitcoin.Psbt; utxos: UTXOs }> => {
  try {
    const utxos = await scanUTXOs(sender, nodeUrl, nodeApiKey)
    if (utxos.length === 0) {
      return Promise.reject(Error('No utxos to send'))
    }

    const balance = await getBalance(sender, nodeUrl, nodeApiKey)
    const btcBalance = balance.find((balance) => balance.asset.symbol === AssetBTC.symbol)
    if (!btcBalance) {
      return Promise.reject(new Error('No btcBalance found'))
    }

    if (!validateAddress(recipient, network)) {
      return Promise.reject(new Error('Invalid address'))
    }
    const feeRateWhole = Number(feeRate.toFixed(0))
    const compiledMemo = memo ? compileMemo(memo) : null
    const fee = compiledMemo ? getVaultFee(utxos, compiledMemo, feeRateWhole) : getNormalFee(utxos, feeRateWhole)
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
    const change = await getChange(amount.amount().toNumber() + fee, sender, nodeUrl, nodeApiKey)
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

export const broadcastTx = async ({ txHex, nodeUrl, nodeApiKey }: BroadcastTxParams): Promise<TxHash> => {
  return await blockChair.broadcastTx(nodeUrl, txHex, nodeApiKey)
}

export const getDerivePath = (index = 0): DerivePath => ({
  mainnet: `84'/0'/0'/0/${index}`,
  testnet: `84'/1'/0'/0/${index}`,
})
