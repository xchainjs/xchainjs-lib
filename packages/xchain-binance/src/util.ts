import { Transfer, TransferEvent } from './types/binance-ws'
import { TransferFee, DexFees, Fee, TxType as BinanceTxType, Tx as BinanceTx, Network, Address } from './types/binance'
import { TxType, Tx, TxParams, TxHash } from '@xchainjs/xchain-client'
import { assetFromString, AssetBNB, assetToBase, assetAmount, baseToAsset } from '@xchainjs/xchain-util/lib'
import { DerivePath } from './types/common'
import { BncClient, Transaction } from '@binance-chain/javascript-sdk'
import { AminoPrefix, SignMsg } from '@binance-chain/javascript-sdk/lib/types'
import * as crypto from '@binance-chain/javascript-sdk/lib/crypto'

/**
 * Get `hash` from transfer event sent by Binance chain
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 */
export const getHashFromTransfer = (transfer?: { data?: Pick<Transfer, 'H'> }): string | undefined => transfer?.data?.H

/**
 * Get `hash` from memo
 */
export const getTxHashFromMemo = (transfer?: TransferEvent) => transfer?.data?.M.split(':')[1]

/**
 * Type guard for runtime checks of `Fee`
 */
export const isFee = (v: Fee | TransferFee | DexFees): v is Fee =>
  !!(v as Fee)?.msg_type && (v as Fee)?.fee !== undefined && (v as Fee)?.fee_for !== undefined

/**
 * Type guard for `TransferFee`
 */
export const isTransferFee = (v: Fee | TransferFee | DexFees): v is TransferFee =>
  isFee((v as TransferFee)?.fixed_fee_params) && !!(v as TransferFee)?.multi_transfer_fee

/**
 * Type guard for `DexFees`
 */
export const isDexFees = (v: Fee | TransferFee | DexFees): v is DexFees => (v as DexFees)?.dex_fee_fields?.length > 0

/**
 * Get TxType
 */
export const getTxType = (t: BinanceTxType): TxType => {
  if (t === 'TRANSFER' || t === 'DEPOSIT') return 'transfer'
  return 'unknown'
}

/**
 * Parse Tx
 */
export const parseTx = (tx: BinanceTx): Tx | null => {
  const asset = assetFromString(`${AssetBNB.chain}.${tx.txAsset}`)

  if (!asset) return null

  return {
    asset,
    from: [
      {
        from: tx.fromAddr,
        amount: assetToBase(assetAmount(tx.value, 8)),
      },
    ],
    to: [
      {
        to: tx.toAddr,
        amount: assetToBase(assetAmount(tx.value, 8)),
      },
    ],
    date: new Date(tx.timeStamp),
    type: getTxType(tx.txType),
    hash: tx.txHash,
  }
}

export const getClientUrl = (network: Network): string => {
  return network === 'testnet' ? 'https://testnet-dex.binance.org' : 'https://dex.binance.org'
}

export const createTxInfo = async ({
  asset,
  amount,
  recipient,
  memo,
  sender,
  network,
}: TxParams & { sender: Address; network: Network }): Promise<{ tx: Transaction; signMsg: SignMsg }> => {
  try {
    const accCode = crypto.decodeAddress(sender)
    const toAccCode = crypto.decodeAddress(recipient)
    const txAmount = baseToAsset(amount).amount()
    const denom = asset ? asset.symbol : AssetBNB.symbol
    const coin = {
      denom,
      amount: txAmount,
    }
    const msg = {
      inputs: [
        {
          address: accCode,
          coins: [coin],
        },
      ],
      outputs: [
        {
          address: toAccCode,
          coins: [coin],
        },
      ],
      aminoPrefix: AminoPrefix.MsgSend,
    }
    const signMsg = {
      inputs: [
        {
          address: sender,
          coins: [
            {
              amount: txAmount,
              denom,
            },
          ],
        },
      ],
      outputs: [
        {
          address: recipient,
          coins: [
            {
              amount: txAmount,
              denom,
            },
          ],
        },
      ],
    }

    const bncClient = new BncClient(getClientUrl(network))
    await bncClient.initChain()
    bncClient.setSigningDelegate(async (tx) => tx)
    const tx = await bncClient._prepareTransaction(msg, signMsg, sender, null, memo)

    return {
      tx,
      signMsg,
    }
  } catch (e) {
    return Promise.reject(e)
  }
}

export const sendRawTransaction = async (network: Network, signedBz: string): Promise<TxHash> => {
  try {
    const bncClient = new BncClient(getClientUrl(network))
    const transferResult = await bncClient.sendRawTransaction(signedBz, true)
    return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
  } catch (e) {
    return Promise.reject(e)
  }
}

export const getDerivePath = (index = 0): DerivePath => [44, 714, 0, 0, index]
