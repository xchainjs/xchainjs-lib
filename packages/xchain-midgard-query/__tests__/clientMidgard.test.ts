import { PoolDetail } from '@xchainjs/xchain-midgard'

import mockMidgardApi from '../__mocks__/midgard-api'
import { Midgard } from '../src/utils/midgard'

const mainnetMidgard = new Midgard()

describe('Midgard Client Test', () => {
  beforeAll(() => {
    mockMidgardApi.init()
  })
  afterEach(() => {
    mockMidgardApi.restore()
  })

  const poolDetail: PoolDetail = {
    annualPercentageRate: '0.0925796460549001',
    asset: 'BCH.BCH',
    assetDepth: '580355957856',
    assetPrice: '64.89141427538918',
    assetPriceUSD: '129.74904173711747',
    liquidityUnits: '21436675546946',
    nativeDecimal: '8',
    saversDepth: '0',
    saversUnits: '0',
    saversAPR: '0',
    poolAPY: '0.0925796460549001',
    runeDepth: '37660118888424',
    status: 'available',
    synthSupply: '32889120336',
    synthUnits: '625127816672',
    units: '22061803363618',
    volume24h: '8370845079708',
    totalCollateral: '',
    totalDebtTor: '',
  }

  it(`Should return pools array and match interface type PoolDetail`, async () => {
    const poolData = await mainnetMidgard.getPools()
    expect(poolData[2]).toEqual(poolDetail)
  })
})
