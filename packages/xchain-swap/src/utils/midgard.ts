import { Network } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { InboundDetail, ServerInboundDetail } from '../types'

const axios = require('axios')

const midgardBaseUrls: { [key: string]: Array<string> } = {
  [Network.Testnet]: ['https://testnet.midgard.thorchain.info'],
  [Network.Mainnet]: ['https://midgard.ninerealms.com', 'https://midgard.thorswap.net'],
}
// import { Configuration, MidgardApi } from '@xchainjs/xchain-midgard'
// const midgardApi = new MidgardApi(new Configuration({ basePath: this.config.midgardBaseUrl }))

export const getMimirDetails = async (network = Network.Mainnet) => {
  const path = '/v2/thorchain/mimir'

  for (const baseUrl of midgardBaseUrls[network]) {
    try {
      const { data } = await axios.get(`${baseUrl}${path}`)
      return data
    } catch (e) {
      console.error(e)
    }
  }

  throw new Error('Midgard not responding')
}

export const getAllInboundDetails = async (network = Network.Mainnet): Promise<Array<ServerInboundDetail>> => {
  const path = '/v2/thorchain/inbound_addresses'

  for (const baseUrl of midgardBaseUrls[network]) {
    try {
      const { data } = await axios.get(`${baseUrl}${path}`)
      return data
    } catch (e) {
      console.error(e)
    }
  }

  throw new Error('Midgard not responding')
}

export const getInboundDetails = async (chain: Chain, network = Network.Mainnet): Promise<InboundDetail> => {
  const [mimirDetails, allInboundDetails] = await Promise.all([getMimirDetails(network), getAllInboundDetails(network)])
  const inboundDetail = allInboundDetails?.find((item: ServerInboundDetail) => item.chain === chain)
  if (inboundDetail) {
    const details: InboundDetail = {
      vault: inboundDetail.address,
      gas_rate: new BigNumber(inboundDetail.gas_rate),
      haltedChain: inboundDetail?.halted || !!mimirDetails[`HALT${chain}CHAIN`] || !!mimirDetails['HALTCHAINGLOBAL'],
      haltedTrading: !!mimirDetails['HALTTRADING'] || !!mimirDetails[`HALT${chain}TRADING`],
      haltedLP: !!mimirDetails['PAUSELP'] || !!mimirDetails[`PAUSELP${chain}`],
    }

    if (inboundDetail?.router) details.router = inboundDetail.router

    return details
  } else {
    throw new Error(`Could not get chain details for ${chain}`)
  }
}
