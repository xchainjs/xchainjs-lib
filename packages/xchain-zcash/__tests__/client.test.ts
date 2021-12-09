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

  const phrase = 'atom green various power must another rent imitate gadget creek fat then'

  it('example test', () => {
    expect(1 + 2).toEqual(3)
  })

  it('should get the right balance', async () => {
    const expectedBalance = 2223
    client.setNetwork('testnet' as Network)
    client.setPhrase(phrase)
    const balance = await client.getBalance(client.getAddress())
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })
})
