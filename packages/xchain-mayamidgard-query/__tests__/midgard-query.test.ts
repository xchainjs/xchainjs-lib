import midgardApi from '../__mocks__/midgard/midgardApi'
import { MidgardQuery } from '../src'

describe('Midgard query', () => {
  let midgardQuery: MidgardQuery
  beforeAll(() => {
    midgardQuery = new MidgardQuery()
  })
  beforeEach(() => {
    midgardApi.init()
  })
  afterEach(() => {
    midgardApi.restore()
  })
  it('Should get pools', async () => {
    console.log(await midgardQuery.getPools())
  })

  it('Should get actions', async () => {
    const actions = await midgardQuery.getActions({})
    const swapAction = actions.actions.find((action) => action.type === 'swap')
    expect(swapAction).not.toBeUndefined()
    expect(swapAction).toEqual({
      date: '1709981753596677593',
      height: '5239911',
      in: [
        {
          address: 'maya14mh37ua4vkyur0l5ra297a4la6tmf95mtjy3zy',
          coins: [
            {
              amount: '18492500000000',
              asset: 'MAYA.CACAO',
            },
          ],
          txID: 'C238C07B31F0798B3C8DD3B3528F40BB466227F6460DCF9D260A8E836CF7C3FD',
        },
      ],
      metadata: {
        swap: {
          affiliateAddress: '',
          affiliateFee: '0',
          isStreamingSwap: false,
          liquidityFee: '1867103412',
          memo: 's:THOR.RUNE:thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55:0',
          networkFees: [
            {
              amount: '3000000',
              asset: 'THOR.RUNE',
            },
          ],
          swapSlip: '1',
          swapTarget: '0',
        },
      },
      out: [
        {
          address: 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55',
          coins: [
            {
              amount: '24045699771',
              asset: 'THOR.RUNE',
            },
          ],
          height: '5239953',
          txID: 'EF562F3E1205BF7F53BE65E7FFCFF39614BEC08BEFC2B36FFD5E5326E32D17FF',
        },
      ],
      pools: ['THOR.RUNE'],
      status: 'success',
      type: 'swap',
    })
    const addLiquidityAction = actions.actions.find((action) => action.type === 'addLiquidity')
    expect(addLiquidityAction).not.toBeUndefined()
    expect(addLiquidityAction).toEqual({
      date: '1710741724088635788',
      height: '5358124',
      in: [
        {
          address: 'maya14mh37ua4vkyur0l5ra297a4la6tmf95mtjy3zy',
          coins: [
            {
              amount: '2328591462343',
              asset: 'MAYA.CACAO',
            },
          ],
          txID: '6E4678CC82495F7F80A53781A088573E72B2CACFA8ECE9EC48BEBEC604D0D9C5',
        },
        {
          address: '0xaa278b62225f6dbc4436de8fa3dd195e1542d159',
          coins: [
            {
              amount: '25000000000',
              asset: 'ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7',
            },
          ],
          txID: '40732BD8DBFFE02E2E639364CF70FD91985919EA6DF1CCA76D24CC6328D532E2',
        },
      ],
      metadata: {
        addLiquidity: {
          liquidityUnits: '5612066098773',
        },
      },
      out: [],
      pools: ['ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7'],
      status: 'success',
      type: 'addLiquidity',
    })
  })
})
