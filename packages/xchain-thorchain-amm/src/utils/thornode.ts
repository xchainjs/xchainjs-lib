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
} from '@xchainjs/xchain-util'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { DefaultChainAttributes } from '../chain-defaults'
import { ChainAttributes } from '../types'

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

  constructor(network: Network = Network.Mainnet, config?: ThornodeConfig, chainAttributes = DefaultChainAttributes) {
    this.network = network
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
    console.log(txData.observed_tx?.tx.chain)
    const scheduledQueue = await this.getscheduledQueue()
    const scheduledQueueItem = scheduledQueue?.find((item: TxOutItem) => item.in_hash === inboundTxHash)
    const lastBlock = await this.getLastBlock()
    const lastBlockHeight = lastBlock.find((obj) => {
      return obj
    })
    if (txData.observed_tx == undefined) {
      console.log(`Stage 1`)
      txStatus = await this.checkObservedTx(txStatus, sourceChain)
    }
    if (txData.observed_tx?.tx && txData.observed_tx?.status != ObservedTxStatusEnum.Done) {
      console.log(`Stage 2`)
      txStatus = await this.checkObservedOnly(txStatus, txData.observed_tx, sourceChain)
    }
    if (txData.observed_tx?.tx && txData.observed_tx?.status == ObservedTxStatusEnum.Done) {
      console.log(`Stage 3`)
      txStatus = await this.checkOutboundQueue(
        txStatus,
        txData.observed_tx,
        scheduledQueue,
        scheduledQueueItem,
        lastBlockHeight,
      )
    }
    if (txStatus.stage >= TxStage.OUTBOUND_CHAIN_UNCONFIRMED) {
      console.log(`Stage 4`)
      txStatus = await this.checkOutboundTx(txStatus, scheduledQueueItem, lastBlockHeight)
    }
    return txStatus
  }

  /** Stage 1  */
  private async checkObservedTx(txStatus: TxStatus, sourceChain?: Chain): Promise<TxStatus> {
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
    observed_tx?: ObservedTx,
    sourceChain?: Chain,
  ): Promise<TxStatus> {
    if (observed_tx?.tx?.chain != undefined) {
      sourceChain = this.getChain(observed_tx.tx.chain)
    } else {
      throw new Error(`Cannot get source chain ${observed_tx?.tx?.chain}`)
    }
    const scheduledOutbound = await this.getscheduledQueue()
    const observedTxBlockHeight = scheduledOutbound.find((obj) => {
      return obj.height
    })
    //If observed by not final, need to wait till the finalised block before moving to the next stage, blocks in source chain
    if (observed_tx?.block_height && sourceChain && observed_tx?.finalise_height && observedTxBlockHeight?.height) {
      if (observed_tx.block_height < observed_tx.finalise_height) {
        txStatus.stage = TxStage.CONF_COUNTING
        const blocksToWait = observed_tx.finalise_height - observedTxBlockHeight?.height
        txStatus.seconds = blocksToWait * this.chainAttributes[sourceChain].avgBlockTimeInSecs
      } else if (observed_tx.status != ObservedTxStatusEnum.Done) {
        // processed but not yet full final, e.g. not 2/3 nodes signed
        txStatus.seconds = this.chainAttributes[THORChain].avgBlockTimeInSecs // wait one more TC block
        txStatus.stage = TxStage.TC_PROCESSING
      }
    }
    return txStatus
  }
  /** Stage 3 */
  private async checkOutboundQueue(
    txStatus: TxStatus,
    txData: ObservedTx,
    scheduledQueue: TxOutItem[],
    scheduledQueueItem?: TxOutItem,
    lastBlockHeight?: LastBlock,
  ): Promise<TxStatus> {
    txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
    console.log(scheduledQueue.length) 
    if (scheduledQueue.length == 0 && txData?.tx?.memo) {
      console.log(scheduledQueue.length)
      // if it is not queued, outbound Tx sent
      txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
      const pool = txData.tx.memo.split(`:`, 2)
      const synthCheck = pool[1].split('/')
      if (synthCheck.length == 2) {
        console.log(synthCheck.length)
        console.log(pool)
        txStatus.seconds = this.chainAttributes[THORChain].avgBlockTimeInSecs
      } else {
        console.log(synthCheck.length)
        console.log(pool)
        const ticker = pool[1].split(`.`, 1).toString()
        const chain = this.getChain(ticker)
        txStatus.seconds = this.chainAttributes[chain].avgBlockTimeInSecs
      }
      return txStatus
    }
    // If the scheduled block is greater than the current block, need to wait that amount of blocks till outbound is sent
    if (scheduledQueueItem?.height && lastBlockHeight?.thorchain) {
      console.log(`here in second if`)
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
    console.log(txStatus.stage, txStatus.seconds)
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
      console.log(`Block difference ${blockDifference}`)
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
