import { Network } from '@xchainjs/xchain-client'

import { Client } from '../src/client'

const client = new Client({ network: Network.Testnet })

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
    const balance = await client.getBalance('tmYxZZuywTGenNA9bQrVb3t7W3zegyZXXeT')

    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })

  it('should get the right balance from phrase', async () => {
    const expectedBalance = 0
    client.setNetwork(Network.Testnet)
    client.setPhrase(phrase)
    const balance = await client.getBalance(client.getAddress())

    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance)
  })
})
