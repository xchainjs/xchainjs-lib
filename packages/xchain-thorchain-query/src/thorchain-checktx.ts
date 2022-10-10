import { LastBlock, ObservedTx, TxOutItem, TxResponse } from '@xchainjs/xchain-thornode'
import { BCHChain, BTCChain, Chain, LTCChain, THORChain, assetFromString } from '@xchainjs/xchain-util'

import { DefaultChainAttributes } from './chain-defaults'
import { ThorchainCache } from './thorchain-cache'
import { ChainAttributes, TxStageStatus } from './types'
import { getChain } from './utils/swap'

export class CheckTx {
  readonly thorchainCache: ThorchainCache
  private chainAttributes: Record<Chain, ChainAttributes>

  readonly stageOneWait = 2
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
   * @param inboundTxHash - needed to determine transactions stage
   * @param sourceChain - extra parameter
   * @returns - object tx status
   */
  public async checkTx(inboundTxHash: string, sourceChain?: Chain): Promise<boolean> {
    console.log(`Processing in Hash ${inboundTxHash}`)
    const txData = await this.thorchainCache.thornode.getTxData(inboundTxHash) // get txData from the TxInHash, e.g. https://thornode.ninerealms.com/thorchain/tx/DA4C2272F0EDAC84646489A271264D9FD405D34B9E39C890E9D98F1E8ACA1F42
    let stage1 = this.checkTCObservedTx(txData, sourceChain)
    // Stage 1 - Check to see if the transaction has been observed (If TC knows about it)
    for (let i = 0; i < 3; i++) {
      if (stage1.passed == false) {
        console.log(`Transaction not observed by Thorchain yet. Will retry in ${stage1.seconds} seconds`)
        //setTimeout('', 6000)
      } else {
        console.log(`Transaction has observed by Thorchain, going to stage 2 conf counting.`)
        break
      }
      stage1 = this.checkTCObservedTx(txData, sourceChain)
    }
    if (stage1.passed == false) {
      console.log(`Transaction not found`)
      return false
    }

    // Stage 2 - Conf Counting
    // Prelim activities
    // Get the source chain
    if (txData.observed_tx?.tx?.chain != undefined) {
      sourceChain = getChain(txData.observed_tx.tx.chain)
    } else {
      throw new Error(`Cannot get source chain ${txData.observed_tx?.tx?.chain}`)
    }

    if (sourceChain == BTCChain || sourceChain == LTCChain || sourceChain == BCHChain) {
      // Retrieve TC last observed block height.
      //This does work if sourceChain is THORChain as the field block_height (lastBlockHeight.last_observed_in) is not present in the payload.
      const lastBlock = await this.thorchainCache.thornode.getLastBlock()
      const lastBlockHeight = lastBlock.find((obj) => obj.chain === sourceChain)
      if (!lastBlockHeight?.last_observed_in) throw Error('No recorded block height')
      const stage2 = await this.checkConfcounting(txData.observed_tx, sourceChain, lastBlockHeight)
      if (stage2.passed == false) {
        console.log(
          `Transaction in conf counting. Need to wait ${stage2.seconds} seconds. Target source Block height is ${stage2.tgtBlock}`,
        )
      } else {
        console.log(`Transaction passed conf counting.`)
      }
    } else {
      console.log(`Conf counting not applicable, bypassing.`)
    }

    // Stage 3 = has TC processed the Tx?
    // e.g. https://thornode.ninerealms.com/thorchain/tx/619F2005282F3EB501636546A8A3C3375495B0E9F04130D8945A6AF2158966BC
    // status should be , should not need action from midgard
    // https://midgard.ninerealms.com/v2/actions?txid=619F2005282F3EB501636546A8A3C3375495B0E9F04130D8945A6AF2158966BC
    if ((txData.observed_tx.status = 'done')) {
      console.log('THORChain processing completed.')
    } else {
      console.log('Wait for TC processing ....')
      setTimeout('', 6000)
      console.log('THORChain Processing should be complete ....')
    }

    // need to get TC Block height.
    const lastBlock = await this.thorchainCache.thornode.getLastBlock()
    const tcBlockHeight = lastBlock.find((obj) => obj.chain === BTCChain) // forcing using BTC as TC block height is not dosplayed

    // Stage 4 - Outbound Delay
    const stage4 = await this.checkOutboundQueue(inboundTxHash, tcBlockHeight)
    if (stage4.passed == false) {
      console.log(
        `In Outbound Queue. Need to wait ${stage4.seconds} for Tx to be sent. Target TC Block height is ${stage4.tgtBlock}`,
      )
    } else {
      this.outTxInfo(txData.observed_tx)
    }

    // Stage 5

    return true
  }

  /** Stage 1  */
  /**
   * See if the TC has been observed by bifrost or THORNode.
   * If there is source chain info, use that determin the wait time else wait one min
   *
   * @param observed_tx - transaction data based from an input hash
   * @param sourceChain
   * @returns
   */
  private checkTCObservedTx(txData: TxResponse, sourceChain?: Chain): TxStageStatus {
    // If there is an error Thornode does not know about it. wait 60 seconds
    // If a long block time like BTC, can check or poll to see if the status changes.
    const stageStatus: TxStageStatus = { passed: false, seconds: 0, tgtBlock: 0 }
    console.log(`${JSON.stringify(txData.observed_tx)}`)
    //{"error":"rpc error: code = Unknown desc = internal"}
    if (JSON.stringify(txData.observed_tx) == undefined) {
      console.log(`Tx not observed`)
      if (sourceChain) {
        stageStatus.seconds = this.chainAttributes[sourceChain].avgBlockTimeInSecs
      } else {
        stageStatus.seconds = this.stageOneWait
      }
    } else {
      stageStatus.passed = true
    }
    console.log(stageStatus.passed)
    return stageStatus
  }

  /** Stage 2 */
  // e.g. https://thornode.ninerealms.com/thorchain/tx/1FA0028157E4A4CFA38BC18D9DAF482A5E1C06987D08C90CBD1E0DCFAABE7642 for BNB (which is instant config)
  // https://thornode.ninerealms.com/thorchain/tx/619F2005282F3EB501636546A8A3C3375495B0E9F04130D8945A6AF2158966BC for BTC in
  // THOR in Txs do not ahve a block_height Tx field https://thornode.ninerealms.com/thorchain/tx/365AC447BE6CE4A55D14143975EE3823A93A0D8DE2B70AECDD63B6A905C3D72B

  /**
   * Emergent Consensus blockchains like bitcoin require conformaiton counting to protect against re-org and double spending attacks.
   * Ubon observation, Bifrost will see a observed_tx.finalise_height to the tx at which time it will hand it over to THORNode for processing.
   *
   * 1. Find observed_tx.finalise_height and the current observation height (observed_tx.block_height)
   * 2. If last_observed_in (current observation height) is less then the finalise_height, then need to wait tilllast_observed_in = finalise_height before thorchain starts processing the transaction.
   * 3. If there is a wait, find the block difference (in source chain) then times by block time to find the conf counting wait time
   *
   * @param observed_tx - transaction data based from an input hash
   * @param sourceChain - in tx chain, should be known at this point.
   * @param lastSourceBlock
   * @returns
   */
  private async checkConfcounting(
    observed_tx: ObservedTx,
    sourceChain: Chain,
    lastSourceBlock: LastBlock,
  ): Promise<TxStageStatus> {
    const stageStatus: TxStageStatus = { passed: false, seconds: 0, tgtBlock: 0 }
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
          stageStatus.tgtBlock = observed_tx.finalise_height // not this is the source blockchain height, not the THORChain block height
        }
      } else {
        stageStatus.passed = true
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
  private async checkOutboundQueue(inboundTxHash: string, lastBlockHeight?: LastBlock): Promise<TxStageStatus> {
    const stageStatus: TxStageStatus = { passed: false, seconds: 0, tgtBlock: 0 }
    const scheduledQueueItem = (await this.thorchainCache.thornode.getscheduledQueue()).find(
      (item: TxOutItem) => item.in_hash === inboundTxHash,
    )
    if (scheduledQueueItem == undefined) {
      stageStatus.passed = true
    } else {
      if (scheduledQueueItem?.height && lastBlockHeight?.thorchain) {
        stageStatus.tgtBlock = scheduledQueueItem.height
        stageStatus.seconds =
          (scheduledQueueItem.height - lastBlockHeight?.thorchain) * this.chainAttributes[THORChain].avgBlockTimeInSecs
      }
    }
    return stageStatus
  }

  /**
   *
   */
  private outTxInfo(observed_tx: ObservedTx) {
    // Retrieve the desitnation asset and chain from memo
    const pool = observed_tx.tx.memo?.split(`:`)
    if (!pool) throw Error(`No pool found from memo`)
    const getAsset = assetFromString(pool[1].toUpperCase())
    if (!getAsset) throw Error(`Invalid pool asset`)

    // If not in queue, outbound Tx sent // check synth // check it status == done
    if (getAsset) {
      if (!getAsset.synth) {
        console.log(
          `Transaction has been send from THORChain on the ${getAsset.chain} blockchain to ${observed_tx.tx.to_address}, the out hash is: ${observed_tx.out_hashes} (which might be an asgard address)`,
        )
      } else {
        console.log(`Synth has been minted to address ${observed_tx.tx.to_address}.`)
      }
    }
  }
}
