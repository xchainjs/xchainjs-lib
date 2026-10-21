import { Pool } from '@xchainjs/xchain-mayanode'
import { MidgardQuery } from '@xchainjs/xchain-mayamidgard-query'

import { MayachainCache } from '../src/mayachain-cache'
import { Mayanode } from '../src/utils'

const pool = (overrides: Partial<Pool>): Pool => ({
  balance_cacao: '0',
  balance_asset: '0',
  asset: 'BTC.BTC',
  LP_units: '1',
  pool_units: '1',
  status: 'available',
  synth_units: '0',
  synth_supply: '0',
  pending_inbound_cacao: '0',
  pending_inbound_asset: '0',
  synth_mint_paused: false,
  bondable: false,
  ...overrides,
})

const cacheWith = (pools: Pool[]): MayachainCache =>
  new MayachainCache({} as MidgardQuery, { getPools: async () => pools } as Mayanode)

describe('MayachainCache pool conversion', () => {
  it('prices the asset from human cacao and asset balances', async () => {
    const [converted] = await cacheWith([
      pool({
        balance_cacao: '1000000000000',
        balance_asset: '200000000',
        status: 'Available',
      }),
    ]).getPools()

    expect(converted.assetPrice).toBe('50')
    expect(converted.status).toBe('available')
    expect(converted.nativeDecimal).toBe('8')
  })

  it('keeps a reported decimal and lowercases staged status', async () => {
    const [converted] = await cacheWith([
      pool({
        asset: 'ADA.ADA',
        decimals: 6,
        status: 'Staged',
        balance_cacao: '1000000000000',
        balance_asset: '2000000',
      }),
    ]).getPools()

    expect(converted.status).toBe('staged')
    expect(converted.nativeDecimal).toBe('6')
    // 100 CACAO / 0.02 of 1e8 asset depth
    expect(converted.assetPrice).toBe('5000')
  })

  it('prices 1e8 depth when the node reports zero decimals', async () => {
    const [converted] = await cacheWith([
      pool({
        asset: 'ETH.ETH',
        decimals: 0,
        balance_cacao: '1000000000000',
        balance_asset: '200000000',
      }),
    ]).getPools()

    expect(converted.nativeDecimal).toBe('0')
    expect(converted.assetPrice).toBe('50')
  })

  it('falls back to the known decimal when the contract case differs', async () => {
    const [converted] = await cacheWith([
      pool({
        asset: 'ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
        status: 'available',
      }),
    ]).getPools()

    expect(converted.nativeDecimal).toBe('6')
  })

  it('keeps synth units and supply from the node', async () => {
    const [converted] = await cacheWith([
      pool({
        LP_units: '10',
        synth_units: '5',
        synth_supply: '456',
        pool_units: '',
      }),
    ]).getPools()

    expect(converted.synthUnits).toBe('5')
    expect(converted.synthSupply).toBe('456')
    expect(converted.units).toBe('15')
  })
})
