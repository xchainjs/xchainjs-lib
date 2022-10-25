import { Network } from '@xchainjs/xchain-client'
import {
  Action,
  Configuration,
  // InboundAddressesItem,
  MemberDetails,
  MidgardApi,
  PoolDetail,
  PoolStatsDetail,
  THORNameDetails,
} from '@xchainjs/xchain-midgard'
import { AssetRuneNative, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'
import axiosRetry from 'axios-retry'
// import BigNumber from 'bignumber.js'

import { CryptoAmount } from '../crypto-amount'
import { MidgardConfig } from '../types'

const defaultMidgardConfig: Record<Network, MidgardConfig> = {
  mainnet: {
    apiRetries: 3,
    midgardBaseUrls: [
      'https://midgard.ninerealms.com',
      'https://midgard.thorchain.info',
      'https://midgard.thorswap.net',
    ],
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
  async getMimirDetails(): Promise<Record<string, number>> {
    const path = '/v2/thorchain/mimir'

    for (const baseUrl of this.config.midgardBaseUrls) {
      try {
        const { data } = await axios.get<Record<string, number>>(`${baseUrl}${path}`)
        return data
      } catch (e) {
        console.error(e)
      }
    }
    throw new Error('Midgard not responding')
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
        console.error(e)
      }
    }
    throw Error(`Midgard not responding`)
  }

  /**
   *
   * @returns - constants
   */
  private async getConstantsDetails(): Promise<Record<string, number>> {
    const path = '/v2/thorchain/constants'
    for (const baseUrl of this.config.midgardBaseUrls) {
      try {
        const { data } = await axios.get(`${baseUrl}${path}`)
        return data.int_64_values
      } catch (e) {
        console.error(e)
      }
    }
    throw new Error('Midgard not responding')
  }

  /**
   *
   * @returns the outbound Tx Value in RUNE (Basemount)
   */
  async getScheduledOutboundValue(): Promise<CryptoAmount> {
    const path = '/v2/thorchain/queue'
    for (const baseUrl of this.config.midgardBaseUrls) {
      try {
        const { data } = await axios.get(`${baseUrl}${path}`)
        const value = new CryptoAmount(baseAmount(data['scheduled_outbound_value']), AssetRuneNative)
        return value
      } catch (e) {
        console.error(e)
      }
    }

    throw new Error('Midgard not responding')
  }

  /**
   * Function that wraps Mimir and Constants to return the value from a given constant name. Searchs Mimir first.
   *
   * @param networkValueName the network value to be used to search the contsants
   * @returns the mimir or constants value
   */
  public async getNetworkValues(): Promise<Record<string, number>> {
    const [mimirDetails, constantDetails] = await Promise.all([this.getMimirDetails(), this.getConstantsDetails()])
    const retVal: Record<string, number> = {}
    // insert constants first
    for (const constantKey of Object.keys(constantDetails)) {
      retVal[constantKey.toUpperCase()] = constantDetails[constantKey]
    }
    // mimir will overwrite any dupe constants
    for (const mimirKey of Object.keys(mimirDetails)) {
      const mimirValue = mimirDetails[mimirKey]
      retVal[mimirKey.toUpperCase()] = mimirValue
    }

    return retVal
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
        console.error(e)
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
        console.error(e)
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
        console.error(e)
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
        console.error(e)
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
        console.error(e)
      }
    }
    throw Error(`Midgard not responding`)
  }
}
