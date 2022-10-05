
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
  CosmosChain,
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
    // Get the source chain
      if (txData.observed_tx?.tx?.chain != undefined) {
        sourceChain = getChain(txData.observed_tx.tx.chain)
      } else {
        throw new Error(`Cannot get source chain ${txData.observed_tx?.tx?.chain}`)
      }

    // Retrieve TC last observed block height
    const lastBlock = await this.thorchainCache.thornode.getLastBlock()
    const lastBlockHeight = lastBlock.find((obj) => obj.chain === sourceChain)
    if (!lastBlockHeight?.last_observed_in) throw Error('No recorded block height')



    // Stage 2 - Conf Counting
    if (sourceChain == THORChain || sourceChain == BNBChain || sourceChain == CosmosChain) {
      txStatus.stage = TxStage.TC_PROCESSING
    } else {
      txStatus = await this.checkObservedOnly(txStatus, txData.observed_tx, sourceChain, lastBlockHeight)
    }

    // Retrieve thorchain processed blockHeight for the tx
    if (!txData.observed_tx.tx?.id) throw Error('No action observed')
    const recordedAction = await this.thorchainCache.midgard.getActions('', txData.observed_tx.tx.id)
    const recordedTCBlock = recordedAction.find((block) => {
      return block
    })
    if (!recordedTCBlock?.height) throw Error('No recorded block height')

    // Stage 3 = has TC processing completed

    // Stage 4 - Outbound Delay
    const scheduledQueueItem = (await this.thorchainCache.thornode.getscheduledQueue()).find(
      (item: TxOutItem) => item.in_hash === inboundTxHash,
    )
      // Check to see if its in the outbound queue and get the wait time
    if (scheduledQueueItem) {
      txStatus = await this.checkOutboundTx(txStatus, scheduledQueueItem, lastBlockHeight)
    } else {
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
      }



//----------------------------------------------

 // Retrieve the desitnation asset and chain from memo
 const pool = txData.observed_tx.tx.memo?.split(`:`)
 if (!pool) throw Error(`No pool found from memo`)
 const getAsset = assetFromString(pool[1].toUpperCase())
 if (!getAsset) throw Error(`Invalid pool asset`)

   // If not in queue, outbound Tx sent // check synth // check it status == done
   if (!scheduledQueueItem ) {
    txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
    if (getAsset?.synth) {
      if (txData.observed_tx?.status == ObservedTxStatusEnum.Done) {
        txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
        txStatus.seconds = 0
      } else {
        txStatus.seconds = 6
      }
      //console.log(`Tx stage ${txStatus.stage}\nTx seconds left ${txStatus.seconds}`)
      return txStatus
    }
    if (txData.observed_tx?.status == ObservedTxStatusEnum.Done && getAsset.chain != Chain.THORChain) {
      // Retrieve recorded asset block height for the Outbound asset
      const recordedBlockHeight = await this.thorchainCache.thornode.getLastBlock(+recordedTCBlock.height)
      // Match outbound asset to block record
      const assetBlockHeight = recordedBlockHeight.find((obj) => obj.chain === getAsset?.chain)
      if (lastBlockHeight?.last_observed_in && assetBlockHeight?.last_observed_in) {
        const chainblockTime = this.chainAttributes[getAsset.chain].avgBlockTimeInSecs
        // Difference between current block and the recorded tx block for the outbound asset
        const blockDifference = lastBlockHeight.last_observed_in - assetBlockHeight.last_observed_in
        const timeElapsed = blockDifference * chainblockTime
        // If the time elapsed since the tx is greater than the chains block time, assume tx has 1 ocnfirmation else return time left to wait
        txStatus.seconds = timeElapsed > chainblockTime ? 0 : chainblockTime - timeElapsed
        console.log(timeElapsed)
      } else if (txData.observed_tx.tx.id && lastBlockHeight?.thorchain) {
        const recordedAction = await this.thorchainCache.midgard.getActions(txData.observed_tx.tx.id)
        const recordedBlockheight = recordedAction.find((block) => {
          return block
        })
        if (!recordedBlockheight) throw Error(`No height recorded`)
        const chainblockTime = this.chainAttributes[getAsset.chain].avgBlockTimeInSecs
        console.log(chainblockTime)
        const blockDifference = lastBlockHeight?.thorchain - +recordedBlockheight.height
        console.log(blockDifference)
        const timeElapsed =
          (blockDifference * chainblockTime) / this.chainAttributes[getAsset.chain].avgBlockTimeInSecs
        txStatus.seconds = timeElapsed > chainblockTime ? 0 : chainblockTime - timeElapsed
        console.log(txStatus.seconds)
        txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
      }
      //console.log(`Tx stage ${txStatus.stage}\nTx seconds left ${txStatus.seconds}`)
      return txStatus
    } else {
      txStatus.seconds = 0
      txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
    }
    //console.log(`Tx stage ${txStatus.stage}\nTx seconds left ${txStatus.seconds}`)
    return txStatus
  } else {
    // case example "memo": "OUT:08BC062B248F6F27D0FECEF1650843585A1496BFFEAF7CB17A1CBC30D8D58F9C" where no asset is found its a thorchain tx. Confirms in ~6 seconds
    txStatus.seconds = 0
    txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
  }

//----------------------------------------------

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

  /** Stage 4 */
  /**
   * If the Tx is in the outbound queue, works out how long it has to go.
   * @param txStatus
   * @param scheduledQueueItem
   * @param lastBlockHeight
   * @returns
   */
  private async checkOutboundTx(
    txStatus: TxStatus,
    scheduledQueueItem?: TxOutItem,
    lastBlockHeight?: LastBlock,
  ): Promise<TxStatus> {
    if (scheduledQueueItem?.height && lastBlockHeight?.thorchain) {

      const blockDifference = scheduledQueueItem.height - lastBlockHeight?.thorchain
      //const timeElapsed = blockDifference * this.chainAttributes[THORChain].avgBlockTimeInSecs
      if (blockDifference == 0) {
        // If Tx has just been sent, Stage 3 should pick this up really
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
        txStatus.seconds = this.chainAttributes[THORChain].avgBlockTimeInSecs
      }
    }
    else {
      txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
    }
    return txStatus
  }
