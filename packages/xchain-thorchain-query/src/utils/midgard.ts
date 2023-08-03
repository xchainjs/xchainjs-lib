import { Network } from '@xchainjs/xchain-client'
import {
  Action,
  Configuration,
  MemberDetails,
  MidgardApi,
  PoolDetail,
  PoolStatsDetail,
  SaverDetails,
  THORNameDetails,
} from '@xchainjs/xchain-midgard'
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
    this.midgardApis = this.config.midgardBaseUrls.map((url) => new MidgardApi(new Configuration({ basePath: url })))
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

  /**
   * Gets the latest block using the Health endpoint within Midgard
   *
   * @returns
   */
  public async getLatestBlockHeight(): Promise<number> {
    for (const api of this.midgardApis) {
      try {
        const data = (await api.getHealth()).data
        return +data.scannerHeight
      } catch (e) {
        //console.error(e)
      }
    }
    throw Error(`Midgard not responding`)
  }
  /**
   * Gets actions object for any of the parameters
   * @param txHash transaction id
   * @returns Type Action array of objects
   */
  public async getActions(
    address?: string,
    txid?: string,
    asset?: string,
    type?: string,
    affiliate?: string,
    limit?: number,
    offset?: number,
  ): Promise<Action[]> {
    for (const api of this.midgardApis) {
      try {
        const actions = (await api.getActions(address, txid, asset, type, affiliate, limit, offset)).data.actions
        return actions
      } catch (e) {
        //console.error(e)
      }
    }
    throw Error(`Midgard not responding`)
  }

  /**
   * Function to return member details based on valid liquidity position
   * @param address - needed to query for Lp details
   * @returns - object type of Member Detail
   */
  public async getMember(address: string): Promise<MemberDetails> {
    for (const api of this.midgardApis) {
      try {
        const memberDetail = (await api.getMemberDetail(address)).data
        return memberDetail
      } catch (e) {
        //console.error(e)
      }
    }
    throw Error(`Midgard not responding`)
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
   * Function to return pool statistics for a particular asset
   * @param asset - asset string to query its pool stats
   * @returns - type object poolstatsDetail
   */
  public async getPoolStats(asset: string): Promise<PoolStatsDetail> {
    for (const api of this.midgardApis) {
      try {
        const poolDetail = (await api.getPoolStats(asset)).data
        return poolDetail
      } catch (e) {
        //console.error(e)
      }
    }
    throw Error(`Midgard not responding`)
  }

  /**
   * Function to return THORNameDetails for a particular name
   * @param name - thorname string to query
   * @returns - type object THORNameDetails
   */
  public async getTHORNameDetails(name: string): Promise<THORNameDetails | undefined> {
    for (const api of this.midgardApis) {
      try {
        const resp = await api.getTHORNameDetail(name)
        if (resp.status == 404) {
          return undefined
        } else if (resp.status == 200) {
          return resp.data
        }
      } catch (e) {
        // if (resp.status == 404) {
        //   return undefined
        // }
        //console.error(e)
      }
    }
    throw Error(`Midgard not responding`)
  }
}
