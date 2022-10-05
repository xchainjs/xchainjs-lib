
import { LastBlock, ObservedTx, ObservedTxStatusEnum, TxOutItem } from '@xchainjs/xchain-thornode'
import {
  TxStage, TxStatus, ChainAttributes,
} from './types'
import { DefaultChainAttributes } from './chain-defaults'
import { getChain } from './utils/swap'
import {
  Chain,
  THORChain,
  assetFromString,
  BNBChain,
} from '@xchainjs/xchain-util'
import { ThorchainCache } from './thorchain-cache'

export class CheckTx {
  readonly thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>

  /**
   * Contructor to create a ThorchainAMM
   *
   * @param thorchainCache - an instance of the ThorchainCache (could be pointing to stagenet,testnet,mainnet)
   * @param chainAttributes - atrributes used to calculate waitTime & conf counting
   * @returns ThorchainAMM
   */
  constructor(thorchainCache: ThorchainCache, chainAttributes = DefaultChainAttributes) {
    this.thorchainCache = thorchainCache
    this.chainAttributes = chainAttributes
  }

/**
   * For a given in Tx Hash (as returned by THORChainAMM.DoSwap()), finds the status of any THORChain transaction
   * This function should be polled.
   *
   * As the following questions
   *
   * 1. Has TC see it?
   * 2. If observed, has is there inbound conf counting (for non BFT Chains)? If so, for how long
   * 3. has TC processed it?
   * 4. Is it in the outbound queue? If so, what is the target block and how long will it take for that to happen?
   * 5. If TC has sent it, how long will outbound conf take?
   *
   *
   * @param
   * @param inboundTxHash - needed to determine transactions stage
   * @param sourceChain - extra parameter
   * @returns - object tx status
   */
  public async checkTx(inboundTxHash: string, sourceChain?: Chain): Promise<TxStatus> {


    let txStatus: TxStatus = { stage: TxStage.INBOUND_CHAIN_UNCONFIRMED, seconds: 0 }
    const txData = await this.thorchainCache.thornode.getTxData(inboundTxHash) // get txData from the TxInHash, e.g. https://thornode.ninerealms.com/thorchain/tx/DA4C2272F0EDAC84646489A271264D9FD405D34B9E39C890E9D98F1E8ACA1F42


    // Stage 1 - Check to see if the transaction has been observed (If TC knows about it)
    if (txData.observed_tx == undefined) {
      txStatus = await this.checkTxDefined(txStatus, sourceChain) // Wait for it to be observed by TC
      return txStatus
    }

      // Retrieve asset and chain from memo as we have the tx data
      const pool = txData.observed_tx.tx.memo?.split(`:`)
      if (!pool) throw Error(`No pool found from memo`)
      const getAsset = assetFromString(pool[1].toUpperCase())
      if (!getAsset) throw Error(`Invalid pool asset`)


      if (txData.observed_tx?.tx?.chain != undefined) {
        sourceChain = getChain(txData.observed_tx.tx.chain)
      } else {
        throw new Error(`Cannot get source chain ${txData.observed_tx?.tx?.chain}`)
      }


      // Retrieve thorchain blockHeight for the tx
      if (!txData.observed_tx.tx?.id) throw Error('No action observed')
      const recordedAction = await this.thorchainCache.midgard.getActions('', txData.observed_tx.tx.id)
      const recordedTCBlock = recordedAction.find((block) => {
        return block
      })
      if (!recordedTCBlock?.height) throw Error('No recorded block height')


      // Stage 2 - Conf Counting
      // Retrieve thorchains last observed block height
      const lastBlock = await this.thorchainCache.thornode.getLastBlock()
      const lastBlockHeight = lastBlock.find((obj) => obj.chain === getAsset?.chain)
      if (!lastBlockHeight?.last_observed_in) throw Error('No recorded block height')

      if (sourceChain == THORChain || sourceChain == BNBChain) {
        txStatus.stage = TxStage.OUTBOUND_QUEUED
      } else {
        if (txData.observed_tx) { // it has been observed by TC
          txStatus = await this.checkObservedOnly(txStatus, txData.observed_tx, getAsset.chain, lastBlockHeight)
        }
      }
      // Stage 3
      const scheduledQueueItem = (await this.thorchainCache.thornode.getscheduledQueue()).find(
        (item: TxOutItem) => item.in_hash === inboundTxHash,
      )
        // Check to see if its in the outbound queue
      if (scheduledQueueItem) {
        txStatus = await this.checkOutboundQueue(txStatus, scheduledQueueItem, lastBlockHeight)
        // Check to see if there is an outbound wait
        if (scheduledQueueItem?.height != undefined && txStatus.stage < TxStage.OUTBOUND_CHAIN_CONFIRMED) {
          txStatus = await this.checkOutboundTx(txStatus, scheduledQueueItem, lastBlockHeight)
        }
        //console.log(`Tx stage ${txStatus.stage}\nTx seconds left ${txStatus.seconds}`)
        return txStatus
      }



    // If its scheduled and observed

    //console.log(`Tx stage ${txStatus.stage}\nTx seconds left ${txStatus.seconds}`)



    return txStatus
  }

  /** Stage 1  */
  private async checkTxDefined(txStatus: TxStatus, sourceChain?: Chain): Promise<TxStatus> {
    // If there is an error Thornode does not know about it. wait 60 seconds
    // If a long block time like BTC, can check or poll to see if the status changes.
    if (sourceChain) {
      txStatus.seconds = this.chainAttributes[sourceChain].avgBlockTimeInSecs
    } else {
      txStatus.seconds = 60
    }
    return txStatus
  }

  /** Stage 2, THORNode has seen it. See if observed only (conf counting) or it has been processed by THORChain
   * Block Height in Tx is > than TC Observed Block Height
  */
  // e.g. https://thornode.ninerealms.com/thorchain/tx/1FA0028157E4A4CFA38BC18D9DAF482A5E1C06987D08C90CBD1E0DCFAABE7642 for BNB (which is instant config)
  // https://thornode.ninerealms.com/thorchain/tx/619F2005282F3EB501636546A8A3C3375495B0E9F04130D8945A6AF2158966BC for BTC in
  // TOR In does not ahve a block_height Tx field https://thornode.ninerealms.com/thorchain/tx/365AC447BE6CE4A55D14143975EE3823A93A0D8DE2B70AECDD63B6A905C3D72B
  private async checkObservedOnly(
    txStatus: TxStatus,
    observed_tx?: ObservedTx,
    sourceChain?: Chain,
    lastSourceBlock: LastBlock
  ): Promise<TxStatus> {

    // we are getting the chain here again, why? what is the put in sending in the source chain
    if (observed_tx?.tx?.chain != undefined) {
      sourceChain = getChain(observed_tx.tx.chain)
    } else {
      throw new Error(`Cannot get source chain ${observed_tx?.tx?.chain}`)
    }

    if (observed_tx?.block_height && observed_tx?.finalise_height) {
      // has this already happened?
      if(lastSourceBlock.last_observed_in < observed_tx.finalise_height) {
      // If observed but not final, need to wait till the finalised block before moving to the next stage, blocks in source chain
        if (observed_tx.block_height < observed_tx.finalise_height) {
          txStatus.stage = TxStage.CONF_COUNTING
          const blocksToWait = observed_tx.finalise_height - observed_tx?.block_height // how many source blocks to wait.
          txStatus.seconds = blocksToWait * this.chainAttributes[sourceChain].avgBlockTimeInSecs
        } else if (observed_tx.status != ObservedTxStatusEnum.Done) { // observed block height >= finalised hight
          // processed but not yet full final, e.g. not 2/3 nodes signed
          txStatus.seconds = this.chainAttributes[THORChain].avgBlockTimeInSecs // wait one more TC block
          txStatus.stage = TxStage.TC_PROCESSING
        }
      }
      else {
        txStatus.stage = TxStage.OUTBOUND_QUEUED // fully processed by THORChain
      }
    }
    return txStatus
  }
  /**
   * Stage 3
   * @param txStatus
   * @param txData
   * @param scheduledQueue
   * @param scheduledQueueItem
   * @param lastBlockHeight
   * @returns
   */
  private async checkOutboundQueue(
    txStatus: TxStatus,
    scheduledQueueItem?: TxOutItem,
    lastBlockHeight?: LastBlock,
  ): Promise<TxStatus> {
    // If the scheduled block is greater than the current block, need to wait that amount of blocks till outbound is sent
    if (scheduledQueueItem?.height && lastBlockHeight?.thorchain) {
      if (lastBlockHeight.thorchain < scheduledQueueItem?.height) {
        const blocksToWait = scheduledQueueItem.height - lastBlockHeight.thorchain
        txStatus.stage = TxStage.OUTBOUND_QUEUED
        txStatus.seconds = blocksToWait * this.chainAttributes[THORChain].avgBlockTimeInSecs
        return txStatus
      } else {
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
        return txStatus
      }
    }
    return txStatus
  }
  /** Stage 4 */
  private async checkOutboundTx(
    txStatus: TxStatus,
    scheduledQueueItem?: TxOutItem,
    lastBlockHeight?: LastBlock,
  ): Promise<TxStatus> {
    if (scheduledQueueItem?.height && lastBlockHeight?.thorchain) {
      const blockDifference = scheduledQueueItem.height - lastBlockHeight?.thorchain
      const timeElapsed = blockDifference * this.chainAttributes[THORChain].avgBlockTimeInSecs
      if (blockDifference == 0) {
        // If Tx has just been sent, Stage 3 should pick this up really
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
        txStatus.seconds = this.chainAttributes[THORChain].avgBlockTimeInSecs
      } else if (timeElapsed < txStatus.seconds) {
        // if the time passed since the outbound TX was sent is less than the outbound block time, outbound Tx unconfirmed, wait a bit longer.
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
        txStatus.seconds = this.chainAttributes[THORChain].avgBlockTimeInSecs - timeElapsed // workout how long to wait
      } else {
        // time passed is greater than outbound Tx time, Tx is confirmed. Thus stage 5
        txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
        txStatus.seconds = 0
      }
    }
    return txStatus
  }
