import { Saver, TxDetailsResponse, TxSignersResponse } from '@xchainjs/xchain-thornode'
import {
  Asset,
  Chain,
  CryptoAmount,
  TokenAsset,
  assetFromStringEx,
  baseAmount,
  isSynthAsset,
} from '@xchainjs/xchain-util'

import { DefaultChainAttributes } from './chain-defaults'
import { ThorchainCache } from './thorchain-cache'
import { ChainAttributes, CompatibleAsset } from './types'
import { AssetRuneNative, THORChain, isAssetRuneNative } from './utils'
/**
 * Enum representing different types of transactions.
 */
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
/**
 * Enum representing inbound transaction status.
 */
export enum InboundStatus {
  Observed_Consensus = 'Observed_Consensus',
  Observed_Incomplete = 'Observed_Incomplete',
  Unknown = 'Unknown',
}
/**
 * Enum representing swap transaction status.
 */
export enum SwapStatus {
  Complete = 'Complete',
  Complete_Refunded = 'Complete_Refunded',
  Complete_Below_Dust = 'Complete_Below_Dust',
  Incomplete = 'Incomplete',
}
/**
 * Enum representing add liquidity pool transaction status.
 */
export enum AddLpStatus {
  Complete = 'Complete',
  Complete_Refunded = 'Complete_Refunded',
  Complete_Below_Dust = 'Complete_Below_Dust',
  Incomplete = 'Incomplete',
}
/**
 * Enum representing withdraw transaction status.
 */
export enum WithdrawStatus {
  Complete = 'Complete',
  Incomplete = 'Incomplete',
  Complete_Refunded = 'Complete_Refunded',
}
/**
 * Enum representing refund transaction status.
 */
export enum RefundStatus {
  Complete = 'Complete',
  Incomplete = 'Incomplete',
  Complete_Refunded = 'Complete_Refunded',
}
/**
 * Enum representing add saver transaction status.
 */
export enum AddSaverStatus {
  Complete = 'Complete',
  Complete_Refunded = 'Complete_Refunded',
  Complete_Below_Dust = 'Complete_Below_Dust',
  Incomplete = 'Incomplete',
}
/**
 * Object representing swap information.
 */
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
/**
 * Object representing add liquidity pool information.
 */
export type AddLpInfo = {
  status: AddLpStatus
  isSymmetric: boolean
  assetTx?: InboundTx
  runeTx?: InboundTx
  assetConfirmationDate?: Date
  pool: Asset | TokenAsset
}
/**
 * Object representing withdraw saver information.
 */
export type WithdrawSaverInfo = {
  status: WithdrawStatus
  withdrawalAmount: CryptoAmount
  expectedConfirmationDate: Date
  thorchainHeight: number
  finalisedHeight: number
  outboundBlock: number
  estimatedWaitTime: number
}
/**
 * Object representing withdraw information.
 */
export type WithdrawInfo = {
  status: WithdrawStatus
  withdrawalAmount: CryptoAmount
  expectedConfirmationDate: Date
  thorchainHeight: number
  outboundHeight: number
  estimatedWaitTime: number
}
/**
 * Object representing refund information.
 */
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
/**
 * Object representing add saver information.
 */
export type AddSaverInfo = {
  status: AddSaverStatus
  assetTx?: InboundTx
  saverPos?: Saver
}
/**
 * Object representing inbound transaction.
 */
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
/**
 * Object representing transaction progress.
 */
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
/**
 * Class for managing transaction stages.
 */
export class TransactionStage {
  readonly thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>
  /**
   * Constructor to create a TransactionStage instance.
   * @param thorchainCache - ThorchainCache instance.
   * @param chainAttributes - ChainAttributes object representing default chain attributes.
   */
  constructor(thorchainCache: ThorchainCache, chainAttributes = DefaultChainAttributes) {
    this.thorchainCache = thorchainCache
    this.chainAttributes = chainAttributes
  }
  /**
   * Checks transaction progress.
   * @param inboundTxHash - Inbound transaction hash.
   * @returns Promise<TXProgress> - Transaction progress object.
   */
  public async checkTxProgress(inboundTxHash: string): Promise<TXProgress> {
    let txData
    try {
      if (inboundTxHash.length < 1) throw Error('inboundTxHash too short')
      txData = await this.thorchainCache.thornode.getTxDetail(inboundTxHash)
      // console.log(JSON.stringify(txData, null, 2))
    } catch (error) {
      return {
        txType: TxType.Unknown,
      }
    }
    //valid tx
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
  /**
   * Checks the progress of a swap transaction.
   * @param txData - Transaction details response.
   * @param progress - Transaction progress object.
   */
  private async checkSwapProgress(txData: TxDetailsResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      // Extract memo fields
      const memo = txData.tx.tx.memo ?? ''
      const memoFields = this.parseSwapMemo(memo)
      const assetOut = assetFromStringEx(memoFields.asset.toUpperCase())
      // Determine swap status
      const swapStatus = txData.out_txs[0].memo?.match('OUT') ? SwapStatus.Complete : SwapStatus.Complete_Refunded
      // Get current chain height for confirmations
      const chainHeight = await this.blockHeight(AssetRuneNative)

      // Expected outbound height and date
      const outboundHeight = Number(txData.outbound_height ?? txData.finalised_height)
      const expectedOutBlock = Number(txData.outbound_height ?? txData.finalised_height)
      const expectedOutDate = await this.blockToDate(THORChain, txData, outboundHeight) // height held in the scheduled queue
      // Calculate confirmations
      const confirmations = chainHeight > outboundHeight ? chainHeight - outboundHeight : 0
      // Calculate minimum amount out and affiliate fee
      const minimumAmountOut = memoFields.limit
        ? await this.getCryptoAmount(memoFields.limit, assetOut)
        : await this.getCryptoAmount('0', assetOut)

      const affliateFee = memoFields.affiliateFee
        ? await this.getCryptoAmount(memoFields.affiliateFee, assetOut)
        : await this.getCryptoAmount('0', assetOut)
      // Construct swap info object
      const swapInfo: SwapInfo = {
        status: swapStatus,
        expectedOutBlock,
        expectedOutDate,
        expectedAmountOut: minimumAmountOut, // TODO call estimateSwap()
        confirmations,
        minimumAmountOut,
        affliateFee,
        toAddress: memoFields.destAddress,
      }
      // Assign swap info to progress object
      progress.swapInfo = swapInfo
    }
  }
  /**
   * Parses swap memo to extract relevant fields.
   * @param memo - Transaction memo.
   * @returns Parsed swap memo fields.
   */
  private parseSwapMemo(memo: string) {
    //SWAP:ASSET:DESTADDR:LIM:AFFILIATE:FEE
    const parts = memo.split(`:`)
    const action = parts[0]
    const asset = parts[1]
    const destAddress = parts[2]
    const limit = parts.length > 3 && parts[3].length > 0 ? parts[3] : undefined
    const affiliateAddress = parts.length > 4 && parts[4].length > 0 ? parts[4] : undefined
    const affiliateFee = parts.length > 5 && parts[5].length > 0 ? parts[5] : undefined
    return { action, asset, destAddress, limit, affiliateAddress, affiliateFee }
  }
  /**
   * Retrieves a CryptoAmount object.
   * @param baseAmt - Base amount.
   * @param asset - Asset object.
   * @returns Promise<CryptoAmount> - CryptoAmount object.
   */
  private async getCryptoAmount(baseAmt: string, asset: CompatibleAsset): Promise<CryptoAmount<CompatibleAsset>> {
    const decimals =
      THORChain === asset.chain ? 8 : Number(await this.thorchainCache.midgardQuery.getDecimalForAsset(asset))
    return new CryptoAmount(baseAmount(baseAmt, decimals), asset)
  }
  /**
   * Determines the observed status of a transaction.
   * @param txData - Transaction signers response.
   * @returns Promise<TXProgress> - Transaction progress object.
   */
  private async determineObserved(txData: TxSignersResponse): Promise<TXProgress> {
    const progress: TXProgress = {
      txType: TxType.Unknown,
    }

    if (txData.tx) {
      const memo = txData.tx.tx.memo ?? ''
      const parts = memo?.split(`:`)
      const operation = parts && parts[0] ? parts[0] : ''
      const assetIn = assetFromStringEx(txData.tx.tx.coins?.[0].asset)
      const inboundAmount = txData.tx.tx.coins?.[0].amount
      const fromAddress = txData.tx.tx.from_address ?? 'unknkown'
      const block = txData.tx.tx.chain == THORChain ? Number(txData.finalised_height) : Number(txData.consensus_height)

      const finalizeBlock =
        txData.tx.tx.chain == THORChain ? Number(txData.finalised_height) : Number(txData.finalised_height)

      const status = txData.tx.status === 'done' ? InboundStatus.Observed_Consensus : InboundStatus.Observed_Incomplete

      if (operation.match(/swap|s|=/gi)) progress.txType = TxType.Swap
      if ((operation.match(/add/gi) && parts[1].match(`/`)) || (operation.match(/a|[+]/) && parts[1].match(/[/]/)))
        progress.txType = TxType.AddSaver
      if ((operation.match(/add/gi) && parts[1].match(`.`)) || (operation.match(/a|[+]/) && parts[1].match(/[.]/)))
        progress.txType = TxType.AddLP
      if (operation.match(/withdraw|wd|-/gi) && parts[1].match(/[/]/)) progress.txType = TxType.WithdrawSaver
      if (operation.match(/withdraw|wd|-/gi) && parts[1].match(/[.]/)) progress.txType = TxType.WithdrawLP
      if (operation.match(/refund/gi)) progress.txType = TxType.Refund
      if (operation.match(/out/gi)) progress.txType = TxType.Other

      const amount = await this.getCryptoAmount(inboundAmount, assetIn)
      // find a date for when it should be competed

      const dateObserved = await this.blockToDate(THORChain, txData)
      const expectedConfirmationDate =
        txData.tx.tx.chain === THORChain
          ? await this.blockToDate(THORChain, txData)
          : await this.blockToDate(assetIn.chain, txData)

      progress.inboundObserved = {
        status,
        date: dateObserved, // date observed?
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
  /**
   * Checks the progress of an add liquidity pool transaction.
   * @param txData - Transaction details response.
   * @param progress - Transaction progress object.
   */
  private async checkAddLpProgress(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      // Extract memo fields
      const memo = txData.tx.tx.memo ?? ''
      const memoFields = this.parseAddLpMemo(memo)
      const asset = assetFromStringEx(memoFields.asset) as Asset | TokenAsset
      const isSymmetric = memoFields.pairedAddress ? true : false
      // Determine if assetTx or runeTx
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
  /**
   * Checks the progress of a withdraw liquidity pool transaction.
   * @param txData - Transaction details response.
   * @param progress - Transaction progress object.
   */
  private async checkWithdrawLpProgress(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      // Extract memo fields
      const memo = txData.tx.tx.memo ?? ''
      const memoFields = this.parseWithdrawLpMemo(memo)
      const asset = assetFromStringEx(memoFields.asset)
      // Get the last block object
      const lastBlockObj = await this.thorchainCache.thornode.getLastBlock()
      const currentHeight = lastBlockObj.find((obj) => obj)

      // Calculate expected confirmation date
      const outboundHeight = txData.tx.status === 'done' ? txData.finalised_height : Number(`${txData.outbound_height}`)

      const expectedConfirmationDate = await this.blockToDate(THORChain, txData, outboundHeight) // always pass in thorchain

      // Determine transaction status
      const status = txData.tx.status === 'done' ? WithdrawStatus.Complete : WithdrawStatus.Incomplete
      // Extract output amount
      const outAmount =
        status === WithdrawStatus.Complete ? JSON.stringify(txData.out_txs).split(`"amount":"`)[1].split(`"`) : ''
      // Extract relevant block heights and calculate estimated wait time
      const outboundBlock = Number(txData.outbound_height ?? txData.finalised_height)
      const currentTCHeight = Number(`${currentHeight?.thorchain}`)
      const estimatedWaitTime =
        outboundBlock > currentTCHeight
          ? (outboundBlock - currentTCHeight) * this.chainAttributes[THORChain].avgBlockTimeInSecs
          : 0
      // Get withdrawal amount
      const withdrawalAmount = await this.getCryptoAmount(outAmount[0], asset)
      // Construct withdraw liquidity pool info object
      const withdrawLpInfo: WithdrawInfo = {
        status,
        withdrawalAmount,
        expectedConfirmationDate,
        thorchainHeight: currentTCHeight,
        outboundHeight: outboundBlock,
        estimatedWaitTime,
      }
      // Assign withdraw liquidity pool info to progress object
      progress.withdrawLpInfo = withdrawLpInfo
    }
  }
  /**
   * Checks the progress of an add saver transaction.
   * @param txData - Transaction details response.
   * @param progress - Transaction progress object.
   */
  private async checkAddSaverProgress(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      // Determine if it's an asset transaction
      const assetTx = !isAssetRuneNative(progress.inboundObserved.amount.asset) ? progress.inboundObserved : undefined
      // Check saver vaults
      const checkSaverVaults = await this.thorchainCache.thornode.getSaver(
        txData.tx.tx.coins[0].asset,
        `${assetTx?.fromAddress}`,
      )
      // Determine transaction status
      const status = checkSaverVaults ? AddSaverStatus.Complete : AddSaverStatus.Incomplete
      // Construct add saver info object
      const addSaverInfo: AddSaverInfo = {
        status: status,
        assetTx,
        saverPos: checkSaverVaults,
      }
      // Assign add saver info to progress object
      progress.addSaverInfo = addSaverInfo
    }
  }
  /**
   * Checks the progress of a withdraw saver transaction.
   * @param txData - Transaction details response.
   * @param progress - Transaction progress object.
   */
  private async checkWithdrawSaverProgress(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      // Extract memo fields
      const memo = txData.tx.tx.memo ?? ''
      const memoFields = this.parseWithdrawLpMemo(memo)
      const asset = assetFromStringEx(memoFields.asset)
      // Get the last block object
      const lastBlockObj = await this.thorchainCache.thornode.getLastBlock()
      const currentHeight = lastBlockObj.find((obj) => obj)

      // Calculate expected confirmation date
      const outboundHeight = txData.tx.status === 'done' ? txData.finalised_height : Number(`${txData.outbound_height}`)

      const expectedConfirmationDate = await this.blockToDate(THORChain, txData, outboundHeight) // always pass in thorchain
      // Extract output amount
      const outAmount = txData.out_txs ? JSON.stringify(txData.out_txs).split(`"amount":"`)[1].split(`"`) : ''
      // Extract relevant block heights and calculate estimated wait time
      const outboundBlock = Number(txData.outbound_height)
      const finalisedHeight = Number(txData.finalised_height)
      const currentTCHeight = Number(`${currentHeight?.thorchain}`)
      const estimatedWaitTime =
        outboundBlock > currentTCHeight
          ? (outboundBlock - currentTCHeight) * this.chainAttributes[THORChain].avgBlockTimeInSecs +
            this.chainAttributes[asset.chain].avgBlockTimeInSecs
          : 0

      // Determine transaction status
      const status = txData.out_txs ? WithdrawStatus.Complete : WithdrawStatus.Incomplete
      // Get withdrawal amount
      const withdrawalAmount = await this.getCryptoAmount(outAmount[0], asset)
      // Construct withdraw saver info object
      const withdrawSaverInfo: WithdrawSaverInfo = {
        status,
        withdrawalAmount,
        expectedConfirmationDate,
        thorchainHeight: currentTCHeight,
        finalisedHeight,
        outboundBlock,
        estimatedWaitTime,
      }
      // Assign withdraw saver info to progress object
      progress.withdrawSaverInfo = withdrawSaverInfo
    }
  }
  /**
   * Checks the progress of a refund transaction.
   * @param txData - Transaction details response.
   * @param progress - Transaction progress object.
   */
  private async checkRefund(txData: TxSignersResponse, progress: TXProgress) {
    if (progress.inboundObserved) {
      // Get the last block object
      const lastBlockObj = await this.thorchainCache.thornode.getLastBlock()
      // Calculate expected confirmation date
      const outboundHeight = txData.tx.status === 'done' ? txData.finalised_height : Number(`${txData.outbound_height}`)

      const expectedConfirmationDate = await this.blockToDate(THORChain, txData, outboundHeight) // always pass in thorchain
      // Extract amount and asset
      const amount = txData.tx.tx.coins[0].amount
      const asset = assetFromStringEx(txData.tx.tx.coins[0].asset)
      const toAddress = `${txData.tx.tx.to_address}`
      const currentHeight = lastBlockObj.find((obj) => obj.chain === asset.chain)
      console.log(currentHeight)
      // Extract relevant block heights and calculate estimated wait time
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
  /**
   * Parses the memo of an add liquidity pool transaction.
   * @param memo - Memo string of the transaction.
   * @returns Parsed memo fields.
   */
  private parseAddLpMemo(memo: string) {
    // Memo format: ADD:POOL:PAIREDADDR:AFFILIATE:FEE
    const parts = memo.split(`:`)
    const action = parts[0]
    const asset = parts[1]
    // Optional fields
    const pairedAddress = parts.length > 2 && parts[2].length > 0 ? parts[2] : undefined
    const affiliateAddress = parts.length > 3 && parts[3].length > 0 ? parts[3] : undefined
    const affiliateFee = parts.length > 4 && parts[4].length > 0 ? parts[4] : undefined
    return { action, asset, pairedAddress, affiliateAddress, affiliateFee }
  }
  /**
   * Parses the memo of a withdraw liquidity pool transaction.
   * @param memo - Memo string of the transaction.
   * @returns Parsed memo fields.
   */
  private parseWithdrawLpMemo(memo: string) {
    // Memo format: ADD:POOL:PAIREDADDR:AFFILIATE:FEE
    const parts = memo.split(`:`)
    const action = parts[0]
    const asset = parts[1]
    // Optional fields
    const pairedAddress = parts.length > 2 && parts[2].length > 0 ? parts[2] : undefined
    const affiliateAddress = parts.length > 3 && parts[3].length > 0 ? parts[3] : undefined
    const affiliateFee = parts.length > 4 && parts[4].length > 0 ? parts[4] : undefined
    return { action, asset, pairedAddress, affiliateAddress, affiliateFee }
  }
  /**
   * Converts block height to date.
   * @param chain - Input chain.
   * @param txData - Transaction response data.
   * @returns Date object.
   */
  private async blockToDate(chain: Chain, txData: TxSignersResponse, outboundBlock?: number) {
    const lastBlockObj = await this.thorchainCache.thornode.getLastBlock()
    const time = new Date()
    let blockDifference: number
    const currentHeight = lastBlockObj.find((obj) => obj.chain == chain)
    const chainHeight = Number(`${currentHeight?.last_observed_in}`)
    const recordedChainHeight = Number(`${txData.consensus_height}`)
    // If outbound time is required
    if (outboundBlock) {
      const currentHeight = lastBlockObj.find((obj) => obj)
      const thorchainHeight = Number(`${currentHeight?.thorchain}`)
      if (outboundBlock > thorchainHeight) {
        blockDifference = outboundBlock - thorchainHeight
        time.setSeconds(time.getSeconds() + blockDifference * this.chainAttributes[chain].avgBlockTimeInSecs)
        console.log(time)
      } else {
        blockDifference = thorchainHeight - outboundBlock // already processed find the date it was completed
        time.setSeconds(time.getSeconds() - blockDifference * this.chainAttributes[chain].avgBlockTimeInSecs)
        return time
      }
    }
    // Find out how long ago it was processed for all chains
    if (chain == THORChain) {
      const currentHeight = lastBlockObj.find((obj) => obj)
      const thorchainHeight = Number(`${currentHeight?.thorchain}`) // current height of the TC
      const finalisedHeight = Number(`${txData.finalised_height}`) // height tx was completed in
      blockDifference = thorchainHeight - finalisedHeight
      time.setSeconds(time.getSeconds() - blockDifference * this.chainAttributes[chain].avgBlockTimeInSecs) // note if using data from a tx that was before a thorchain halt this calculation becomes inaccurate...
    } else {
      // set the time for all other chains
      blockDifference = chainHeight - recordedChainHeight
      time.setSeconds(time.getSeconds() - blockDifference * this.chainAttributes[chain].avgBlockTimeInSecs)
    }
    return time
  }

  /**
   * Returns the current block height of an asset's native chain.
   * @param asset - Asset for which block height is needed.
   * @returns Block height.
   */
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
