import { Client } from '../src/client'
import { baseAmount } from '@xchainjs/xchain-util'

describe('Client Test', () => {
  let polkadotClient: Client

  const phrase = 'wing divide pear industry silver concert chest cloud torch merit fatigue silk'
  const mainnet_address = '12CujFmtU9mx1DacbaK8mbhpLV4zXhZHmrLpofnPrKymHpxo'
  const testnet_address = '5DGcavWpcNWUZga6dwG8dSsfUs5LqQ19hMcLeNo3JExF7EFN'

  beforeEach(() => {
    polkadotClient = new Client({ phrase, network: 'mainnet' })
  })

  afterEach(() => {
    polkadotClient.purgeClient()
  })

  it('throws an error passing an invalid phrase', async () => {
    expect(() => {
      new Client({ phrase: 'invalid phrase', network: 'mainnet' })
    }).toThrow()

    expect(() => {
      new Client({ phrase: 'invalid phrase', network: 'testnet' })
    }).toThrow()
  })

  it('should have right address', async () => {
    expect(polkadotClient.getAddress()).toEqual(mainnet_address)

    polkadotClient.setNetwork('testnet')
    expect(polkadotClient.getAddress()).toEqual(testnet_address)
  })

  it('should update net', async () => {
    polkadotClient.setNetwork('testnet')
    expect(polkadotClient.getNetwork()).toEqual('testnet')

    const address = await polkadotClient.getAddress()
    expect(address).toEqual(testnet_address)
  })

  it('no balances', async () => {
    const balances = await polkadotClient.getBalance()
    expect(balances.length).toEqual(0)
  })

  it('has balances', async () => {
    polkadotClient.setNetwork('testnet')

    const balances = await polkadotClient.getBalance()
    expect(balances.length).toEqual(1)
    expect(balances[0].amount.amount().isEqualTo(baseAmount('5000000000', 10).amount())).toBeTruthy()
  })

  it('no txHistory', async () => {
    const txHistory = await polkadotClient.getTransactions()
    expect(txHistory.total).toEqual(0)
    expect(txHistory.txs.length).toEqual(0)
  })

  it('has txHistory', async () => {
    polkadotClient.setNetwork('testnet')

    const txHistory = await polkadotClient.getTransactions({
      address: '5HpLdCTNBQDjFomqpG2XWadgB4zHTuqQqNHhUyYbett7k1RR',
    })

    expect(txHistory.total).toBeGreaterThan(0)
  })
})
