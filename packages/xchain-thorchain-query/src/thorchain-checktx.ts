import { LastBlock, ObservedTx, TxOutItem, TxResponse } from '@xchainjs/xchain-thornode'
import { Chain, THORChain } from '@xchainjs/xchain-util'

import { DefaultChainAttributes } from './chain-defaults'
import { ThorchainCache } from './thorchain-cache'
import { ChainAttributes, TransactionStatus } from './types'
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
  public async transactionProgress(inboundTxHash: string, sourceChain?: Chain): Promise<boolean> {
    const txData = await this.thorchainCache.thornode.getTxData(inboundTxHash)
    const txObserved = this.checkTCObservedTx(txData, sourceChain)
    console.log(txObserved)

    // Get the source chain
    if (txData.observed_tx?.tx?.chain != undefined) {
      sourceChain = getChain(txData.observed_tx.tx.chain)
    } else {
      throw new Error(`Cannot get source chain ${txData.observed_tx?.tx?.chain}`)
    }

    // Retrieve block height
    const lastBlock = await this.thorchainCache.thornode.getLastBlock()

    if (sourceChain == Chain.Bitcoin || Chain.BitcoinCash || Chain.Litecoin) {
      const lastBlockHeight = lastBlock.find((obj) => obj.chain === sourceChain)
      if (!lastBlockHeight?.last_observed_in) throw Error('No recorded block height')
      const checkConf = await this.checkConfcounting(txData.observed_tx, sourceChain, lastBlockHeight)
      console.log(checkConf)

      // Get block height
      const tcBlockHeight = lastBlock.find((obj) => obj.thorchain)

      const s = await this.checkOutboundQueue(inboundTxHash, tcBlockHeight)
      console.log(s)
    }
    return true
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
  public async checkTCObservedTx(txData: TxResponse, sourceChain?: Chain): Promise<TransactionStatus> {
    const stageStatus: TransactionStatus = {
      seconds: 0,
      targetBlock: 0,
    }
    if (JSON.stringify(txData.observed_tx) == undefined) {
      if (sourceChain) {
        stageStatus.seconds = this.chainAttributes[sourceChain].avgBlockTimeInSecs
      } else {
        stageStatus.seconds = 60
      }
    } else {
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
    observed_tx: ObservedTx,
    sourceChain: Chain,
    lastSourceBlock: LastBlock,
  ): Promise<TransactionStatus> {
    const stageStatus: TransactionStatus = { seconds: 0, targetBlock: 0 }
    if (observed_tx?.block_height && observed_tx?.finalise_height) {
      // has this already happened?
      //   console.log(
      //     `lastSourceBlock.last_observed_in is ${lastSourceBlock.last_observed_in} and observed_tx.finalise_height is ${observed_tx.finalise_height}`,
      //   )
      if (lastSourceBlock.last_observed_in < observed_tx.finalise_height) {
        // If observed but not final, need to wait till the finalised block before moving to the next stage, blocks in source chain
        if (observed_tx.block_height < observed_tx.finalise_height) {
          const blocksToWait = observed_tx.finalise_height - observed_tx?.block_height // how many source blocks to wait.
          stageStatus.seconds = blocksToWait * this.chainAttributes[sourceChain].avgBlockTimeInSecs
          stageStatus.targetBlock = observed_tx.finalise_height // not this is the source blockchain height, not the THORChain block height
        }
      } else {
      }
    }
    return stageStatus
  }

  /** Stage 4 */
  /**
   * Regardless of the transaction size, if the network is under load, Txs will need to wait. Given a size of a transaction AND the current network load, THORNode can assign a future block for the outgoing transaction.
   * A user needs to wait for that block to be reached before a TX is sent.
   *
   * Steps.
   * 1. See if there is an outbound queue. If none, outTx has been sent.
   * 2. Find the targetblock the oubound Tx will be sent in for the given inbound Tx hash.
   * 3. Compare that agains the current TC height to see the block different then times the TC block time to get seconds.
   *
   * @param inboundTxHash
   * @param lastBlockHeight
   * @returns
   */
  private async checkOutboundQueue(inboundTxHash: string, lastBlockHeight?: LastBlock): Promise<TransactionStatus> {
    const stageStatus: TransactionStatus = { seconds: 0, targetBlock: 0 }
    const scheduledQueueItem = (await this.thorchainCache.thornode.getscheduledQueue()).find(
      (item: TxOutItem) => item.in_hash === inboundTxHash,
    )
    if (scheduledQueueItem == undefined) {
    } else {
      if (scheduledQueueItem?.height && lastBlockHeight?.thorchain) {
        stageStatus.targetBlock = scheduledQueueItem.height
        stageStatus.seconds =
          (scheduledQueueItem.height - lastBlockHeight?.thorchain) * this.chainAttributes[THORChain].avgBlockTimeInSecs
      }
    }
    return stageStatus
  }
}
