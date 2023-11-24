import { Network } from '@xchainjs/xchain-client'
import { Configuration, Health, MidgardApi as MidgardClient, PoolDetail } from '@xchainjs/xchain-mayamidgard'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { MAYANameDetails, MidgardConfig, ReverseMAYANames } from './types'

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

export class MidgardApi {
  private config: MidgardConfig
  readonly network: Network
  private midgardClients: MidgardClient[]

  constructor(network: Network = Network.Mainnet, config?: MidgardConfig) {
    this.network = network
    this.config = config ?? defaultMidgardConfig[this.network]
    axiosRetry(axios, { retries: this.config.apiRetries, retryDelay: axiosRetry.exponentialDelay })
    this.midgardClients = this.config.midgardBaseUrls.map(
      (url: string) => new MidgardClient(new Configuration({ basePath: url })),
    )
  }

  /**
   *
   * @returns an array containing details for a set of pools
   */
  async getPools(): Promise<PoolDetail[]> {
    for (const client of this.midgardClients) {
      try {
        return (await client.getPools()).data
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
    for (const client of this.midgardClients) {
      try {
        const resp = await client.getTHORNameDetail(name)
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
    for (const client of this.midgardClients) {
      try {
        const resp = await client.getTHORNamesByAddress(address)
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

  /**
   * Gets network health info
   * @returns an object containing the health response of the API
   */
  public async getHealth(): Promise<Health> {
    for (const client of this.midgardClients) {
      try {
        return (await client.getHealth()).data
      } catch (e) {}
    }
    throw Error(`Midgard not responding`)
  }
}
