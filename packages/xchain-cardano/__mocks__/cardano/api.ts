import { FetchMock, enableFetchMocks } from 'jest-fetch-mock'

enableFetchMocks()

const fetchMock = global.fetch as FetchMock

export default {
  reset: () => {
    fetchMock.resetMocks()
  },
  restore: () => {
    fetchMock.resetMocks()
  },
  init: () => {
    fetchMock.mockResponse((req) => {
      const url = req.url

      if (
        url.match(/^https:\/\/cardano-mainnet\.blockfrost\.io\/api\/v0\/addresses\/[^/]+$/) &&
        !url.includes('/utxos')
      ) {
        const address = url.split('/addresses/')[1]
        if (address?.includes('no-balance')) {
          return Promise.resolve({
            status: 404,
            statusText: 'Not Found',
            ok: false,
            body: JSON.stringify({ error: 'Address not found' }),
          })
        }

        return Promise.resolve({
          status: 200,
          statusText: 'OK',
          ok: true,
          body: JSON.stringify({
            amount: [
              {
                unit: 'lovelace',
                quantity: '133884551384',
              },
            ],
          }),
        })
      }

      if (url.match(/^https:\/\/cardano-mainnet\.blockfrost\.io\/api\/v0\/addresses\/[^/]+\/utxos$/)) {
        return Promise.resolve({
          status: 200,
          statusText: 'OK',
          ok: true,
          body: JSON.stringify([
            {
              tx_hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              output_index: 0,
              amount: [
                {
                  unit: 'lovelace',
                  quantity: '69382438882275',
                },
              ],
            },
            {
              tx_hash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
              output_index: 1,
              amount: [
                {
                  unit: 'lovelace',
                  quantity: '19382650711776',
                },
              ],
            },
          ]),
        })
      }

      if (url.includes('https://cardano-mainnet.blockfrost.io/api/v0/txs/') && !url.includes('/utxos')) {
        const txId = url.split('/txs/')[1]?.split('/')[0]
        return Promise.resolve({
          status: 200,
          statusText: 'OK',
          ok: true,
          body: JSON.stringify({
            hash: txId,
            block_time: 1720535411,
          }),
        })
      }

      if (url.includes('https://cardano-mainnet.blockfrost.io/api/v0/txs/') && url.includes('/utxos')) {
        return Promise.resolve({
          status: 200,
          statusText: 'OK',
          ok: true,
          body: JSON.stringify({
            inputs: [
              {
                address:
                  'addr1q88p8j5jgpujpf33l5ja2rreearp3x9x59ju65hxkhu29jvctwav0g4zrrmq388yc7h22qehlyt4y556atrty5sfdq5q7plfz5',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '69382438882275',
                  },
                ],
              },
            ],
            outputs: [
              {
                address:
                  'addr1q8h6u88370nw2va448ukdj9spujm5an7nce8j0qg6hzg0kw5xxq3r3rcel85zeezwm5w9e3l449j0gudvge3c9tht68s2uw5gk',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '49999788000000',
                  },
                ],
              },
              {
                address:
                  'addr1q88p8j5jgpujpf33l5ja2rreearp3x9x59ju65hxkhu29jvctwav0g4zrrmq388yc7h22qehlyt4y556atrty5sfdq5q7plfz5',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '19382650711776',
                  },
                ],
              },
            ],
          }),
        })
      }

      if (url === 'https://cardano-mainnet.blockfrost.io/api/v0/epochs/latest/parameters') {
        return Promise.resolve({
          status: 200,
          statusText: 'OK',
          ok: true,
          body: JSON.stringify({
            min_fee_a: 44,
            min_fee_b: 155381,
            pool_deposit: '500000000',
            key_deposit: '2000000',
            coins_per_utxo_size: '4310',
            max_val_size: '5000',
            max_tx_size: 16384,
          }),
        })
      }

      if (url === 'https://cardano-mainnet.blockfrost.io/api/v0/blocks/latest') {
        return Promise.resolve({
          status: 200,
          statusText: 'OK',
          ok: true,
          body: JSON.stringify({
            slot: 123456789,
          }),
        })
      }

      return Promise.resolve({
        status: 404,
        statusText: 'Not Found',
        ok: false,
        body: JSON.stringify({ error: 'Not Found' }),
      })
    })
  },
}
