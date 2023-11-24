import { Network } from '@xchainjs/xchain-client'
import { Configuration, MidgardApi, PoolDetail } from '@xchainjs/xchain-mayamidgard'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { MAYANameDetails, MidgardConfig, ReverseMAYANames } from '../types'

const defaultMidgardConfig: Record<Network, MidgardConfig> = {
  mainnet: {
    apiRetries: 3,
    midgardBaseUrls: ['https://midgard.mayachain.info'],
  },
  stagenet: {
    apiRetries: 3,
    midgardBaseUrls: ['https://stagenet.midgard.mayachain.info'],
  },
  testnet: {
    apiRetries: 3,
    // midgard currently has no testnet
    midgardBaseUrls: ['https://stagenet.midgard.mayachain.info'],
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
   *
   * @returns an array containing details for a set of pools
   */
  async getPools(): Promise<PoolDetail[]> {
    for (const api of this.midgardApis) {
      try {
        return (await api.getPools()).data
      } catch (e) {}
    }
    throw new Error(`Midgard not responding`)
  }

  /**
   * Get MayaName details
   * @param {string} name MayaName
   * @returns an array of chains and their addresses associated with the given THORName
   */
  public async getMayaNameDetails(name: string): Promise<MAYANameDetails | undefined> {
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

  /**
   * Gives a list of MayaNames by reverse lookup
   * @param {string} address to know if it has a MayaName associated with
   * @returns an array of THORNames associated with the given address
   */
  public async getMAYANameReverseLookup(address: string): Promise<ReverseMAYANames | undefined> {
    for (const api of this.midgardApis) {
      try {
        const resp = await api.getTHORNamesByAddress(address)
        if (resp.status == 404) {
          return []
        } else if (resp.status == 200) {
          return resp.data
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.response.status == 404) {
          return []
        }
      }
    }
    throw Error(`Midgard not responding`)
  }
}
