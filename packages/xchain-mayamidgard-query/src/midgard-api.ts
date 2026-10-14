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

import { ActionHistory, GetActionsParams, MAYANameDetails, MidgardConfig, ReverseMAYANames } from './types'
const defaultMidgardConfig: Record<Network, MidgardConfig> = {
  mainnet: {
    apiRetries: 3,
    midgardBaseUrls: ['https://midgard.mayachain.info', 'https://midgard-maya.liquify.com'],
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

  async getPools(): Promise<PoolDetail[]> {
    for (const client of this.midgardClients) {
      try {
        return (await client.getPools()).data
      } catch (_e) {}
    }
    throw new Error(`Midgard not responding`)
  }

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

  public async getHealth(): Promise<Health> {
    for (const client of this.midgardClients) {
      try {
        return (await client.getHealth()).data
      } catch (_e) {}
    }
    throw Error(`Midgard not responding`)
  }

  public async getPoolStats(asset: string): Promise<PoolStatsDetail> {
    for (const client of this.midgardClients) {
      try {
        return (await client.getPoolStats(asset)).data
      } catch (_e) {}
    }
    throw Error(`Midgard not responding`)
  }

  public async getMemberDetails(member: string): Promise<MemberDetails> {
    for (const client of this.midgardClients) {
      try {
        return (await client.getMemberDetail(member)).data
      } catch (_e) {}
    }
    throw Error(`Midgard not responding`)
  }

  /**
   * Paginated by 50. address, asset, type, and affiliate are comma-separated; asset also accepts synth, nosynth, norune.
   * timestamp/height are older-than; fromTimestamp/fromHeight are newer-than. limit defaults to 50, offset to 0.
   */
  public async getActions({
    address,
    txid,
    asset,
    type,
    affiliate,
    limit,
    offset,
    nextPageToken,
    timestamp,
    height,
    prevPageToken,
    fromTimestamp,
    fromHeight,
  }: GetActionsParams): Promise<ActionHistory> {
    for (const api of this.midgardClients) {
      try {
        const response = await api.getActions(
          address,
          txid,
          asset,
          type,
          affiliate,
          limit,
          offset,
          nextPageToken,
          timestamp,
          height,
          prevPageToken,
          fromTimestamp,
          fromHeight,
        )
        return response.data
      } catch (_e) {}
    }
    throw new Error(`Midgard not responding`)
  }
}
