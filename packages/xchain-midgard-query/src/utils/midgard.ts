import { Network } from '@xchainjs/xchain-client'
import { Configuration, MidgardApi, PoolDetail, SaverDetails, THORNameDetails } from '@xchainjs/xchain-midgard'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { MidgardConfig } from '../types'

const defaultMidgardConfig: Record<Network, MidgardConfig> = {
  mainnet: {
    apiRetries: 3,
    midgardBaseUrls: ['https://midgard.ninerealms.com'],
  },
  stagenet: {
    apiRetries: 3,
    midgardBaseUrls: ['https://stagenet-midgard.ninerealms.com'],
  },
  testnet: {
    apiRetries: 3,
    midgardBaseUrls: ['https://testnet.midgard.thorchain.info'],
  },
}

export class Midgard {
  private config: MidgardConfig
  readonly network: Network
  private midgardApis: MidgardApi[]

  constructor(network: Network = Network.Mainnet, config?: MidgardConfig) {
    this.network = network
    this.config = config ?? defaultMidgardConfig[this.network]
    axiosRetry(axios, { retries: this.config.apiRetries, retryDelay: axiosRetry.exponentialDelay })
    this.midgardApis = this.config.midgardBaseUrls.map(
      (url: string) => new MidgardApi(new Configuration({ basePath: url })),
    )
  }

  /**
   * Function to return member details based on valid liquidity position
   * @param address - query can also be multiple addresses should be separated by comma
   * @returns - object type of Member Detail
   */
  public async getSavers(address: string): Promise<SaverDetails> {
    for (const api of this.midgardApis) {
      try {
        const saverDetails = (await api.getSaverDetail(address)).data
        return saverDetails
      } catch (e) {
        //console.error(e)
      }
    }
    throw Error(`Midgard not responding`)
  }

  /**
   *
   * @returns an array of Pools
   */
  async getPools(): Promise<PoolDetail[]> {
    for (const api of this.midgardApis) {
      try {
        return (await api.getPools()).data
      } catch (e) {
        //console.error(e)
      }
    }
    throw new Error(`Midgard not responding`)
  }

  public async getTHORNameDetails(name: string): Promise<THORNameDetails | undefined> {
    for (const api of this.midgardApis) {
      try {
        const resp = await api.getTHORNameDetail(name)
        if (resp.status == 404) {
          return undefined
        } else if (resp.status == 200) {
          return resp.data
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.response.status == 404) {
          return undefined
        }
      }
    }
    throw Error(`Midgard not responding`)
  }
}
