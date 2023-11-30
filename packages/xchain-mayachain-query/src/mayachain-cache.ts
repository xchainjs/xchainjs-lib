import { MidgardQuery } from '@xchainjs/xchain-mayamidgard-query'
import { CachedValue } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

import { InboundDetail } from './types'
import { MayaChain, Mayanode } from './utils'

export type MayachainCacheConf = {
  expirationTimeInboundAddress: number
}
/**
 * This class manages retrieving information from up to date Mayachain
 */
export class MayachainCache {
  readonly midgardQuery: MidgardQuery
  readonly mayanode: Mayanode
  private conf: MayachainCacheConf
  private readonly inboundDetailCache: CachedValue<Record<string, InboundDetail>>
  /**
   * Constructor to create a MayachainCache
   *
   * @param midgardQuery - an instance of the Maya MidgardQuery API
   * @param mayanode
   * @returns MayachainCache
   */
  constructor(
    midgardQuery = new MidgardQuery(),
    mayanode = new Mayanode(),
    configuration?: Partial<MayachainCacheConf>,
  ) {
    this.midgardQuery = midgardQuery
    this.mayanode = mayanode
    this.conf = { expirationTimeInboundAddress: 6000, ...configuration }

    this.inboundDetailCache = new CachedValue<Record<string, InboundDetail>>(
      () => this.refreshInboundDetailCache(),
      this.conf.expirationTimeInboundAddress,
    )
  }

  /**
   * Get inbound addresses details
   * @returns Inbound details
   */
  public async getInboundDetails(): Promise<Record<string, InboundDetail>> {
    if (!this.inboundDetailCache) throw Error(`Could not refresh inbound details`)
    return await this.inboundDetailCache.getValue()
  }

  /**
   * Refreshes the InboundDetailCache Cache
   */
  private async refreshInboundDetailCache(): Promise<Record<string, InboundDetail>> {
    const [mimirDetails, allInboundAddresses] = await Promise.all([
      this.mayanode.getMimir(),
      this.mayanode.getInboundAddresses(),
    ])
    const inboundDetails: Record<string, InboundDetail> = {}
    for (const inbound of allInboundAddresses) {
      const chain = inbound.chain
      if (
        !chain ||
        !inbound.gas_rate ||
        !inbound.address ||
        !inbound.gas_rate_units ||
        !inbound.outbound_tx_size ||
        !inbound.outbound_fee ||
        !inbound.gas_rate_units
      )
        throw new Error(`Missing required inbound info`)

      inboundDetails[chain] = {
        chain: chain,
        address: inbound.address,
        router: inbound.router,
        gasRate: new BigNumber(inbound.gas_rate),
        gasRateUnits: inbound.gas_rate_units,
        outboundTxSize: new BigNumber(inbound.outbound_tx_size),
        outboundFee: new BigNumber(inbound.outbound_fee),
        haltedChain: inbound?.halted || !!mimirDetails[`HALT${chain}CHAIN`] || !!mimirDetails['HALTCHAINGLOBAL'],
        haltedTrading: !!mimirDetails['HALTTRADING'] || !!mimirDetails[`HALT${chain}TRADING`],
        haltedLP: !!mimirDetails['PAUSELP'] || !!mimirDetails[`PAUSELP${chain}`],
      }
    }
    // add mock MAYAChain inbound details
    inboundDetails[MayaChain] = {
      chain: MayaChain,
      address: '',
      router: '',
      gasRate: new BigNumber(0),
      gasRateUnits: '',
      outboundTxSize: new BigNumber(0),
      outboundFee: new BigNumber(0),
      haltedChain: false,
      haltedTrading: !!mimirDetails['HALTTRADING'],
      haltedLP: false, //
    }

    return inboundDetails
  }
}
