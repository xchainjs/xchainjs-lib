import { Network } from '@xchainjs/xchain-client'
import { PoolDetail } from '@xchainjs/xchain-midgard'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { Midgard } from '../src/utils/midgard'

const mainnetMidgard = new Midgard(Network.Mainnet)

describe('Midgard Client Test', () => {
  beforeAll(() => {
    mockMidgardApi.init()
    mockThornodeApi.init()
  })
  afterEach(() => {
    mockMidgardApi.restore()
    mockThornodeApi.restore()
  })
  const networkName = 'FullImpLossProtectionBlocks'
  const FullImpLossProtectionBlocks = 1440000

  const poolDetail: PoolDetail = {
    annualPercentageRate: '0.0925796460549001',
    asset: 'BCH.BCH',
    assetDepth: '580355957856',
    assetPrice: '64.89141427538918',
    assetPriceUSD: '129.74904173711747',
    liquidityUnits: '21436675546946',
    poolAPY: '0.0925796460549001',
    runeDepth: '37660118888424',
    status: 'available',
    synthSupply: '32889120336',
    synthUnits: '625127816672',
    units: '22061803363618',
    volume24h: '8370845079708',
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
    expect(poolData[0]).toEqual(poolDetail)
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
  it(`Should return networkValue by name`, async () => {
    const networkValues = await mainnetMidgard.getNetworkValues()
    const val = networkValues[networkName.toUpperCase()]
    expect(val).toBeTruthy()
    expect(val).toEqual(FullImpLossProtectionBlocks)
  })
  it(`Should return pools array`, async () => {
    const scheduledOutbound = await mainnetMidgard.getScheduledOutboundValue()
    expect(scheduledOutbound).toBeTruthy()
  })
})
