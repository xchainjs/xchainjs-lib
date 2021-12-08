import { Network } from '@xchainjs/xchain-client'

import { Client } from '../src/client'

const client = new Client({ network: 'testnet' as Network })

describe('ZcashClient Test', () => {
  beforeEach(() => {
    client.purgeClient()
  })
  afterEach(() => {
    client.purgeClient()
  })

  it('example test', () => {
    expect(1 + 2).toEqual(3)
  })
})
