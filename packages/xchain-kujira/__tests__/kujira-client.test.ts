import { Network } from '@xchainjs/xchain-client'

import { Client as KujiraClient } from '../src/client'
import { DEFAULT_FEE } from '../src/const'

let xchainClient: KujiraClient
const phraseOne = 'atom green various power must another rent imitate gadget creek fat then'

describe('Kujira client Integration Tests', () => {
  beforeEach(() => {
    xchainClient = new KujiraClient({
      network: Network.Testnet,
      phrase: phraseOne,
    })
  })
  it('should validate invalid addreses', async () => {
    const isValid = xchainClient.validateAddress('asdadasd')
    expect(isValid).toBe(false)
  })
  it('should validate valid addreses', async () => {
    const isValid = xchainClient.validateAddress('kujira1es76p8qspctcxhex79c32nng9fvhuxjn4z6u7k')
    expect(isValid).toBe(true)
  })
  it('should generate addreses', async () => {
    const address = await xchainClient.getAddress(0)
    expect(address).toBe('kujira1k688m5uq5gqwt2sltvvu0679vnh3ehlslvf9e2')
  })
  it('get fees', async () => {
    const fees = await xchainClient.getFees()
    expect(fees.average).toBe(DEFAULT_FEE)
  })
  it('get explorer address url', async () => {
    const url = await xchainClient.getExplorerAddressUrl('kujira1k688m5uq5gqwt2sltvvu0679vnh3ehlslvf9e2')
    expect(url).toBe('https://finder.kujira.network/harpoon-4/address/kujira1k688m5uq5gqwt2sltvvu0679vnh3ehlslvf9e2')
  })
  it('get explorer tx url', async () => {
    const url = await xchainClient.getExplorerTxUrl('F3131AE603FFDE602217330410DD3ADFB9E21C987DDAA5CCF54F99DB15A6714B')
    expect(url).toBe(
      'https://finder.kujira.network/harpoon-4/tx/F3131AE603FFDE602217330410DD3ADFB9E21C987DDAA5CCF54F99DB15A6714B',
    )
  })
})
