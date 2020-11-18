import nock from 'nock'

const mock_chain_getBlock = (url: string) => {
  nock(url)
    .post('/', body => body.method === 'chain_getBlock')
    .reply(200, {
      jsonrpc: '2.0',
      result: {
        block: {
          extrinsics: [
            '0x280403000b50c7b4da7501'
          ],
          header: {
            digest: {
              logs: [
                '0x0642414245b50103dd000000737cf30f00000000649dcf6c0c9eceef3593224eaf9acd5d1bf2447c09ec2c8b1cd600d4fde80c5b4cf8072673d2abd01b0c49d21b4e412c8c1c95397e930a084f572a2e8c2b2208c09bae119f68c2c07acd631ca3804a78444dde748170501cfb2701b9528d3204',
                '0x05424142450101240726dc50d778c4a83e2cca6e351f6a5ac64d31bbe994d81b04d884ab771319e39a544826152e3a1d987a3494860427ea01659fda4e8ddbab4c324c1fb62384'
              ]
            },
            extrinsicsRoot: '0x1af6d57fd2148bc783c4c668cf846602d3b4894d5d0b79a5ea8ef7e3b18fb1e4',
            number: '0x267219',
            parentHash: '0xfbf79103eeef316293925ad3f323efcf5b4304814ffe55e11c45baee7b312e16',
            stateRoot: '0x8d12e462984f49917a3db10c4446eac2d9ecf04a027647866c4fda1a3cfbb8ce'
          }
        },
        justification: null
      },
      id: 1
    })
}

const mock_chain_getBlockHash = (url: string) => {
  nock(url)
    .post('/', body => body.method === 'chain_getBlockHash')
    .reply(200, {
      jsonrpc: '2.0',
      result: '0x0b2b6ff7636c54200683a2d9ceaef492193ffa9d1490b6646690a1dfd2d2ba27',
      id: 1
    })
}

const mock_chain_getFinalizedHead = (url: string) => {
  nock(url)
    .post('/', body => body.method === 'chain_getFinalizedHead')
    .reply(200, {
      jsonrpc: '2.0',
      result: '0xb59cb74ebcd14615e5d97a3f6db98f8a66702f39ba4ffd8690f5360e9b2affa0',
      id: 1
  })
}

const mock_state_getMetadata = (url: string) => {
  const resp = require('./metadata.json')

  nock(url)
    .post('/', body => body.method === 'state_getMetadata')
    .reply(200, resp)
}

const mock_state_getRuntimeVersion = (url: string) => {
  nock(url)
    .post('/', body => body.method === 'state_getRuntimeVersion')
    .reply(200, {
      jsonrpc: '2.0',
      result: {
        apis: [],
        authoringVersion: 0,
        implName: 'parity-polkadot',
        implVersion: 0,
        specName: 'polkadot',
        specVersion: 26,
        transactionVersion: 5
      },
      id: 1
  })
}

const mock_account_nextIndex = (url: string) => {
  nock(url)
    .post('/', body => body.method === 'account_nextIndex')
    .reply(200, {
      jsonrpc: '2.0',
      result: 18,
      id: 1
  })
}

const mock_author_submitExtrinsic = (url: string) => {
  nock(url)
    .post('/', body => body.method === 'author_submitExtrinsic')
    .reply(200, {
      jsonrpc: '2.0',
      result: '0xdd227d44f1ed2e5b82e38daf699f66fc5ea28f1e104167b19d587a2363190ee9',
      id: 1
  })
}

const mock_payment_queryInfo = (url: string) => {
  nock(url)
    .post('/', body => body.method === 'payment_queryInfo')
    .reply(200, {
      jsonrpc: '2.0',
      result: {
        class: 'normal',
        weight: 217238000,
        partialFee: 15000000001,
      },
      id: 1
  })
}

const mock_get_tx_bytes = (url: string) => {
  mock_chain_getBlock(url)
  mock_chain_getBlockHash(url)
  mock_chain_getBlockHash(url)
  mock_state_getMetadata(url)
  mock_state_getRuntimeVersion(url)
  mock_account_nextIndex(url)
}

export const mock_transfer = (url: string) => {
  mock_get_tx_bytes(url)
  mock_author_submitExtrinsic(url)
}

export const mock_estimate_fee = (url: string) => {
  mock_get_tx_bytes(url)
  mock_chain_getFinalizedHead(url)
  mock_payment_queryInfo(url)
}
