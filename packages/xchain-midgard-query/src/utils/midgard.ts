import { Network } from '@xchainjs/xchain-client'
import {
  Configuration,
  GetActions200Response as ActionHistory,
  MidgardApi,
  PoolDetail,
  ReverseTHORNames,
  THORNameDetails,
} from '@xchainjs/xchain-midgard'
import axios from 'axios'
import axiosRetry from 'axios-retry'

import { GetActionsParams, MidgardConfig } from '../types'

const defaultMidgardConfig: Record<Network, MidgardConfig> = {
  mainnet: {
    apiRetries: 3,
    midgardBaseUrls: ['https://gateway.liquify.com/chain/thorchain_midgard'],
  },
  stagenet: {
    apiRetries: 3,
    midgardBaseUrls: [],
  },
  // THORChain has no testnet. An empty list fails the lookup instead of requesting a host named deprecated.
  testnet: {
    apiRetries: 3,
    midgardBaseUrls: [],
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

  async getPools(): Promise<PoolDetail[]> {
    for (const api of this.midgardApis) {
      try {
        return (await api.getPools()).data
      } catch (_e) {
        // console.error(_e)
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
        if (e?.response?.status == 404) {
          return undefined
        }
      }
    }
    throw Error(`Midgard not responding`)
  }

  public async getTHORNameReverseLookup(address: string): Promise<ReverseTHORNames | undefined> {
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
        if (e?.response?.status == 404) {
          return []
        }
      }
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
    txType,
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
    for (const api of this.midgardApis) {
      try {
        const response = await api.getActions(
          address,
          txid,
          asset,
          type,
          txType,
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
