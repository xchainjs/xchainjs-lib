import { PoolDetail } from '@xchainjs/xchain-midgard'

import mockMayanodeApi from '../__mocks__/mayanode-api'
import mockMidgardApi from '../__mocks__/midgard-api'
import { Midgard } from '../src/utils/midgard'

const mainnetMidgard = new Midgard()

describe('Midgard Client Test', () => {
  beforeAll(() => {
    mockMidgardApi.init()
    mockMayanodeApi.init()
  })
  afterEach(() => {
    mockMidgardApi.restore()
    mockMayanodeApi.restore()
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
  // const inboundBCHAdress: InboundAddressesItem = {
  //   chain: 'BCH',
  //   pub_key: 'thorpub1addwnpepq2fsvewl3ph68mx4v70v46eu7d36dkyuenk9p5d59gaf7kn4l3gczenjkw0',
  //   address: 'qzjzvcm4h0xkrv9s2txltjru4zh9gxuvpuvhedl75q',
  //   halted: false,
  //   gas_rate: '3',
  // }
  // const vault = 'bc1q5snxxadme4smpvzjeh6usl9g4e2phrq0vqmg7f'

  const blockHeight = 6481698

  // Tests for the midgard api
  it(`Should return pools array and match interface type PoolDetail`, async () => {
    const poolData = await mainnetMidgard.getPools()
    expect(poolData[2]).toEqual(poolDetail)
  })
  // it(`Should return inbound addresses`, async () => {
  //   const inboundAddress = await mainnetMidgard.getAllInboundAddresses()
  //   expect(inboundAddress[0]).toEqual(inboundBCHAdress)
  // })
  // it(`Should return all inbound details `, async () => {
  //   const inboundDetails = await mainnetMidgard.getInboundDetails()
  //   const inboundVault = inboundDetails[BTCChain]
  //   expect(inboundVault?.vault).toEqual(vault)
  // })
  it(`Should return latest block height`, async () => {
    const latestBlockheight = await mainnetMidgard.getLatestBlockHeight()
    expect(latestBlockheight).toEqual(blockHeight)
  })
})
