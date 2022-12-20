import { LastBlock, ObservedTx, TxOutItem, TxResponse } from '@xchainjs/xchain-thornode'
import { AssetBTC, AssetLTC, Chain, THORChain } from '@xchainjs/xchain-util'

import { DefaultChainAttributes } from './chain-defaults'
import { ThorchainCache } from './thorchain-cache'
import { ChainAttributes, TransactionProgress, TransactionStatus } from './types'
import { getChain } from './utils/swap'

export class TransactionStage {
  readonly thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>

  constructor(thorchainCache: ThorchainCache, chainAttributes = DefaultChainAttributes) {
    this.thorchainCache = thorchainCache
    this.chainAttributes = chainAttributes
  }

  // Functions follow this logic below
  // 1. Has TC see it?
  // 2. If observed, has is there inbound conf counting (for non BFT Chains)? If so, for how long
  // 3. Has TC processed it?
  // 4. Is it in the outbound queue? If so, what is the target block and how long will it take for that to happen?
  // 5. If TC has sent it, how long will outbound conf take?

  /**
   *
   * @param inboundTxHash - Input needed to determine the transaction stage
   * @param sourceChain - Needed for faster logic
   * @returns - tx stage or maybe a boolean not sure at this stage
   */
  public async checkTxProgress(
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

    const txData = await this.thorchainCache.thornode.getTxData(inboundTxHash)
    const isSynth = await this.isSynthTransaction(txData)
    if (isSynth) {
      progress = 3
    }
    const lastBlock = await this.thorchainCache.thornode.getLastBlock()
    if (txData.observed_tx == undefined) {
      // Check inbound, if nothing check outbound queue
      progress = 2
    }
    switch (progress) {
      case 0:
        const txObserved = await this.checkTCRecords(txData, sourceChain)
        transactionProgress.seconds = txObserved.seconds
        transactionProgress.progress = 1
        transactionProgress.errors = txObserved.error
        return transactionProgress
      case 1:
        if (txData.observed_tx?.tx?.chain != undefined) {
          sourceChain = getChain(txData.observed_tx.tx.chain)
          if (sourceChain == (AssetBTC.chain || AssetBTC.chain || AssetLTC.chain)) {
            const lastBlockHeight = lastBlock.find((obj) => obj.chain === sourceChain)
            const checkConf = await this.checkConfcounting(sourceChain, lastBlockHeight, txData.observed_tx)
            transactionProgress.seconds = checkConf.seconds
            transactionProgress.errors = checkConf.error
          }
        }
        transactionProgress.progress = 2
        return transactionProgress
      case 2:
        const tcBlockHeight = lastBlock.find((obj) => obj.thorchain)
        const checkOutboundQueue = await this.checkOutboundQueue(inboundTxHash, tcBlockHeight)
        transactionProgress.seconds = checkOutboundQueue.seconds
        transactionProgress.errors = checkOutboundQueue.error
        transactionProgress.progress = 3
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
  private async checkTCRecords(txData: TxResponse, sourceChain?: Chain): Promise<TransactionStatus> {
    const stageStatus: TransactionStatus = {
      seconds: 0,
      error: [],
    }
    if (JSON.stringify(txData.observed_tx) == undefined) {
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
  private async checkConfcounting(
    sourceChain: Chain,
    lastSourceBlock?: LastBlock,
    observed_tx?: ObservedTx,
  ): Promise<TransactionStatus> {
    const transactionStatus: TransactionStatus = { seconds: 0, error: [] }
    if (lastSourceBlock == undefined) {
      transactionStatus.error.push(`could not find last source block`)
      return transactionStatus
    }
    if (
      observed_tx?.block_height &&
      observed_tx?.finalise_height &&
      lastSourceBlock.last_observed_in < observed_tx.finalise_height
    ) {
      // If observed but not final, need to wait till the finalised block before moving to the next stage, blocks in source chain
      if (observed_tx.block_height < observed_tx.finalise_height) {
        const blocksToWait = observed_tx.finalise_height - observed_tx?.block_height // how many source blocks to wait.
        transactionStatus.seconds = blocksToWait * this.chainAttributes[sourceChain].avgBlockTimeInSecs
      }
    }
    return transactionStatus
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
  private async isSynthTransaction(txData: TxResponse): Promise<boolean> {
    const memo = txData.observed_tx?.tx.memo
    const synth = memo?.split(`:`)[1].match(`/`) ? true : false
    return synth
  }
}
