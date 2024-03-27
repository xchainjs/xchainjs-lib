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
    earnings: '1006874582462',
    earningsAnnualAsPercentOfDepth: '0.23113862350837777',
    lpLuvi: '-0.8152153645976675',
  }

  it(`Should return pools array and match interface type PoolDetail`, async () => {
    const poolData = await mainnetMidgard.getPools()
    expect(poolData[2]).toEqual(poolDetail)
  })

  it(`Should return action list`, async () => {
    const actions = await mainnetMidgard.getActions({})
    const swapAction = actions.actions.find((action) => action.type === 'swap')
    expect(swapAction).not.toBeUndefined()
    expect(swapAction).toEqual({
      date: '1710673264963705816',
      height: '15149305',
      in: [
        {
          address: 'thor1x4d5g75v67affmr9qjuu75swjsgme4jscxj7pl',
          coins: [
            {
              amount: '99900000000',
              asset: 'BNB/BUSD-BD1',
            },
          ],
          txID: '8DA840FC598CAEC6A0FA573F467F2313063DF7D0F4B4625D7D67EE69408F7F02',
        },
      ],
      metadata: {
        swap: {
          affiliateAddress: 'dx',
          affiliateFee: '10',
          isStreamingSwap: false,
          liquidityFee: '11178948',
          memo: '=:ETH/USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7:thor1x4d5g75v67affmr9qjuu75swjsgme4jscxj7pl:0/1/0:dx:10',
          networkFees: [
            {
              amount: '17078500',
              asset: 'ETH/USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7',
            },
          ],
          streamingSwapMeta: {
            count: '1',
            depositedCoin: {
              amount: '99900000000',
              asset: 'BNB/BUSD-BD1',
            },
            inCoin: {
              amount: '99900000000',
              asset: 'BNB/BUSD-BD1',
            },
            interval: '1',
            lastHeight: '15149305',
            outCoin: {
              amount: '100521038000',
              asset: 'ETH/USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7',
            },
            quantity: '1',
          },
          swapSlip: '10',
          swapTarget: '0',
        },
      },
      out: [
        {
          address: 'thor1x4d5g75v67affmr9qjuu75swjsgme4jscxj7pl',
          coins: [
            {
              amount: '100503959500',
              asset: 'ETH/USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7',
            },
          ],
          height: '15149305',
          txID: '',
        },
      ],
      pools: ['BNB.BUSD-BD1', 'ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7'],
      status: 'success',
      type: 'swap',
    })
    const donateAction = actions.actions.find((action) => action.type === 'donate')
    expect(donateAction).not.toBeUndefined()
    expect(donateAction).toEqual({
      date: '1703899489482605005',
      height: '14058816',
      in: [
        {
          address: 'qp30tf79m0dej8wenlthgqcl4cnlmdvauulgt7m624',
          coins: [
            {
              amount: '6675',
              asset: 'BCH.BCH',
            },
          ],
          txID: '818DA828E626EB050AFA43859A58064F5898E214AA76A173E2B5E4D1F479E15F',
        },
      ],
      metadata: {},
      out: [
        {
          address: 'thor1x4d5g75v67affmr9qjuu75swjsgme4jscxj7pl',
          coins: [
            {
              amount: '6626569',
              asset: 'BCH/BCH',
            },
          ],
          height: '14058812',
          txID: '',
        },
      ],
      pools: ['BCH.BCH'],
      status: 'success',
      type: 'donate',
    })
  })
})
