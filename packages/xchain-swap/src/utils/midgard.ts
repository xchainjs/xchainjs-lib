import { Network } from '@xchainjs/xchain-client'
import { Configuration, InboundAddressesItem, MidgardApi, PoolDetail } from '@xchainjs/xchain-midgard'
import { BaseAmount, Chain, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import BigNumber from 'bignumber.js'

import { InboundDetail, MidgardConfig } from '../types'

const defaultMidgardConfig: Record<Network, MidgardConfig> = {
  mainnet: {
    apiRetries: 3,
    midgardBaseUrls: [
      'https://midgard.thorchain.info',
      'https://midgard.thorswap.net',
      'https://midgard.ninerealms.com',
    ],
  },
  stagenet: {
    apiRetries: 3,
    midgardBaseUrls: ['https://stagenet-midgard.ninerealms.com/'],
  },
  testnet: {
    apiRetries: 3,
    midgardBaseUrls: ['https://testnet.midgard.thorchain.info/'],
  },
}

export class Midgard {
  private config: MidgardConfig
  private network: Network
  private midgardApis: MidgardApi[]
  constructor(network: Network = Network.Mainnet, config?: MidgardConfig) {
    this.network = network
    this.config = config ?? defaultMidgardConfig[this.network]
    axiosRetry(axios, { retries: this.config.apiRetries, retryDelay: axiosRetry.exponentialDelay })
    this.midgardApis = this.config.midgardBaseUrls.map((url) => new MidgardApi(new Configuration({ basePath: url })))
  }
  private async getMimirDetails() {
    const path = '/v2/thorchain/mimir'

    for (const baseUrl of this.config.midgardBaseUrls) {
      try {
        const { data } = await axios.get(`${baseUrl}${path}`)
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
  async getAllInboundAddresses(): Promise<InboundAddressesItem[]> {
    for (const api of this.midgardApis) {
      try {
        return (await api.getProxiedInboundAddresses()).data
      } catch (e) {
        console.error(e)
      }
    }
    throw Error(`Midgard not responding`)
  }
  /**
   * Gets the Inbound Details for a given array of Chains.
   * Will check if chain is THOR.
   * @param chains - external chains
   * @returns inbound details of given chains
   */
  async getInboundDetails(chains: Chain[]): Promise<InboundDetail[]> {
    const [mimirDetails, allInboundDetails] = await Promise.all([this.getMimirDetails(), this.getAllInboundAddresses()])
    const inboundDetails: InboundDetail[] = []
    for (const chain of chains) {
      if (chain != Chain.THORChain) {
        const inboundDetail = allInboundDetails?.find((item: InboundAddressesItem) => item.chain === chain)
        if (inboundDetail) {
          if (!inboundDetail.gas_rate) throw new Error(`Could not get gas_rate for ${chain}`)
          const details: InboundDetail = {
            vault: inboundDetail.address,
            gas_rate: new BigNumber(inboundDetail.gas_rate),
            haltedChain:
              inboundDetail?.halted || !!mimirDetails[`HALT${chain}CHAIN`] || !!mimirDetails['HALTCHAINGLOBAL'],
            haltedTrading: !!mimirDetails['HALTTRADING'] || !!mimirDetails[`HALT${chain}TRADING`],
            haltedLP: !!mimirDetails['PAUSELP'] || !!mimirDetails[`PAUSELP${chain}`],
          }

          if (inboundDetail?.router) details.router = inboundDetail.router
          inboundDetails.push(details)
        } else {
          throw new Error(`Could not get chain details for ${chain}`)
        }
      } else {
        const details: InboundDetail = {
          vault: '',
          gas_rate: new BigNumber(0),
          haltedChain: false,
          haltedTrading: !!mimirDetails['HALTTRADING'],
          haltedLP: false, //
        }
        inboundDetails.push(details)
      }
    }
    return inboundDetails
  }

  private async getConstantsDetails() {
    const path = 'v2/thorchain/constants'
    for (const baseUrl of this.config.midgardBaseUrls) {
      try {
        const { data } = await axios.get(`${baseUrl}${path}`)
        return data
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
  async getScheduledOutboundValue(): Promise<BaseAmount> {
    const path = 'v2/thorchain/queue'

    for (const baseUrl of this.config.midgardBaseUrls) {
      try {
        const { data } = await axios.get(`${baseUrl}${path}`)
        const value = baseAmount(data['scheduled_outbound_value'])
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
  public async getNetworkValueByName(networkValueName: string): Promise<number> {
    const [mimirDetails] = await Promise.all([this.getMimirDetails()])
    const [constantDetails] = await Promise.all([this.getConstantsDetails()])
    const mimirValue = mimirDetails[networkValueName.toUpperCase()]
    const constantsValue = constantDetails['int_64_values'][networkValueName]
    if (mimirValue != undefined) {
      return mimirValue
    } else if (constantDetails != undefined) {
      return constantsValue
    } else {
      throw Error(`Could not find network value name`)
    }
  }

  /**
   * Gets the latest block using the Health endpoint within Midgard
   *
   * @returns
   */
  public async getLatestBlocHeightk(): Promise<number> {
    for (const api of this.midgardApis) {
      try {
        const data = (await api.getHealth()).data
        return Number(data.scannerHeight)
      } catch (e) {
        console.error(e)
      }
    }
    throw Error(`Midgard not responding`)
  }
}
