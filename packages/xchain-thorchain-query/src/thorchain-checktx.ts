import { Saver, Tx, TxDetailsResponse, TxSignersResponse } from '@xchainjs/xchain-thornode'
import {
  Asset,
  Chain,
  CryptoAmount,
  TokenAsset,
  assetFromStringEx,
  assetToString,
  baseAmount,
  isSynthAsset,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { DefaultChainAttributes } from './chain-defaults'
import { ThorchainCache } from './thorchain-cache'
import { ChainAttributes, CompatibleAsset } from './types'
import { AssetRuneNative, THORChain, getCryptoAmountWithNotation, isAssetRuneNative } from './utils'
export enum TxType {
  Swap = 'Swap',
  AddLP = 'AddLP',
  WithdrawLP = 'WithdrawLP',
  AddSaver = 'AddSaver',
  WithdrawSaver = 'WithdrawSaver',
  Refund = 'Refund',
  Other = 'Other',
  Unknown = 'Unknown',
}

// The action is the first memo field. Match that whole field. A letter inside another
// action, such as the "s" in "swap", is not itself an action.
export const txTypeFromMemo = (memo: string): TxType => {
  const [operation = '', asset = ''] = memo.split(':')
  const action = operation.trim().toLowerCase()
  const synth = asset.includes('/')
  switch (action) {
    case '=':
    case 's':
    case 'swap':
      return TxType.Swap
    case '+':
    case 'a':
    case 'add':
      return synth ? TxType.AddSaver : TxType.AddLP
    case '-':
    case 'wd':
    case 'withdraw':
      return synth ? TxType.WithdrawSaver : TxType.WithdrawLP
    case 'refund':
      return TxType.Refund
    case 'out':
    case 'outbound':
      return TxType.Other
    default:
      return TxType.Unknown
  }
}
export enum InboundStatus {
  Observed_Consensus = 'Observed_Consensus',
  Observed_Incomplete = 'Observed_Incomplete',
  Unknown = 'Unknown',
}
export enum SwapStatus {
  Complete = 'Complete',
  Complete_Refunded = 'Complete_Refunded',
  Complete_Below_Dust = 'Complete_Below_Dust',
  Incomplete = 'Incomplete',
}
export enum AddLpStatus {
  Complete = 'Complete',
  Complete_Refunded = 'Complete_Refunded',
  Complete_Below_Dust = 'Complete_Below_Dust',
  Incomplete = 'Incomplete',
}
export enum WithdrawStatus {
  Complete = 'Complete',
  Incomplete = 'Incomplete',
  Complete_Refunded = 'Complete_Refunded',
}
export enum RefundStatus {
  Complete = 'Complete',
  Incomplete = 'Incomplete',
  Complete_Refunded = 'Complete_Refunded',
}
export enum AddSaverStatus {
  Complete = 'Complete',
  Complete_Refunded = 'Complete_Refunded',
  Complete_Below_Dust = 'Complete_Below_Dust',
  Incomplete = 'Incomplete',
}
export type SwapInfo = {
  status: SwapStatus
  toAddress: string
  minimumAmountOut: CryptoAmount
  affliateFee: CryptoAmount
  expectedOutBlock: number
  expectedOutDate: Date
  confirmations: number
  expectedAmountOut: CryptoAmount
  actualAmountOut?: CryptoAmount
}
export type AddLpInfo = {
  status: AddLpStatus
  isSymmetric: boolean
  assetTx?: InboundTx
  runeTx?: InboundTx
  assetConfirmationDate?: Date
  pool: Asset | TokenAsset
}
export type WithdrawSaverInfo = {
  status: WithdrawStatus
  withdrawalAmount: CryptoAmount
  expectedConfirmationDate: Date
  thorchainHeight: number
  finalisedHeight: number
  outboundBlock: number
  estimatedWaitTime: number
}
export type WithdrawInfo = {
  status: WithdrawStatus
  withdrawalAmount: CryptoAmount
  expectedConfirmationDate: Date
  thorchainHeight: number
  outboundHeight: number
  estimatedWaitTime: number
}
export type RefundInfo = {
  status: RefundStatus
  refundAmount: CryptoAmount
  toAddress: string
  expectedConfirmationDate: Date
  finalisedHeight: number
  thorchainHeight: number
  outboundBlock: number
  estimatedWaitTime: number
}
export type AddSaverInfo = {
  status: AddSaverStatus
  assetTx?: InboundTx
  saverPos?: Saver
}
type InboundTx = {
  status: InboundStatus
  date: Date
  block: number
  expectedConfirmationBlock: number
  expectedConfirmationDate: Date
  amount: CryptoAmount
  fromAddress: string
  memo: string
}
export type TXProgress = {
  txType: TxType
  inboundObserved?: InboundTx
  swapInfo?: SwapInfo
  addLpInfo?: AddLpInfo
  addSaverInfo?: AddSaverInfo
  withdrawLpInfo?: WithdrawInfo
  withdrawSaverInfo?: WithdrawSaverInfo
  refundInfo?: RefundInfo
}
export class TransactionStage {
  readonly thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>
  constructor(thorchainCache: ThorchainCache, chainAttributes = DefaultChainAttributes) {
    this.thorchainCache = thorchainCache
    this.chainAttributes = chainAttributes
  }
  public async checkTxProgress(inboundTxHash: string): Promise<TXProgress> {
    let txData
    try {
      if (inboundTxHash.length < 1) throw Error('inboundTxHash too short')
      txData = await this.thorchainCache.thornode.getTxDetail(inboundTxHash)
      // console.log(JSON.stringify(txData, null, 2))
    } catch (_error) {
      return {
        txType: TxType.Unknown,
      }
    }
    const progress = await this.determineObserved(txData)

    switch (progress.txType) {
      case TxType.Swap:
        await this.checkSwapProgress(txData, progress)
        break
      case TxType.AddLP:
        await this.checkAddLpProgress(txData, progress)
        break
      case TxType.WithdrawLP:
        await this.checkWithdrawLpProgress(txData, progress)
        break
      case TxType.AddSaver:
        await this.checkAddSaverProgress(txData, progress)
        break
      case TxType.WithdrawSaver:
        await this.checkWithdrawSaverProgress(txData, progress)
        break
      case TxType.Refund:
        await this.checkRefund(txData, progress)
        break
      case TxType.Other:
        break
      default:
        break
    }

    return progress
  }
  private async checkSwapProgress(txData: TxDetailsResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      const memo = txData.tx.tx.memo ?? ''
      const memoFields = this.parseSwapMemo(memo)
      const assetOut = assetFromStringEx(memoFields.asset.toUpperCase())
      const outTxs = txData.out_txs ?? []
      const outboundTxs = outTxs.filter((tx) => tx.memo?.toUpperCase().includes('OUT'))
      const refunded = outTxs.some((tx) => tx.memo?.toUpperCase().includes('REFUND'))
      let swapStatus = SwapStatus.Incomplete
      if (outboundTxs.length > 0) swapStatus = SwapStatus.Complete
      else if (refunded) swapStatus = SwapStatus.Complete_Refunded
      const chainHeight = await this.blockHeight(AssetRuneNative)

      const outboundHeight = Number(txData.outbound_height ?? txData.finalised_height)
      const expectedOutDate = await this.blockToDate(THORChain, txData, outboundHeight)
      const confirmations = chainHeight > outboundHeight ? chainHeight - outboundHeight : 0
      const minimumAmountOut = await this.protocolAmount(memoFields.limit ?? '0', assetOut)
      const actualAmountOut = outboundTxs.length > 0 ? await this.outboundTotal(outboundTxs, assetOut) : undefined
      const affliateFee = await this.affiliateFeeAmount(memoFields.affiliateFee, actualAmountOut, assetOut)
      const swapInfo: SwapInfo = {
        status: swapStatus,
        expectedOutBlock: outboundHeight,
        expectedOutDate,
        expectedAmountOut: minimumAmountOut, // TODO call estimateSwap()
        confirmations,
        minimumAmountOut,
        affliateFee,
        toAddress: memoFields.destAddress,
        actualAmountOut,
      }
      progress.swapInfo = swapInfo
    }
  }
  private parseSwapMemo(memo: string) {
    // SWAP:ASSET:DESTADDR:LIM/INTERVAL/QUANTITY:AFFILIATE:FEE
    // LIM is 1e8. INTERVAL and QUANTITY are not amounts, and FEE is basis points.
    const parts = memo.split(`:`)
    const action = parts[0]
    const asset = parts[1]
    const destAddress = parts[2]
    const limitPart = parts.length > 3 ? parts[3].split('/')[0] : ''
    const limit = limitPart.length > 0 ? limitPart : undefined
    const affiliateAddress = parts.length > 4 && parts[4].length > 0 ? parts[4] : undefined
    const affiliateFee = parts.length > 5 && parts[5].length > 0 ? parts[5] : undefined
    return { action, asset, destAddress, limit, affiliateAddress, affiliateFee }
  }
  private async getCryptoAmount(baseAmt: string, asset: CompatibleAsset): Promise<CryptoAmount<CompatibleAsset>> {
    const decimals =
      THORChain === asset.chain ? 8 : Number(await this.thorchainCache.midgardQuery.getDecimalForAsset(asset))
    return new CryptoAmount(baseAmount(baseAmt, decimals), asset)
  }

  // Swap limits in the memo are 1e8, including on chains whose native decimals are not 8.
  private async protocolAmount(amount1e8: string, asset: CompatibleAsset): Promise<CryptoAmount<CompatibleAsset>> {
    const protocol = new CryptoAmount(baseAmount(amount1e8, 8), asset)
    if (asset.chain === THORChain) return protocol
    const decimals = Number(await this.thorchainCache.midgardQuery.getDecimalForAsset(asset))
    if (!Number.isFinite(decimals) || decimals < 0 || decimals === 8) return protocol
    return getCryptoAmountWithNotation(protocol, decimals)
  }

  private async outboundTotal(txs: Tx[], asset: CompatibleAsset): Promise<CryptoAmount<CompatibleAsset>> {
    const wanted = assetToString(asset).toUpperCase()
    const amounts = txs.flatMap((tx) => tx.coins ?? []).filter((coin) => coin.asset.toUpperCase() === wanted)
    const total = amounts.reduce((sum, coin) => sum.plus(coin.amount), new BigNumber(0))
    return this.getCryptoAmount(total.toFixed(0), asset)
  }

  // The memo fee field is basis points taken from the output. The outbound is what the user receives.
  private async affiliateFeeAmount(
    feeField: string | undefined,
    actual: CryptoAmount<CompatibleAsset> | undefined,
    assetOut: CompatibleAsset,
  ): Promise<CryptoAmount<CompatibleAsset>> {
    const bps = (feeField ?? '').split('/').reduce((sum, part) => {
      const value = Number(part)
      return Number.isFinite(value) ? sum + value : sum
    }, 0)
    if (!actual || bps <= 0 || bps >= 10000) return this.getCryptoAmount('0', assetOut)
    const fee = actual.baseAmount
      .amount()
      .times(bps)
      .div(10000 - bps)
      .integerValue(BigNumber.ROUND_DOWN)
    return new CryptoAmount(baseAmount(fee, actual.baseAmount.decimal), assetOut)
  }
  private async determineObserved(txData: TxSignersResponse): Promise<TXProgress> {
    const progress: TXProgress = {
      txType: TxType.Unknown,
    }

    if (txData.tx) {
      const memo = txData.tx.tx.memo ?? ''
      const assetIn = assetFromStringEx(txData.tx.tx.coins?.[0].asset)
      const inboundAmount = txData.tx.tx.coins?.[0].amount
      const fromAddress = txData.tx.tx.from_address ?? 'unknkown'
      const block = txData.tx.tx.chain == THORChain ? Number(txData.finalised_height) : Number(txData.consensus_height)

      const finalizeBlock =
        txData.tx.tx.chain == THORChain ? Number(txData.finalised_height) : Number(txData.finalised_height)

      const status = txData.tx.status === 'done' ? InboundStatus.Observed_Consensus : InboundStatus.Observed_Incomplete

      progress.txType = txTypeFromMemo(memo)

      const amount = await this.getCryptoAmount(inboundAmount, assetIn)

      const dateObserved = await this.blockToDate(THORChain, txData)
      const expectedConfirmationDate =
        txData.tx.tx.chain === THORChain
          ? await this.blockToDate(THORChain, txData)
          : await this.blockToDate(assetIn.chain, txData)

      progress.inboundObserved = {
        status,
        date: dateObserved,
        block,
        expectedConfirmationBlock: finalizeBlock,
        expectedConfirmationDate,
        amount,
        fromAddress,
        memo,
      }
    }
    return progress
  }
  private async checkAddLpProgress(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      const memo = txData.tx.tx.memo ?? ''
      const memoFields = this.parseAddLpMemo(memo)
      const asset = assetFromStringEx(memoFields.asset) as Asset | TokenAsset
      const isSymmetric = memoFields.pairedAddress ? true : false
      const assetTx = !isAssetRuneNative(progress.inboundObserved.amount.asset) ? progress.inboundObserved : undefined
      const runeTx = isAssetRuneNative(progress.inboundObserved.amount.asset) ? progress.inboundObserved : undefined

      const pairedAssetExpectedConfirmationDate = assetTx ? await this.blockToDate(asset.chain, txData) : undefined
      const checkLpPosition = await this.thorchainCache.thornode.getLiquidityProvider(
        memoFields.asset,
        progress.inboundObserved.fromAddress,
      )
      const status = checkLpPosition ? AddLpStatus.Complete : AddLpStatus.Incomplete
      const addLpInfo: AddLpInfo = {
        status,
        isSymmetric,
        assetTx,
        runeTx,
        assetConfirmationDate: pairedAssetExpectedConfirmationDate,
        pool: asset,
      }
      progress.addLpInfo = addLpInfo
    }
  }
  private async checkWithdrawLpProgress(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      const memo = txData.tx.tx.memo ?? ''
      const memoFields = this.parseWithdrawLpMemo(memo)
      const asset = assetFromStringEx(memoFields.asset)
      const lastBlockObj = await this.thorchainCache.thornode.getLastBlock()
      const currentHeight = lastBlockObj.find((obj) => obj)

      const outboundHeight = txData.tx.status === 'done' ? txData.finalised_height : Number(`${txData.outbound_height}`)

      const expectedConfirmationDate = await this.blockToDate(THORChain, txData, outboundHeight) // always pass in thorchain

      const status = txData.tx.status === 'done' ? WithdrawStatus.Complete : WithdrawStatus.Incomplete
      const outAmount = status === WithdrawStatus.Complete ? txData.out_txs?.[0]?.coins?.[0]?.amount ?? '0' : '0'
      const outboundBlock = Number(txData.outbound_height ?? txData.finalised_height)
      const currentTCHeight = Number(`${currentHeight?.thorchain}`)
      const estimatedWaitTime =
        outboundBlock > currentTCHeight
          ? (outboundBlock - currentTCHeight) * this.chainAttributes[THORChain].avgBlockTimeInSecs
          : 0
      const withdrawalAmount = await this.getCryptoAmount(outAmount, asset)
      const withdrawLpInfo: WithdrawInfo = {
        status,
        withdrawalAmount,
        expectedConfirmationDate,
        thorchainHeight: currentTCHeight,
        outboundHeight: outboundBlock,
        estimatedWaitTime,
      }
      progress.withdrawLpInfo = withdrawLpInfo
    }
  }
  private async checkAddSaverProgress(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      const assetTx = !isAssetRuneNative(progress.inboundObserved.amount.asset) ? progress.inboundObserved : undefined
      const checkSaverVaults = await this.thorchainCache.thornode.getSaver(
        txData.tx.tx.coins[0].asset,
        `${assetTx?.fromAddress}`,
      )
      const status = checkSaverVaults ? AddSaverStatus.Complete : AddSaverStatus.Incomplete
      const addSaverInfo: AddSaverInfo = {
        status: status,
        assetTx,
        saverPos: checkSaverVaults,
      }
      progress.addSaverInfo = addSaverInfo
    }
  }
  private async checkWithdrawSaverProgress(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      const memo = txData.tx.tx.memo ?? ''
      const memoFields = this.parseWithdrawLpMemo(memo)
      const asset = assetFromStringEx(memoFields.asset)
      const lastBlockObj = await this.thorchainCache.thornode.getLastBlock()
      const currentHeight = lastBlockObj.find((obj) => obj)

      const outboundHeight = txData.tx.status === 'done' ? txData.finalised_height : Number(`${txData.outbound_height}`)

      const expectedConfirmationDate = await this.blockToDate(THORChain, txData, outboundHeight) // always pass in thorchain
      const outAmount = txData.out_txs?.[0]?.coins?.[0]?.amount ?? '0'
      const outboundBlock = Number(txData.outbound_height)
      const finalisedHeight = Number(txData.finalised_height)
      const currentTCHeight = Number(`${currentHeight?.thorchain}`)
      const estimatedWaitTime =
        outboundBlock > currentTCHeight
          ? (outboundBlock - currentTCHeight) * this.chainAttributes[THORChain].avgBlockTimeInSecs +
            this.chainAttributes[asset.chain].avgBlockTimeInSecs
          : 0

      const status = txData.out_txs ? WithdrawStatus.Complete : WithdrawStatus.Incomplete
      const withdrawalAmount = await this.getCryptoAmount(outAmount, asset)
      const withdrawSaverInfo: WithdrawSaverInfo = {
        status,
        withdrawalAmount,
        expectedConfirmationDate,
        thorchainHeight: currentTCHeight,
        finalisedHeight,
        outboundBlock,
        estimatedWaitTime,
      }
      progress.withdrawSaverInfo = withdrawSaverInfo
    }
  }
  private async checkRefund(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      const lastBlockObj = await this.thorchainCache.thornode.getLastBlock()
      const outboundHeight = txData.tx.status === 'done' ? txData.finalised_height : Number(`${txData.outbound_height}`)

      const expectedConfirmationDate = await this.blockToDate(THORChain, txData, outboundHeight) // always pass in thorchain
      const amount = txData.tx.tx.coins[0].amount
      const asset = assetFromStringEx(txData.tx.tx.coins[0].asset)
      const toAddress = `${txData.tx.tx.to_address}`
      const currentHeight = lastBlockObj.find((obj) => obj.chain === asset.chain)

      const outboundBlock = Number(`${currentHeight?.last_observed_in}`)
      const finalisedHeight = Number(txData.finalised_height)
      const currentTCHeight = Number(`${currentHeight?.thorchain}`)
      const estimatedWaitTime =
        outboundBlock > currentTCHeight
          ? (outboundBlock - currentTCHeight) * this.chainAttributes[THORChain].avgBlockTimeInSecs +
            this.chainAttributes[asset.chain].avgBlockTimeInSecs
          : 0

      // if the TC has process the block that the outbound tx was assigned to then its completed.
      const status = txData.tx.status === 'done' ? RefundStatus.Complete : RefundStatus.Incomplete

      const refundAmount = await this.getCryptoAmount(amount, asset)
      const refundInfo: RefundInfo = {
        status,
        refundAmount,
        toAddress,
        expectedConfirmationDate,
        thorchainHeight: currentTCHeight,
        finalisedHeight,
        outboundBlock,
        estimatedWaitTime,
      }
      progress.refundInfo = refundInfo
    }
  }
  private parseAddLpMemo(memo: string) {
    // Memo format: ADD:POOL:PAIREDADDR:AFFILIATE:FEE
    const parts = memo.split(`:`)
    const action = parts[0]
    const asset = parts[1]
    const pairedAddress = parts.length > 2 && parts[2].length > 0 ? parts[2] : undefined
    const affiliateAddress = parts.length > 3 && parts[3].length > 0 ? parts[3] : undefined
    const affiliateFee = parts.length > 4 && parts[4].length > 0 ? parts[4] : undefined
    return { action, asset, pairedAddress, affiliateAddress, affiliateFee }
  }
  private parseWithdrawLpMemo(memo: string) {
    // Memo format: ADD:POOL:PAIREDADDR:AFFILIATE:FEE
    const parts = memo.split(`:`)
    const action = parts[0]
    const asset = parts[1]
    const pairedAddress = parts.length > 2 && parts[2].length > 0 ? parts[2] : undefined
    const affiliateAddress = parts.length > 3 && parts[3].length > 0 ? parts[3] : undefined
    const affiliateFee = parts.length > 4 && parts[4].length > 0 ? parts[4] : undefined
    return { action, asset, pairedAddress, affiliateAddress, affiliateFee }
  }
  private async blockToDate(chain: Chain, txData: TxSignersResponse, outboundBlock?: number) {
    const lastBlockObj = await this.thorchainCache.thornode.getLastBlock()
    const time = new Date()
    let blockDifference: number
    const currentHeight = lastBlockObj.find((obj) => obj.chain == chain)
    const chainHeight = Number(`${currentHeight?.last_observed_in}`)
    const recordedChainHeight = Number(`${txData.consensus_height}`)
    if (outboundBlock) {
      // outbound_height is a THORChain height. Apply that difference once.
      const thorchainHeight = Number(`${lastBlockObj.find((obj) => obj)?.thorchain}`)
      blockDifference = outboundBlock - thorchainHeight
      time.setSeconds(time.getSeconds() + blockDifference * this.chainAttributes[THORChain].avgBlockTimeInSecs)
      return time
    }
    if (chain == THORChain) {
      const currentHeight = lastBlockObj.find((obj) => obj)
      const thorchainHeight = Number(`${currentHeight?.thorchain}`)
      const finalisedHeight = Number(`${txData.finalised_height}`)
      blockDifference = thorchainHeight - finalisedHeight
      time.setSeconds(time.getSeconds() - blockDifference * this.chainAttributes[chain].avgBlockTimeInSecs) // note if using data from a tx that was before a thorchain halt this calculation becomes inaccurate...
    } else {
      blockDifference = chainHeight - recordedChainHeight
      time.setSeconds(time.getSeconds() - blockDifference * this.chainAttributes[chain].avgBlockTimeInSecs)
    }
    return time
  }

  private async blockHeight(asset: CompatibleAsset) {
    const lastBlockObj = await this.thorchainCache.thornode.getLastBlock()
    const currentHeight = lastBlockObj.find((obj) => obj.chain == asset.chain)
    let blockHeight
    if (asset.chain === THORChain || isSynthAsset(asset)) {
      const currentHeight = lastBlockObj.find((obj) => obj)
      blockHeight = Number(`${currentHeight?.thorchain}`)
    } else {
      blockHeight = Number(`${currentHeight?.last_observed_in}`)
    }
    return blockHeight
  }
}
