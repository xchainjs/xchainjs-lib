import { LastBlock, LiquidityProvider, ObservedTx, TxOutItem, TxSignersResponse } from '@xchainjs/xchain-thornode'
import { AssetRuneNative, Chain, THORChain, assetFromStringEx, baseAmount } from '@xchainjs/xchain-util'

import { DefaultChainAttributes } from './chain-defaults'
import { CryptoAmount } from './crypto-amount'
import { ThorchainCache } from './thorchain-cache'
import { ChainAttributes, TransactionProgress, TransactionStatus } from './types'
import { getChain } from './utils/swap'

export enum TxType {
  Swap = 'Swap',
  AddLP = 'AddLP',
  WithdrawLP = 'WithdrawLP',
  AddSaver = 'AddSaver',
  WithdrawSaver = 'WithdrawSaver',
  Other = 'Other',
  Unknown = 'Unknown',
}
export enum TxStatus {
  Done = 'done',
  Incomplete = 'incomplete',
  Unknown = 'Unknown',
  Refund = 'Refunded',
}

export type SwapInfo = {
  expectedOutBlock: number
  expectedOutDate: Date
  expectedAmountOut: CryptoAmount
  minimumAmountOut: CryptoAmount
  affliateFee: CryptoAmount
  toAddress: string
}

export type TXProgress = {
  txType: TxType
  status: TxStatus
  inboundObserved?: {
    date: Date
    block: number
    expectedConfirmationBlock: number
    expectedConfirmationDate: Date
    amount: CryptoAmount
    expectedAmountOut: CryptoAmount
    affiliateAmount: CryptoAmount
    fromAddress: string
    memo: string
    assetLpPool?: string
    lpPosition?: LiquidityProvider
  }
  swapInfo?: SwapInfo
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
      txData = await this.thorchainCache.thornode.getTxDataSigners(inboundTxHash)
      console.log(JSON.stringify(txData, null, 2))
    } catch (error) {
      // always wait 1 block for confirmation based on chain?
      return {
        txType: TxType.Unknown,
        status: TxStatus.Unknown,
      }
    }
    //valid tx
    const progress = await this.determineObserved(txData)
    switch (progress.txType) {
      case TxType.Swap:
        this.checkSwapProgress(txData, progress)
        break
      case TxType.AddLP:
        this.checkAddLpProgress(txData, progress)
        break
      default:
        break
    }

    return progress
  }

  private async determineObserved(txData: TxSignersResponse): Promise<TXProgress> {
    const progress: TXProgress = {
      txType: TxType.Unknown,
      status: TxStatus.Unknown,
    }

    if (txData.tx) {
      const memo = txData.tx.tx.memo ?? ''
      const parts = memo?.split(`:`)
      const operation = parts && parts[0] ? parts[0] : ''
      const inboundAsset = txData.tx.tx.coins?.[0].asset
      const inboundAmount = txData.tx.tx.coins?.[0].amount
      const fromAddress = txData.tx.tx.from_address ?? 'unknkown'
      const sourceChain = getChain(`${txData.tx.tx.chain}`)
      const block = sourceChain == Chain.THORChain ? Number(txData.finalised_height) : Number(txData.tx.block_height)
      let finalizeBlock = Number(txData.tx.finalise_height)

      if (operation.match(/[=|s|swap]/i)) progress.txType = TxType.Swap
      if (operation.match(/[+|a|add]/i) && inboundAsset.includes('/')) progress.txType = TxType.AddSaver
      if (operation.match(/[+|a|add]/i) && inboundAsset.includes('.')) progress.txType = TxType.AddLP
      if (operation.match(/[-|wd|withdraw]/i) && inboundAsset.includes('/')) progress.txType = TxType.WithdrawSaver
      if (operation.match(/[-|wd|withdraw]/i) && inboundAsset.includes('.')) progress.txType = TxType.WithdrawLP

      //TODO get the pool asset and use native decimals
      const assetIn = assetFromStringEx(inboundAsset)
      const outAsset = assetFromStringEx(parts[1])
      // find a date for when it was completed
      let expectedConfirmationDate = await this.blockToDate(sourceChain, txData)

      let amount: CryptoAmount
      let expectedAmountOut: CryptoAmount
      if (assetIn.chain || outAsset.chain == Chain.THORChain) {
        amount = new CryptoAmount(baseAmount(inboundAmount), assetIn)
        expectedAmountOut = new CryptoAmount(baseAmount(`${parts[3]}`), outAsset)
      } else {
        const InAssetPool = (await this.thorchainCache.getPoolForAsset(assetIn)).pool
        amount = new CryptoAmount(baseAmount(inboundAmount, +InAssetPool.nativeDecimal), assetIn)
        console.log(assetIn)
        // Expected amount out from asset & asset amount in memo
        const outAssetPool = (await this.thorchainCache.getPoolForAsset(outAsset)).pool
        expectedAmountOut = new CryptoAmount(baseAmount(`${parts[3]}`, +outAssetPool.nativeDecimal), outAsset)
        console.log(outAsset)
      }
      let assetLpPool
      let lpPosition
      if (TxType.AddLP) {
        assetLpPool = parts[1]
        finalizeBlock = Number(txData.finalised_height)
        const address = `${txData.tx.tx.from_address}`
        const asset = assetFromStringEx(assetLpPool)
        const assetChain = getChain(asset.chain)
        lpPosition = await this.thorchainCache.thornode.getLiquidityProvider(assetLpPool, address)
        // find the date in which the asset should be added to the pool
        if (lpPosition?.pending_asset) {
          expectedConfirmationDate = await this.blockToDate(assetChain, txData)
        }
      }
      //TODO look for affiliate fees
      const affiliateFee = parts[5] ?? 0
      const affiliateAmount = new CryptoAmount(baseAmount(affiliateFee), AssetRuneNative)

      progress.inboundObserved = {
        date: new Date(), // date observed?
        block,
        expectedConfirmationBlock: finalizeBlock,
        expectedConfirmationDate,
        amount,
        expectedAmountOut,
        affiliateAmount,
        fromAddress,
        memo,
        assetLpPool,
        lpPosition,
      }
    }
    return progress
  }
  private checkSwapProgress(txData: TxSignersResponse, progress: TXProgress): void {
    //TODO implement
    txData
    //const assetIn = assetFromStringEx(`${txData.observed_tx?.tx.coins?.[0].asset}`)
    if (progress.inboundObserved) {
      const assetOut = progress.inboundObserved?.expectedAmountOut.asset
      const swapInfo: SwapInfo = {
        expectedOutBlock: Number(`${progress.inboundObserved?.expectedConfirmationBlock}`),
        expectedOutDate: new Date(`${progress.inboundObserved?.expectedConfirmationDate}`),
        expectedAmountOut: progress.inboundObserved?.expectedAmountOut, // hmm expected amount out is the same as minimum amout out?
        minimumAmountOut: new CryptoAmount(baseAmount(0), assetOut), // how?
        affliateFee: progress.inboundObserved?.affiliateAmount,
        toAddress: `${txData.tx.tx.to_address}`,
      }
      progress.swapInfo = swapInfo
    }
    if (txData.tx.status === 'done') {
      // This means the all nodes have observed
      //TODO change this hack once thornode fixes bad openapi signatures
      const outTx = JSON.stringify(txData.actions[0])
      // console.log(JSON.stringify(txData.actions, null, 2))
      progress.status = outTx && outTx?.match(/REFUND/) ? TxStatus.Refund : TxStatus.Done
    } else {
      progress.status = TxStatus.Incomplete
    }
  }

  private checkAddLpProgress(txData: TxSignersResponse, progress: TXProgress): void {
    //TODO implement
    txData
    // need to check if TC has a recording of it
    if (
      txData.tx.status === 'done' &&
      progress.inboundObserved?.lpPosition &&
      progress.inboundObserved?.lpPosition?.pending_asset
    ) {
      progress.status = progress.inboundObserved.lpPosition ? TxStatus.Done : TxStatus.Incomplete
    }
  }

  /**
   * Private function to return the date stamp from block height and chain
   * @param chain
   * @param block
   * @returns
   */
  private async blockToDate(chain: Chain, txData: TxSignersResponse): Promise<Date> {
    const lastBlockObj = await this.thorchainCache.thornode.getLastBlock()
    const time = new Date()
    const recordedBlock = Number(`${txData.tx.block_height}`)
    let blockDifference: number
    const currentHeight = lastBlockObj.find((obj) => obj.chain == chain)
    const chainHeight = Number(`${currentHeight?.last_observed_in}`)
    // find out how long ago it was processed
    if (chainHeight > recordedBlock) {
      blockDifference = chainHeight - recordedBlock
      time.setSeconds(time.getSeconds() - blockDifference * this.chainAttributes[chain].avgBlockTimeInSecs)
    } else {
      time.setSeconds(time.getSeconds() + this.chainAttributes[chain].avgBlockTimeInSecs / 2) // Assume block is half completed, therefore divide average block times by 2
    }
    return time
  }
  // Functions follow this logic below
  // 1. Has TC see it?
  // 2. If observed, is there inbound conf counting (for non BFT Chains)? If so, for how long
  // 3. Has TC processed it?
  // 4. Is it in the outbound queue? If so, what is the target block and how long will it take for that to happen?
  // 5. If TC has sent it, how long will outbound conf take?

  /**
   *
   * @param inboundTxHash - Input needed to determine the transaction stage
   * @param sourceChain - Needed for faster logic
   * @returns - tx stage or maybe a boolean not sure at this stage
   */
  public async checkTxProgressDraft(
    inboundTxHash: string,
    progress?: number,
    sourceChain?: Chain,
  ): Promise<TransactionProgress> {
    const transactionProgress: TransactionProgress = {
      progress: 0,
      seconds: 0,
      errors: [],
    }
    if (progress) {
      transactionProgress.progress = progress
    } else {
      progress = 0
    }

    const txData = await this.thorchainCache.thornode.getTxDataSigners(inboundTxHash)
    const isSynth = await this.isSynthTransaction(txData)
    if (isSynth) {
      progress = 3
    }
    const lastBlock = await this.thorchainCache.thornode.getLastBlock()
    if (txData.tx == undefined) {
      // Check inbound, if nothing check outbound queue
      progress = 2
    }
    console.log('mike')
    switch (progress) {
      case 0:
        const txObserved = await this.checkTCRecords(txData, sourceChain)
        transactionProgress.seconds = txObserved.seconds
        transactionProgress.progress = 1
        transactionProgress.errors = txObserved.error
        return transactionProgress
      case 1:
        if (txData.tx?.tx?.chain != undefined) {
          sourceChain = getChain(txData.tx.tx.chain)
          if (sourceChain == (Chain.Bitcoin || Chain.BitcoinCash || Chain.Litecoin)) {
            const lastBlockHeight = lastBlock.find((obj) => obj.chain === sourceChain)
            const checkConf = await this.checkConfcounting(
              sourceChain,
              `${lastBlockHeight?.last_observed_in}`,
              txData.tx,
            )
            console.log(checkConf)
          }
        }
        transactionProgress.progress = 2
        return transactionProgress
      case 2:
        const tcBlockHeight = lastBlock.find((obj) => obj.thorchain)
        const checkOutboundQueue = await this.checkOutboundQueue(inboundTxHash, tcBlockHeight)
        transactionProgress.seconds = checkOutboundQueue.seconds
        transactionProgress.errors = checkOutboundQueue.error
        transactionProgress.progress = 444
        return transactionProgress
      case 3:
        const tcBlock = lastBlock.find((obj) => obj.thorchain)
        const checkOutboundQue = await this.checkOutboundQueue(inboundTxHash, tcBlock)
        transactionProgress.seconds = checkOutboundQue.seconds
        transactionProgress.progress = 4
        return transactionProgress
      default:
        return transactionProgress
    }
  }

  /** Stage 1  */
  /**
   * Check if transaction has been observed by bifrost or THORNode.
   * If there is source chain info, use that determine the wait time else wait one minute
   *
   * @param observed_tx - transaction data based from an input hash
   * @param sourceChain
   * @returns
   */
  private async checkTCRecords(txData: TxSignersResponse, sourceChain?: Chain): Promise<TransactionStatus> {
    const stageStatus: TransactionStatus = {
      seconds: 0,
      error: [],
    }
    if (JSON.stringify(txData.tx) == undefined) {
      if (sourceChain) {
        stageStatus.seconds = this.chainAttributes[sourceChain].avgBlockTimeInSecs
      } else {
        stageStatus.seconds = 60
        stageStatus.error.push(`No observed tx, wait sixty seconds`)
      }
    }

    return stageStatus
  }

  /** Stage 2
   *
   * 1. Find observed_tx.finalise_height and the current observation height (observed_tx.block_height)
   * 2. If last_observed_in (current observation height) is less then the finalise_height, will need to wait tillast_observed_in = finalise_height before thorchain starts processing the transaction.
   * 3. If there is a wait, find the block difference (in source chain) then times by block time to find the conf counting wait time
   *
   * @param observed_tx - transaction data based from an input hash
   * @param sourceChain - in tx chain, should be known at this point.
   * @param lastSourceBlock
   * @returns - transaction stage
   */
  private checkConfcounting(sourceChain: Chain, lastSourceBlock: string, observed_tx?: ObservedTx): Date {
    const timeToFinalised = new Date()
    if (
      observed_tx?.block_height &&
      observed_tx?.finalise_height &&
      Number(lastSourceBlock) < observed_tx.finalise_height
    ) {
      // If observed but not final, need to wait till the finalised block before moving to the next stage, blocks in source chain
      if (observed_tx.block_height < observed_tx.finalise_height) {
        const blocksToWait = observed_tx.finalise_height - observed_tx?.block_height // how many source blocks to wait.
        timeToFinalised.setSeconds(blocksToWait * this.chainAttributes[sourceChain].avgBlockTimeInSecs)
      }
    }
    return timeToFinalised
  }

  /** Stage 3 */
  /**
   * Regardless of the transaction size, if the network is under load, Txs will need to wait. Given a size of a transaction AND the current network load, THORNode can assign a future block for the outgoing transaction.
   * A user needs to wait for that block to be reached before a TX is sent.
   *
   * Steps.
   * 1. See if there is an outbound queue. If none, outTx has been sent.
   * 2. Find the targetblock the oubound Tx will be sent in for the given inbound Tx hash.
   * 3. Compare that against the current TC height to see the block different then times the TC block time to get seconds.
   *
   * @param inboundTxHash
   * @param lastBlockHeight
   * @returns
   */
  private async checkOutboundQueue(inboundTxHash: string, lastBlockHeight?: LastBlock): Promise<TransactionStatus> {
    const stageStatus: TransactionStatus = { seconds: 0, error: [] }
    const scheduledQueueItem = (await this.thorchainCache.thornode.getscheduledQueue()).find(
      (item: TxOutItem) => item.in_hash === inboundTxHash,
    )
    const scheduledQueueLength = (await this.thorchainCache.thornode.getscheduledQueue()).length
    if (scheduledQueueLength > 0 && scheduledQueueItem == undefined) {
      stageStatus.error.push(`Scheduled queue count ${scheduledQueueLength}`)
      stageStatus.error.push(`Could not find tx in outbound queue`)
    } else {
      if (scheduledQueueItem?.height && lastBlockHeight?.thorchain) {
        stageStatus.seconds =
          (scheduledQueueItem.height - lastBlockHeight?.thorchain) * this.chainAttributes[THORChain].avgBlockTimeInSecs
      }
    }
    return stageStatus
  }

  /**
   * Checks too see if the transaction is synth from the memo
   * @param txData  - input txData
   * @returns - boolean
   */
  private async isSynthTransaction(txData: TxSignersResponse): Promise<boolean> {
    const memo = txData.tx.tx.memo
    const synth = memo?.split(`:`)[1].match(`/`) ? true : false
    return synth
  }
}
