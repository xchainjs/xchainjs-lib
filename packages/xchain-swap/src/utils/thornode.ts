import { Network } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util/lib'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { defaultConfCountingConfig } from '../chainDefaults'
import { ConfCountingSetting } from '../types'

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
      'https://thornode.thorchain.info/',
      'https://thornode.thorswap.net/',
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
  private confCountingConfig: Record<Chain, ConfCountingSetting>

  constructor(
    network: Network = Network.Mainnet,
    config?: THORNodeConfig,
    confCountingConfig = defaultConfCountingConfig,
  ) {
    this.network = network
    this.config = config ?? defaultTHORNodeConfig[this.network]
    axiosRetry(axios, { retries: this.config.apiRetries, retryDelay: axiosRetry.exponentialDelay })
    this.confCountingConfig = confCountingConfig
  }

  /**
   * For a given in Tx Hash (as returned by THORChainAMM.DoSwap()), finds the status of any THORChain transaction
   *
   * @param sourceChain
   * @param destinationChain
   * @param inboundTxHash
   * @returns
   */
  public async checkTx(sourceChain: Chain, destinationChain: Chain, inboundTxHash: string): Promise<TxStatus> {
    const sourceChainConfig = this.confCountingConfig[sourceChain]
    const destinationChainConfig = this.confCountingConfig[destinationChain]

    const txStatus: TxStatus = { stage: TxStage.INBOUND_CHAIN_UNCONFIRMED, seconds: 0 }
    /** Stage 1 See if the tx has been confirmed on the source Blockchain or not */
    const isConfirmed = await /*ChainClient*/ getTransactionDetails(inboundTxHash).isConfirmed
    if (sourceChain != isConfirmed) {
      txStatus.seconds = sourceChainConfig.avgBlockTimeInSecs
      return txStatus // wait the blockChain block time, re-check later
    } else {
      txStatus.stage++ // move to the next stage, e.g. txStatus.stage = TxStage.TC_PROCESSING
    }
    /** Stage 2, see if has been observed and processed by THORChain  */
    // this should go in a seperate function
    const txPath = `/thorchain/tx/`
    for (const baseUrl of this.config.thornodeBaseUrls) {
      try {
        const { data } = await axios.get(`${baseUrl}${txPath}/${inboundTxHash}`)
        const observed_tx_blockHeight = Number(data['block_height'])
        const finalise_height = Number(data[`finalise_height`])
        const status = data['status']
        // If observed by not final, need to wait till the finalised block before moving to the next stage
        if (observed_tx_blockHeight < finalise_height) {
          const blocksToWait = finalise_height - observed_tx_blockHeight
          txStatus.stage = TxStage.TC_PROCESSING
          txStatus.seconds = blocksToWait * 5.5
          return txStatus
        } else if (status != 'done') {
          // not yet full processed, e.g. not 2/3 nodes signed
          txStatus.stage = TxStage.TC_PROCESSING
          txStatus.seconds = 10
          return txStatus
        } else {
          txStatus.stage++
        }
      } catch (e) {
        console.error(e)
        throw new Error(`THORNode not responding ${baseUrl}`)
      }
    }

    /** Stage 3, check oubound queue for tx subject to oubound delay -> /thorchain/queue/scheduled/` */
    const currentBlockHeight = 5
    let ouboundTxHash = ``
    for (const baseUrl of this.config.thornodeBaseUrls) {
      try {
        const allscheduledQueue = await this.getscheduledQueue()
        const scheduledQueueItem = allscheduledQueue?.find((item: ScheduledQueueItem) => item.in_hash === inboundTxHash)
        // If the scheudled block is greater than the current block, need to wait that amount of blocks till outbound is sent
        if (scheduledQueueItem) {
          if (currentBlockHeight < scheduledQueueItem?.height) {
            const blocksToWait = scheduledQueueItem.height - currentBlockHeight
            txStatus.stage = TxStage.OUTBOUND_QUEUED
            txStatus.seconds = blocksToWait * 5.5
            return txStatus
          } else {
            txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED
            ouboundTxHash = scheduledQueueItem.memo
            // Example "memo": "OUT:8B26B45832D6B94FB3CFC33CCB74BD7894B35DC332AD8BB88B09EA466A8D55AF" Get hash
            ouboundTxHash = ouboundTxHash.substring(ouboundTxHash.indexOf(`:`) + 1, ouboundTxHash.length) // this is going to need testing
          }
        }
      } catch (e) {
        console.error(e)
        throw new Error(`THORNode not responding ${baseUrl}`)
      }

      /** Stage 4, same as stage 1 but for the destination Chain */
      if (!destinationChain.Client.getTransactionDetails(ouboundTxHash).isConfirmed) {
        txStatus.stage = TxStage.OUTBOUND_CHAIN_UNCONFIRMED // move to the next stage, e.g. txStatus.stage = TxStage.TC_PROCESSING
        txStatus.seconds = destinationChainConfig.avgBlockTimeInSecs // block time of destinationChain
      } else {
        // Stage 5 - all done
        txStatus.stage = TxStage.OUTBOUND_CHAIN_CONFIRMED
        txStatus.seconds = 0
      }
    }
    return txStatus // should only be stage 4 or 5 here
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
}
