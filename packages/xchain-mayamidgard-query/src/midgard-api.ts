import { Network } from '@xchainjs/xchain-client'
import {
  Configuration,
  Health,
  MemberDetails,
  MidgardApi as MidgardClient,
  PoolDetail,
  PoolStatsDetail,
} from '@xchainjs/xchain-mayamidgard'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { MAYANameDetails, MidgardConfig, ReverseMAYANames } from './types'
/**
 * Default configuration for Midgard API based on different networks.
 */
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
/**
 * Class for interacting with the Midgard API.
 */
export class MidgardApi {
  private config: MidgardConfig
  readonly network: Network
  private midgardClients: MidgardClient[]
  /**
   * Constructor to create a MidgardApi instance.
   * @param network - The network to connect to. Default is Mainnet.
   * @param config - Configuration options for the Midgard API.
   */
  constructor(network: Network = Network.Mainnet, config?: MidgardConfig) {
    this.network = network
    this.config = config ?? defaultMidgardConfig[this.network]
    axiosRetry(axios, { retries: this.config.apiRetries, retryDelay: axiosRetry.exponentialDelay })
    this.midgardClients = this.config.midgardBaseUrls.map(
      (url: string) => new MidgardClient(new Configuration({ basePath: url })),
    )
  }

  /**
   * Get details for a set of pools.
   * @returns An array containing details for a set of pools.
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
   * Get MAYAName details.
   * @param {string} name - MAYAName to get details for.
   * @returns An object containing chains and their addresses associated with the given MAYAName.
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
   * Perform reverse lookup to get MAYAName(s) associated with a given address.
   * @param {string} address - Address to perform reverse lookup for.
   * @returns An array of MAYANames associated with the given address.
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
   * Get network health information.
   * @returns An object containing the health response of the Midgard API.
   */
  public async getHealth(): Promise<Health> {
    for (const client of this.midgardClients) {
      try {
        return (await client.getHealth()).data
      } catch (e) {}
    }
    throw Error(`Midgard not responding`)
  }

  /**
   * Get pool statistics for a particular asset.
   * @param {string} asset - Asset string to query its pool stats.
   * @returns Pool statistics detail object.
   */
  public async getPoolStats(asset: string): Promise<PoolStatsDetail> {
    for (const client of this.midgardClients) {
      try {
        return (await client.getPoolStats(asset)).data
      } catch (e) {}
    }
    throw Error(`Midgard not responding`)
  }

  /**
   * Get member details based on a valid liquidity position.
   * @param {string} member - Member address to query for liquidity pool details.
   * @returns Object containing member details.
   */
  public async getMemberDetails(member: string): Promise<MemberDetails> {
    for (const client of this.midgardClients) {
      try {
        return (await client.getMemberDetail(member)).data
      } catch (e) {}
    }
    throw Error(`Midgard not responding`)
  }
}
