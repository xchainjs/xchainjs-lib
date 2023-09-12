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

  const poolDetail = {
    annualPercentageRate: '0.013595729691758521',
    asset: 'ETH.ETH',
    assetDepth: '90203564606',
    assetPrice: '15946.534299949502',
    assetPriceUSD: '1574.2655930114458',
    liquidityUnits: '137524482425559951',
    poolAPY: '0.013595729691758521',
    runeDepth: '143843423696728998',
    status: 'available',
    synthSupply: '892853674',
    synthUnits: '684008216230231',
    units: '138208490641790182',
    volume24h: '2818226141063648',
  } as PoolDetail
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
