import { Network } from '@xchainjs/xchain-client'
import {
  Configuration,
  LastBlock,
  NetworkApi,
  ObservedTx,
  ObservedTxStatusEnum,
  QueueApi,
  TransactionsApi,
  TxOutItem,
  TxResponse,
} from '@xchainjs/xchain-thornode'
import {
  BCHChain,
  BNBChain,
  BTCChain,
  Chain,
  CosmosChain,
  DOGEChain,
  ETHChain,
  LTCChain,
  THORChain,
  TerraChain,
  assetFromString,
} from '@xchainjs/xchain-util'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { DefaultChainAttributes } from '../chain-defaults'
import { ChainAttributes } from '../types'

import { Midgard } from './midgard'

export type ThornodeConfig = {
  apiRetries: number
  thornodeBaseUrls: string[]
}

export enum TxStage {
  INBOUND_CHAIN_UNCONFIRMED,
  CONF_COUNTING,
  TC_PROCESSING,
  OUTBOUND_QUEUED,
  OUTBOUND_CHAIN_UNCONFIRMED,
  OUTBOUND_CHAIN_CONFIRMED,
}
export type TxStatus = {
  stage: TxStage
  seconds: number
}

const defaultThornodeConfig: Record<Network, ThornodeConfig> = {
  mainnet: {
    apiRetries: 3,
    thornodeBaseUrls: [
      `https://thornode.ninerealms.com/`,
      `https://thornode.thorswap.net/`,
      `https://thornode.thorchain.info/`,
    ],
  },
  stagenet: {
    apiRetries: 3,
    thornodeBaseUrls: ['https://stagenet-thornode.ninerealms.com/'],
  },
  testnet: {
    apiRetries: 3,
    thornodeBaseUrls: ['https://testnet.thornode.thorchain.info/'],
  },
}

export class Thornode {
  private config: ThornodeConfig
  private network: Network
  private chainAttributes: Record<Chain, ChainAttributes>
  private transactionsApi: TransactionsApi[]
  private queueApi: QueueApi[]
  private networkApi: NetworkApi[]
  private midgard: Midgard

  constructor(network: Network = Network.Mainnet, config?: ThornodeConfig, chainAttributes = DefaultChainAttributes) {
    this.network = network
    this.midgard = new Midgard(Network.Mainnet)
    this.config = config ?? defaultThornodeConfig[this.network]
    axiosRetry(axios, { retries: this.config.apiRetries, retryDelay: axiosRetry.exponentialDelay })
    this.transactionsApi = this.config.thornodeBaseUrls.map(
      (url) => new TransactionsApi(new Configuration({ basePath: url })),
    )
    this.queueApi = this.config.thornodeBaseUrls.map((url) => new QueueApi(new Configuration({ basePath: url })))
    this.networkApi = this.config.thornodeBaseUrls.map((url) => new NetworkApi(new Configuration({ basePath: url })))

    this.chainAttributes = chainAttributes
  }

  /**
   * Returns the oubound transactions held by THORChain due to outbound delay
   * May be empty if there are no transactions
   *
   * @returns {ScheduledQueueItem} Array
   *
   */
  async getscheduledQueue(): Promise<TxOutItem[]> {
    for (const api of this.queueApi) {
      try {
        const queueScheduled = await api.queueScheduled()
        return queueScheduled.data
      } catch (e) {
        console.error(e)
        throw new Error(`THORNode not responding`)
      }
    }
    throw Error(`THORNode not responding`)
  }

  async getTxData(txHash: string): Promise<TxResponse> {
    for (const api of this.transactionsApi) {
      try {
        const txResponse = await api.tx(txHash)
        return txResponse.data
      } catch (e) {
        const txR: TxResponse = {
          observed_tx: undefined,
          keysign_metric: undefined,
        }
        return txR
      }
    }
    throw new Error(`THORNode not responding`)
  }

  async getLastBlock(height?: number): Promise<LastBlock[]> {
    for (const api of this.networkApi) {
      try {
        const lastBlock = await api.lastblock(height)
        return lastBlock.data
      } catch (e) {
        console.error(e)
      }
    }
    throw new Error(`THORNode not responding`)
  }

  protected getChain = (chain: string): Chain => {
    switch (chain) {
      case 'BNB':
        return BNBChain
      case 'BTC':
        return BTCChain
      case 'ETH':
        return ETHChain
      case 'THOR':
        return THORChain
      case 'GAIA':
        return CosmosChain
      case 'BCH':
        return BCHChain
      case 'LTC':
        return LTCChain
      case 'DOGE':
        return DOGEChain
      case 'TERRA':
        return TerraChain
      case 'POLKA':
        throw Error('Polkadot is not supported yet')
      default:
        throw Error('Unknown chain')
    }
  }

  /**
   * For a given in Tx Hash (as returned by THORChainAMM.DoSwap()), finds the status of any THORChain transaction
   * This function should be polled.
   * @param
   * @param destinationChain
   * @param inboundTxHash
   * @returns
   */
  public async checkTx(inboundTxHash: string, sourceChain?: Chain): Promise<TxStatus> {
    let txStatus: TxStatus = { stage: TxStage.INBOUND_CHAIN_UNCONFIRMED, seconds: 0 }
    const txData = await this.getTxData(inboundTxHash)
    const scheduledQueueItem = (await this.getscheduledQueue()).find(
      (item: TxOutItem) => item.in_hash === inboundTxHash,
    )

    // Check to see if the transaction has been observed
    if (txData.observed_tx == undefined) {
      txStatus = await this.checkTxDefined(txStatus, sourceChain)
      return txStatus
    }
    // If its scheduled and observed
    if (scheduledQueueItem && txData.observed_tx) {
      txStatus = await this.checkObservedOnly(txStatus, scheduledQueueItem, txData.observed_tx, sourceChain)
      console.log(txStatus.stage)
    }
    // Retrieve asset and chain from memo
    const pool = txData.observed_tx.tx.memo?.split(`:`)
    if (!pool) throw Error(`No pool found from memo`)
    const getAsset = assetFromString(pool[1].toUpperCase())
    const lastBlock = await this.getLastBlock()
    const lastBlockHeight = lastBlock.find((obj) => obj.chain === getAsset?.chain)

    // Check to see if its in the outbound queue
    if (scheduledQueueItem) {
      txStatus = await this.checkOutboundQueue(txStatus, scheduledQueueItem, lastBlockHeight)
      // Check to see if there is an outbound wait
      if (scheduledQueueItem?.height != undefined && txStatus.stage < TxStage.OUTBOUND_CHAIN_CONFIRMED) {
        txStatus = await this.checkOutboundTx(txStatus, scheduledQueueItem, lastBlockHeight)
      }
      return txStatus
    }

    // If not in queue, outbound Tx sent // check synth // check it status == done
    if (!scheduledQueueItem && getAsset) {
      txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
      if (getAsset?.synth) {
        if (txData.observed_tx?.status == ObservedTxStatusEnum.Done) {
          txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
          txStatus.seconds = 0
        } else {
          txStatus.seconds = 6
        }
        return txStatus
      }
      if (txData.observed_tx?.status == ObservedTxStatusEnum.Done && getAsset.chain != Chain.THORChain) {
        if (lastBlockHeight?.last_observed_in && txData.observed_tx.block_height) {
          const chainblockTime = this.chainAttributes[getAsset.chain].avgBlockTimeInSecs
          // get the chain attributes from Outbound Chain and work out time elapsed
          const blockDifference = lastBlockHeight.last_observed_in - txData.observed_tx.block_height
          const timeElapsed = blockDifference / chainblockTime
          txStatus.seconds = timeElapsed > chainblockTime ? 0 : chainblockTime - timeElapsed
        } else if (txData.observed_tx.tx.id && lastBlockHeight?.thorchain) {
          const recordedAction = await this.midgard.getActions(txData.observed_tx.tx.id)
          const recordedBlockheight = recordedAction.find((block) => {
            return block
          })
          if (!recordedBlockheight) throw Error(`No height recorded`)
          const chainblockTime = this.chainAttributes[getAsset.chain].avgBlockTimeInSecs
          const blockDifference = lastBlockHeight?.thorchain - +recordedBlockheight.height
          const timeElapsed =
            (blockDifference * chainblockTime) / this.chainAttributes[getAsset.chain].avgBlockTimeInSecs
          txStatus.seconds = timeElapsed > chainblockTime ? 0 : chainblockTime - timeElapsed
          txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
        }
        return txStatus
      } else {
        console.log(txData.observed_tx?.status)
        txStatus.seconds = 0
        txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
      }
      return txStatus
    } else {
      // case example "memo": "OUT:08BC062B248F6F27D0FECEF1650843585A1496BFFEAF7CB17A1CBC30D8D58F9C" where no asset is found its a thorchain tx. Confirms in ~6 seconds
      txStatus.seconds = 0
      txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
    }
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

  /** Stage 2, THORNode has seen it. See if observed only (conf counting) or it has been processed by THORChain  */
  // e.g. https://thornode.ninerealms.com/thorchain/tx/365AC447BE6CE4A55D14143975EE3823A93A0D8DE2B70AECDD63B6A905C3D72B
  private async checkObservedOnly(
    txStatus: TxStatus,
    scheduledQueueItem: TxOutItem,
    observed_tx?: ObservedTx,
    sourceChain?: Chain,
  ): Promise<TxStatus> {
    if (observed_tx?.tx?.chain != undefined) {
      sourceChain = this.getChain(observed_tx.tx.chain)
    } else {
      throw new Error(`Cannot get source chain ${observed_tx?.tx?.chain}`)
    }

    //If observed by not final, need to wait till the finalised block before moving to the next stage, blocks in source chain
    if (observed_tx?.block_height && observed_tx?.finalise_height && scheduledQueueItem.height) {
      if (observed_tx.block_height < observed_tx.finalise_height) {
        txStatus.stage = TxStage.CONF_COUNTING
        const blocksToWait = observed_tx.finalise_height - scheduledQueueItem.height
        txStatus.seconds = blocksToWait * this.chainAttributes[sourceChain].avgBlockTimeInSecs
      } else if (observed_tx.status != ObservedTxStatusEnum.Done) {
        // processed but not yet full final, e.g. not 2/3 nodes signed
        txStatus.seconds = this.chainAttributes[THORChain].avgBlockTimeInSecs // wait one more TC block
        txStatus.stage = TxStage.TC_PROCESSING
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
}
