import { Balance } from '@xchainjs/xchain-client'
import { Asset, AssetType, assetToString } from '@xchainjs/xchain-util'

import { CovalentProvider } from '../src/providers'

jest.setTimeout(60000)

describe('covalent Integration Tests (AVAX)', () => {
  // Define here to avoid cyclic dependency
  const AVAXChain = 'AVAX'
  const AssetAVAX: Asset = { chain: AVAXChain, symbol: 'AVAX', ticker: 'AVAX', type: AssetType.NATIVE }
  const avaxProvider = new CovalentProvider(process.env.COVALENT_API_KEY as string, AVAXChain, 43113, AssetAVAX, 18)
  it('should fetch one balance', async () => {
    const balances = await avaxProvider.getBalance('0xf32DA51880374201852057009c4c4d1e75949e09')
    balances.forEach((bal: Balance) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch more than one balance filtered zero', async () => {
    const balances = await avaxProvider.getBalance('0x55aEd0ce035883626e536254dda2F23a5b5D977f', [])
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch more than one balance filtered two tokens', async () => {
    const balances = await avaxProvider.getBalance('0x55aEd0ce035883626e536254dda2F23a5b5D977f', [
      {
        chain: 'avalanche-testnet',
        symbol: 'PGL-0x1acf1583bebdca21c8025e172d8e8f2817343d65',
        ticker: 'PGL',
        type: AssetType.TOKEN,
      },
      {
        chain: 'avalanche-testnet',
        symbol: 'PTP-0x22d4002028f537599be9f666d1c4fa138522f9c8',
        ticker: 'PTP',
        type: AssetType.TOKEN,
      },
    ])
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBe(2)
  })
  it('should fetch all txs', async () => {
    const txs = await avaxProvider.getTransactions({ address: '0x55aEd0ce035883626e536254dda2F23a5b5D977f' })
    txs.txs.forEach((tx) => {
      console.log(JSON.stringify(tx))
    })
    expect(txs.total).toBeGreaterThan(10)
  })

  it('get transaction', async () => {
    const tx = await avaxProvider.getTransactionData(
      '0xcf01cd912b1411f2b46c1b7874fb8000b5c05cbef5911adcc5e77c5f26d6bb0f',
    )
    console.log(JSON.stringify(tx.from[0].amount.amount()))
    expect(tx.type).toBe('transfer')
  })

  it('get token transaction', async () => {
    const tx = await avaxProvider.getTransactionData(
      '0xe3885c55a2c3643a3c858ae36d21a9744bc12390c7245965f03aa8b768550efa',
      '0xa9d19d5e8712C1899C4344059FD2D873a3e2697E',
    )
    console.log(JSON.stringify(tx))
    expect(tx.type).toBe('transfer')
  })
})
