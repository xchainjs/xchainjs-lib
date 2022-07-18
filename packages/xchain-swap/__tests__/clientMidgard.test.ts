import { Network } from '@xchainjs/xchain-client'
import { InboundAddressesItem, PoolDetail } from '@xchainjs/xchain-midgard'
import { BTCChain } from '@xchainjs/xchain-util'

import { Midgard } from '../src/utils/midgard'

// eslint-disable-next-line ordered-imports/ordered-imports
import mockMidgardApi from '../__mocks__/midgard-api'

const mainnetMidgard = new Midgard(Network.Mainnet)

describe('Midgard Client Test', () => {
  beforeEach(() => {
    mockMidgardApi.init()
  })
  afterEach(() => {
    mockMidgardApi.restore()
  })

  const networkName = 'FullImpLossProtectionBlocks'
  const FullImpLossProtectionBlocks = 1440000

  const poolDetail: PoolDetail = {
    annualPercentageRate: '0.22630035115715733',
    asset: 'BCH.BCH',
    assetDepth: '672725342458',
    assetPrice: '47.8855454090496',
    assetPriceUSD: '100.49286962864382',
    liquidityUnits: '21313725982554',
    poolAPY: '0.22630035115715733',
    runeDepth: '32213819934091',
    status: 'available',
    synthSupply: '70021630527',
    synthUnits: '1170133172651',
    units: '22483859155205',
    volume24h: '6189085819437',
  }
  const inboundBCHAdress: InboundAddressesItem = {
    chain: 'BCH',
    pub_key: 'thorpub1addwnpepq2fsvewl3ph68mx4v70v46eu7d36dkyuenk9p5d59gaf7kn4l3gczenjkw0',
    address: 'qzjzvcm4h0xkrv9s2txltjru4zh9gxuvpuvhedl75q',
    halted: false,
    gas_rate: '3',
  }
  const vault = 'bc1q5snxxadme4smpvzjeh6usl9g4e2phrq0vqmg7f'

  const blockHeight = 6481698

  // Tests for the midgard api
  it(`Should return pools array and match interface type PoolDetail`, async () => {
    const poolData = await mainnetMidgard.getPools()
    expect(poolData[0]).toEqual(poolDetail)
  })
  it(`Should return inbound addresses`, async () => {
    const inboundAddress = await mainnetMidgard.getAllInboundAddresses()
    expect(inboundAddress[0]).toEqual(inboundBCHAdress)
  })
  it(`Should return all inbound details `, async () => {
    const inboundDetails = await mainnetMidgard.getInboundDetails([BTCChain])
    const inboundVault = inboundDetails.find((item) => {
      return item
    })
    expect(inboundVault?.vault).toEqual(vault)
  })
  it(`Should return latest block height`, async () => {
    const latestBlockheight = await mainnetMidgard.getLatestBlockHeight()
    expect(latestBlockheight).toEqual(blockHeight)
  })
  it(`Should return networkValue by name`, async () => {
    const networkValue = await mainnetMidgard.getNetworkValueByName(networkName)
    expect(networkValue).toBeTruthy()
    expect(networkValue).toEqual(FullImpLossProtectionBlocks)
  })
  it(`Should return pools array`, async () => {
    const scheduledOutbound = await mainnetMidgard.getScheduledOutboundValue()
    expect(scheduledOutbound).toBeTruthy()
  })
})
