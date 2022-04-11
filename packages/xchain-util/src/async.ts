import axios from 'axios'
// eslint-disable-next-line ordered-imports/ordered-imports
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

const midgardBaseUrls = {
  primary: 'https://midgard.ninerealms.com',
  backup: 'https://midgard.thorswap.net',
}

export const getMimirDetails = async () => {
  const path = '/v2/thorchain/mimir'
  try {
    const { data } = await axios.get(`${midgardBaseUrls.primary}${path}`)
    return data
  } catch (e) {
    const { data } = await axios.get(`${midgardBaseUrls.backup}${path}`)
    return data
  }
}

export const getAllInboundDetails = async (): Promise<Array<ServerInboundDetail>> => {
  const path = '/v2/thorchain/inbound_addresses'
  try {
    const { data } = await axios.get(`${midgardBaseUrls.primary}${path}`)
    return data
  } catch (e) {
    const { data } = await axios.get(`${midgardBaseUrls.backup}${path}`)
    return data
  }
}

export const getInboundDetails = async (chain: Chain): Promise<InboundDetail> => {
  const [mimirDetails, allInboundDetails] = await Promise.all([getMimirDetails(), getAllInboundDetails()])
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
