import { Network } from '@xchainjs/xchain-client'
import { Configuration, ObservedTx, TransactionsApi, QueueApi, ScheduledOutbound, NetworkApi, Outbound, LastBlock } from '@xchainjs/xchain-thornode'
import { Chain, THORChain } from '@xchainjs/xchain-util'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { defaultChainAttributes } from '../chainDefaults'
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
  private midgard: Midgard
  private networkApi: NetworkApi[]

  constructor(network: Network = Network.Mainnet, config?: ThornodeConfig, chainAttributes = defaultChainAttributes) {
    this.network = network
    this.config = config ?? defaultThornodeConfig[this.network]
    axiosRetry(axios, { retries: this.config.apiRetries, retryDelay: axiosRetry.exponentialDelay })
    this.transactionsApi = this.config.thornodeBaseUrls.map((url) => new TransactionsApi(new Configuration({ basePath: url })),
    )
    this.queueApi = this.config.thornodeBaseUrls.map((url) => new QueueApi(new Configuration({ basePath: url })),
    )
    this.networkApi = this.config.thornodeBaseUrls.map((url) => new NetworkApi(new Configuration({ basePath: url })),
    )

    this.chainAttributes = chainAttributes
    this.midgard = new Midgard(network)
  }

  /**
   * Returns the oubound transactions held by THORChain due to outbound delay
   * May be empty if there are no transactions
   *
   * @returns {ScheduledQueueItem} Array
   *
   */
  async getscheduledQueue(): Promise<ScheduledOutbound[]> {
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

  async getTxData(txHash: string): Promise<ObservedTx> {
    for (const api of this.transactionsApi) {
      try {
        const obseredTx = await api.tx(txHash)
        return obseredTx.data
      } catch (e) {
        console.error(e)
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

  /**
   * For a given in Tx Hash (as returned by THORChainAMM.DoSwap()), finds the status of any THORChain transaction
   *
   * @param sourceChain
   * @param destinationChain
   * @param inboundTxHash
   * @returns
   */
  public async checkTx(inboundTxHash: string, sourceChain?: Chain): Promise<TxStatus> {
    const txStatus: TxStatus = { stage: TxStage.INBOUND_CHAIN_UNCONFIRMED, seconds: 0 }

    /** Stage 1 See if the tx has been confirmed on the source Blockchain or not */
    const txData = await this.getTxData(inboundTxHash)

    // If there is an error Thornode does not know about it. wait 60 seconds
    // If a long block time like BTC, can check or poll to see if the status changes.
    if(!txData.block_height){
    txStatus.stage = TxStage.INBOUND_CHAIN_UNCONFIRMED
    if (sourceChain) {
      txStatus.seconds = this.chainAttributes[sourceChain].avgBlockTimeInSecs
    } else {
      txStatus.seconds = 60
    }
    return txStatus
    }


    /** Stage 2, THORNode has seen it. See if observed only or it has been processed by THORChain  */
    // e.g. https://thornode.ninerealms.com/thorchain/tx/365AC447BE6CE4A55D14143975EE3823A93A0D8DE2B70AECDD63B6A905C3D72B
    const scheduledOutbound = await this.getscheduledQueue()

    if(scheduledOutbound.length == 0) {
      txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
      txStatus.seconds = 60
      return txStatus
    }
    const observedTxBlockHeight = scheduledOutbound.find((obj) => {
      return obj.height
    })
    const finaliseHeight = Number(txData[`finalise_height`])
    const status = txData['status']
    // const destinationChainString: string = txData[`memo`]
    // const strTokens = destinationChainString.split(`:`, 2)
    // const destinationChain: Chain = assetFromString(strTokens[1]).chain
    const destinationChain: Chain = THORChain // to more fixed
    txStatus.stage = TxStage.TC_PROCESSING
    //If observed by not final, need to wait till the finalised block before moving to the next stage
    if (observedTxBlockHeight < finaliseHeight) {
      const blocksToWait = finaliseHeight - observedTxBlockHeight
      txStatus.seconds = blocksToWait * this.chainAttributes[THORChain].avgBlockTimeInSecs
      return txStatus
    } else if (status != 'done') {
      // processed but not yet full final, e.g. not 2/3 nodes signed
      txStatus.seconds = this.chainAttributes[THORChain].avgBlockTimeInSecs
      return txStatus
    } else {
      txStatus.stage++
    }

    /** Stage 3, check oubound queue for tx subject to oubound delay -> /thorchain/queue/scheduled/` */
    const currentBlockHeight = this.midgard.getLatestBlocHeightk() // No way I know if to do it via THORNode
    const currentBlockHeight = 50
    const allscheduledQueue = await this.getscheduledQueue()
    const scheduledQueueItem = allscheduledQueue?.find((item: ScheduledQueueItem) => item.in_hash === inboundTxHash)
    // If the scheudled block is greater than the current block, need to wait that amount of blocks till outbound is sent
    if (scheduledQueueItem) {
      if (currentBlockHeight < scheduledQueueItem?.height) {
        const blocksToWait = scheduledQueueItem.height - currentBlockHeight
        txStatus.stage = TxStage.OUTBOUND_QUEUED
        txStatus.seconds = blocksToWait * this.chainAttributes[THORChain].avgBlockTimeInSecs
        return txStatus
      } else {
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
      }
    }

    // /** Stage 4, has the outbound Tx happened */
    if (scheduledQueueItem) {
      const blockDifference = scheduledQueueItem.height - currentBlockHeight
      const timeElapsed = blockDifference * this.chainAttributes[THORChain].avgBlockTimeInSecs
      if (blockDifference <= 0) {
        // If Tx has just been sent, Stage 3 should pick this up really
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
        txStatus.seconds = this.chainAttributes[destinationChain].avgBlockTimeInSecs
      } else if (timeElapsed < this.chainAttributes[destinationChain].avgBlockTimeInSecs) {
        // if the time passed since the outbound TX was sent is less than the outbound block time, outbound Tx unconfirmed, wait a bit longer.
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
        txStatus.seconds = this.chainAttributes[destinationChain].avgBlockTimeInSecs - timeElapsed // workout how long to wait
      } else {
        // time passed is greater than outbound Tx time, Tx is confirmed. Thus stage 5
        txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
        txStatus.seconds = 0
      }
    }
    return txStatus // should only be stage 4 or 5 here
  }
}
