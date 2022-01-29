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

  // {
  //   "seed": "ridge attitude devote camp eye during mango siege kind shrug mirror crazy equip seat deposit tube farm obey fan manage enhance victory vague thing",
  //   "birthday": 1687069
  // }

  // address: tmYxZZuywTGenNA9bQrVb3t7W3zegyZXXeT

  const phrase =
    'ridge attitude devote camp eye during mango siege kind shrug mirror crazy equip seat deposit tube farm obey fan manage enhance victory vague thing'

  it('example test', () => {
    expect(1 + 2).toEqual(3)
  })

  it('should get the right balance from address', async () => {
    const expectedBalance = 100000000
    console.log('before getbalance')
    const balance = await client.getBalance('tmYxZZuywTGenNA9bQrVb3t7W3zegyZXXeT')
    console.log('balance', balance[0].amount.amount().toNumber())

    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })

  fit('should get the right balance from phrase', async () => {
    const expectedBalance = 2223
    client.setNetwork('testnet' as Network)
    client.setPhrase(phrase)
    console.log('before getbalance')
    const balance = await client.getBalance(client.getAddress())
    console.log('balance', balance[0].amount.amount().toNumber())

    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })
})
