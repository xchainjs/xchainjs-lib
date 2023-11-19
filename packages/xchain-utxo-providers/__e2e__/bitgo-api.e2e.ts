import { BTCChain } from '../../xchain-bitcoin/src/const'
import { BCHChain } from '../../xchain-bitcoincash/src/const'
import { BitgoProvider } from '../src/providers'

describe('BTC', () => {
  let btcBitgoProvider: BitgoProvider

  beforeAll(() => {
    btcBitgoProvider = new BitgoProvider({
      baseUrl: 'https://app.bitgo.com',
      chain: BTCChain,
    })
  })

  it(`Should fetch fee rates`, async () => {
    const feeRates = await btcBitgoProvider.getFeeRates()
    console.log(feeRates)
  })
})

describe('BCH', () => {
  let bchBitgoProvider: BitgoProvider

  beforeAll(() => {
    bchBitgoProvider = new BitgoProvider({
      baseUrl: 'https://app.bitgo.com',
      chain: BCHChain,
    })
  })

  it(`Should fetch fee rates`, async () => {
    const feeRates = await bchBitgoProvider.getFeeRates()
    console.log(feeRates)
  })
})
