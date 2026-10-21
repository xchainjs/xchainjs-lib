import BigNumber from 'bignumber.js'

import { InboundDetail } from '../src/types'
import { AssetBASE, AssetBSC, AssetETH, AssetATOM, AssetSOL, assetUSDC } from '../src/utils/const'
import { calcNetworkFee, calcOutboundFee } from '../src/utils/utils'

const inbound = (overrides: Partial<InboundDetail>): InboundDetail => ({
  chain: 'ETH',
  address: '0xvault',
  gasRate: new BigNumber(15),
  gasRateUnits: 'gwei',
  outboundTxSize: new BigNumber(100000),
  outboundFee: new BigNumber(10416),
  haltedChain: false,
  haltedTrading: false,
  haltedLP: false,
  ...overrides,
})

describe('network and outbound fees', () => {
  it('prices an ETH transfer as gas rate in gwei times 21000', () => {
    const fee = calcNetworkFee(AssetETH, inbound({}))
    expect(fee.asset).toEqual(AssetETH)
    expect(fee.baseAmount.decimal).toBe(18)
    expect(fee.baseAmount.amount().toFixed()).toBe('315000000000000')
  })

  it('prices an ERC20 deposit with the 70000 gas limit and the gas asset', () => {
    const fee = calcNetworkFee(assetUSDC, inbound({}))
    expect(fee.asset).toEqual(AssetETH)
    expect(fee.baseAmount.amount().toFixed()).toBe('1050000000000000')
  })

  it('prices BSC in gwei and 18 decimals, not the raw gas rate at 8 decimals', () => {
    const fee = calcNetworkFee(
      AssetBSC,
      inbound({ chain: 'BSC', gasRate: new BigNumber(1), gasRateUnits: 'gwei', outboundTxSize: new BigNumber(100000) }),
    )
    expect(fee.baseAmount.decimal).toBe(18)
    expect(fee.baseAmount.amount().toFixed()).toBe('21000000000000')
  })

  it('prices BASE from mwei', () => {
    const fee = calcNetworkFee(
      AssetBASE,
      inbound({
        chain: 'BASE',
        gasRate: new BigNumber(150),
        gasRateUnits: 'mwei',
        outboundTxSize: new BigNumber(100000),
      }),
    )
    expect(fee.asset).toEqual(AssetBASE)
    expect(fee.baseAmount.decimal).toBe(18)
    // 150 mwei * 1e6 * 21000
    expect(fee.baseAmount.amount().toFixed()).toBe('3150000000000')
  })

  it('converts a 1e8 outbound fee into wei with 10 extra decimals', () => {
    const fee = calcOutboundFee(AssetETH, inbound({}))
    expect(fee.baseAmount.decimal).toBe(18)
    expect(fee.baseAmount.amount().toFixed()).toBe('104160000000000')
  })

  it('keeps a GAIA fee in uatom and scales the 1e8 outbound fee down', () => {
    const details = inbound({
      chain: 'GAIA',
      gasRate: new BigNumber(4500),
      gasRateUnits: 'uatom',
      outboundTxSize: new BigNumber(1),
      outboundFee: new BigNumber(14510200),
    })
    const network = calcNetworkFee(AssetATOM, details)
    const outbound = calcOutboundFee(AssetATOM, details)
    expect(network.baseAmount.decimal).toBe(6)
    expect(network.baseAmount.amount().toFixed()).toBe('4500')
    expect(outbound.baseAmount.decimal).toBe(6)
    expect(outbound.baseAmount.amount().toFixed()).toBe('145102')
  })

  it('scales a SOL outbound fee from 1e8 to lamports', () => {
    const fee = calcOutboundFee(
      AssetSOL,
      inbound({
        chain: 'SOL',
        gasRate: new BigNumber(7500),
        gasRateUnits: 'lamport',
        outboundTxSize: new BigNumber(1),
        outboundFee: new BigNumber(196578),
      }),
    )
    expect(fee.baseAmount.decimal).toBe(9)
    expect(fee.baseAmount.amount().toFixed()).toBe('1965780')
  })
})
