import { Network } from '@xchainjs/xchain-client'
const axios = require('axios')
import { Chain } from './chain'
import { InboundDetail, ServerInboundDetail } from './types'

/**
 * Helper to delay anything within an `async` function
 *
 * @param ms delay in milliseconds
 *
 * @example
 *
 * ```
 * const anyAsyncFunc = async () => {
 *  // do something
 *  console.log('before delay')
 *  // wait for 200ms
 *  await delay(200)
 *  // and do other things
 *  console.log('after delay')
 * }
 * ```
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const midgardBaseUrls: { [key: string]: Array<string> } = {
  [Network.Testnet]: ['https://testnet.midgard.thorchain.info'],
  [Network.Mainnet]: ['https://midgard.ninerealms.com', 'https://midgard.thorswap.net'],
}

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

  const details: InboundDetail = {
    vault: inboundDetail?.address || '',
    haltedChain: inboundDetail?.halted || !!mimirDetails[`HALT${chain}CHAIN`] || !!mimirDetails['HALTCHAINGLOBAL'],
    haltedTrading: !!mimirDetails['HALTTRADING'] || !!mimirDetails[`HALT${chain}TRADING`],
    haltedLP: !!mimirDetails['PAUSELP'] || !!mimirDetails[`PAUSELP${chain}`],
  }

  if (inboundDetail?.router) details.router = inboundDetail.router

  return details
}
