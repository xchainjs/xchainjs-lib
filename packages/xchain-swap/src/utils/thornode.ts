import { Network } from '@xchainjs/xchain-client'
import { Chain, THORChain } from '@xchainjs/xchain-util/lib'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { defaultChainAttributes } from '../chainDefaults'
import { ChainAttributes } from '../types'

export type THORNodeConfig = {
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

export type ScheduledQueueItem = {
  chain: Chain
  to_address: string
  vault_pub_key: string
  coin: string
  memo: string
  max_gas: string
  gas_rate: number
  in_hash: string
  height: number
}

const defaultTHORNodeConfig: Record<Network, THORNodeConfig> = {
  mainnet: {
    apiRetries: 3,
    thornodeBaseUrls: [
      `https://thornode.thorchain.info/`,
      `https://thornode.thorswap.net/`,
      `https://thornode.ninerealms.com/`,
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

export class THORNode {
  private config: THORNodeConfig
  private network: Network
  private chainAttributes: Record<Chain, ChainAttributes>
  // private midgard: Midgard

  constructor(network: Network = Network.Mainnet, config?: THORNodeConfig, chainAttributes = defaultChainAttributes) {
    this.network = network
    this.config = config ?? defaultTHORNodeConfig[this.network]
    axiosRetry(axios, { retries: this.config.apiRetries, retryDelay: axiosRetry.exponentialDelay })
    this.chainAttributes = chainAttributes
    // this.midgard = new Midgard(network)
  }

  /**
   * Returns the oubound transactions held by THORChain due to outbound delay
   * May be empty if there are no transactions
   *
   * @returns {ScheduledQueueItem} Array
   *
   */
  async getscheduledQueue(): Promise<ScheduledQueueItem[]> {
    const queueScheduled = `/thorchain/queue/scheduled/`
    for (const baseUrl of this.config.thornodeBaseUrls) {
      try {
        const { data } = await axios.get(`${baseUrl}${queueScheduled}`)
        return data
      } catch (e) {
        console.error(e)
        throw new Error(`THORNode not responding ${baseUrl}`)
      }
    }
    throw Error(`THORNode not responding`)
  }

  async getTxData(txHash: string) {
    // this should go in a seperate function
    const txPath = `/thorchain/tx/`
    for (const baseUrl of this.config.thornodeBaseUrls) {
      try {
        const { data } = await axios.get(`${baseUrl}${txPath}/${txHash}`)
        return data
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
    const [txData] = await Promise.all([this.getTxData(inboundTxHash)])
    const error = txData['error']
    if (error) {
      // THORNode does not know about it yet, this it is not yet confirmed. Wait the chian blocktime.
      // If a long block time like BTC, can check or pool to see if the status changes.
      txStatus.stage = TxStage.INBOUND_CHAIN_UNCONFIRMED
      if (sourceChain) {
        txStatus.seconds = this.chainAttributes[sourceChain].avgBlockTimeInSecs
      } else {
        // we don't know the source chain so guess
        txStatus.seconds = 60
      }
      return txStatus
    }
    /** Stage 2, THORNode has seen it. See if observed only or it has been processed by THORChain  */
    // this will be a json file so need to parase. e.g. https://thornode.ninerealms.com/thorchain/tx/365AC447BE6CE4A55D14143975EE3823A93A0D8DE2B70AECDD63B6A905C3D72B
    const observed_tx_blockHeight = txData['block_height']
    const finalise_height = Number(txData[`finalise_height`])
    const status = txData['status']
    // const destinationChainString: string = txData[`memo`]
    // const strTokens = destinationChainString.split(`:`, 2)
    // const destinationChain: Chain = assetFromString(strTokens[1]).chain
    const destinationChain: Chain = THORChain // to more fixed
    txStatus.stage = TxStage.TC_PROCESSING
    // If observed by not final, need to wait till the finalised block before moving to the next stage
    if (observed_tx_blockHeight < finalise_height) {
      const blocksToWait = finalise_height - observed_tx_blockHeight
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
    // const currentBlockHeight = this.midgard.getLatestBlocHeightk() // No way I know if to do it via THORNode
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

    /** Stage 4, has the outbound Tx happened */
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
