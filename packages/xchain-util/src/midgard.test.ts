import nock from 'nock'

import { Chain } from './chain'
import { getAllInboundDetails, getInboundDetails, getMimirDetails } from './midgard'

describe('functions from Midgard', () => {
  it('should return error', async function () {
    nock('https://midgard.ninerealms.com').get('/v2/thorchain/mimir').reply(404)
    nock('https://midgard.thorswap.net').get('/v2/thorchain/mimir').reply(404)

    await expect(getMimirDetails()).rejects.toThrowError('Midgard not responding')
  })

  it('should return mimir details', async function () {
    const expectedResponse = { testProperty: 'test value' }
    nock('https://midgard.ninerealms.com').get('/v2/thorchain/mimir').reply(404)
    nock('https://midgard.thorswap.net').get('/v2/thorchain/mimir').reply(200, expectedResponse)

    await expect(getMimirDetails()).resolves.toEqual(expectedResponse)
  })

  it('should return error', async function () {
    nock('https://midgard.ninerealms.com').get('/v2/thorchain/inbound_addresses').reply(404)
    nock('https://midgard.thorswap.net').get('/v2/thorchain/inbound_addresses').reply(404)

    await expect(getAllInboundDetails()).rejects.toThrowError('Midgard not responding')
  })

  it('should return inbound details for all', async function () {
    const expectedResponse = [{ testProperty: 'test value' }]
    nock('https://midgard.ninerealms.com').get('/v2/thorchain/inbound_addresses').reply(200, expectedResponse)

    await expect(getAllInboundDetails()).resolves.toEqual(expect.arrayContaining(expectedResponse))
  })

  it('should return inbound details for ETH', async function () {
    const testMimirResponse = {
      HALTTRADING: 0,
      HALTETHTRADING: 0,
      HALTCHAINGLOBAL: 0,
      HALTETHCHAIN: 0,
      PAUSELP: 0,
      PAUSELPETH: 0,
    }
    const testInboundResponse = [
      {
        chain: Chain.Binance,
        pub_key: 'pub key binance',
        address: 'address binance',
        halted: true,
        gas_rate: '2',
      },
      {
        chain: Chain.Ethereum,
        pub_key: 'pub key',
        address: 'ETH address',
        halted: true,
        gas_rate: '1',
        router: 'ETH router',
      },
    ]
    nock('https://midgard.ninerealms.com').get('/v2/thorchain/mimir').reply(200, testMimirResponse)
    nock('https://midgard.ninerealms.com').get('/v2/thorchain/inbound_addresses').reply(200, testInboundResponse)

    await expect(getInboundDetails(Chain.Ethereum)).resolves.toEqual({
      vault: 'ETH address',
      haltedChain: true,
      haltedTrading: false,
      haltedLP: false,
      router: 'ETH router',
    })
  })
})
