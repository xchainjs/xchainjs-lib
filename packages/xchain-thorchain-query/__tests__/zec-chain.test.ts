import BigNumber from 'bignumber.js'

import { InboundDetail } from '../src/types'
import { AssetZEC, ZECChain } from '../src/utils/const'
import { calcNetworkFee, calcOutboundFee, getChain, getChainAsset } from '../src/utils/utils'

const mockZecInbound: InboundDetail = {
  chain: ZECChain,
  address: 't1MockAddress',
  gasRate: new BigNumber(10),
  gasRateUnits: 'zats',
  outboundTxSize: new BigNumber(250),
  outboundFee: new BigNumber(10000),
  haltedChain: false,
  haltedTrading: false,
  haltedLP: false,
}

describe('ZEC chain helpers', () => {
  it('Should resolve ZECChain and AssetZEC', () => {
    expect(getChain('ZEC')).toBe(ZECChain)
    expect(getChainAsset(ZECChain)).toEqual(AssetZEC)
    expect(AssetZEC.chain).toBe('ZEC')
    expect(AssetZEC.symbol).toBe('ZEC')
  })

  it('Should use gasRate alone as the ZIP-317 network fee', () => {
    const fee = calcNetworkFee(AssetZEC, mockZecInbound)
    expect(fee.asset).toEqual(AssetZEC)
    // gasRate is already the full fee; outboundTxSize must not inflate it
    expect(fee.baseAmount.amount().toNumber()).toBe(10)
  })

  it('Should calculate ZEC outbound fee', () => {
    const fee = calcOutboundFee(AssetZEC, mockZecInbound)
    expect(fee.asset).toEqual(AssetZEC)
    expect(fee.baseAmount.amount().toNumber()).toBe(10000)
  })
})
