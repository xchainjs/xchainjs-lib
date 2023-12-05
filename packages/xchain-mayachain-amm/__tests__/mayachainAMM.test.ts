import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { CryptoAmount, baseAmount } from '@xchainjs/xchain-util'

import mayanodeApi from '../__mocks__/mayanode-api/mayanode-api'
import midgarApi from '../__mocks__/midgard-api/midgard-api'
import { MayachainAMM, Wallet } from '../src'

describe('Mayachain Client Test', () => {
  let mayachainAmm: MayachainAMM

  beforeAll(() => {
    const mayaChainQuery = new MayachainQuery()
    const wallet = new Wallet(process.env.MAINNET_PHRASE || '', Network.Mainnet)
    mayachainAmm = new MayachainAMM(mayaChainQuery, wallet)
  })

  beforeEach(() => {
    mayanodeApi.init()
    midgarApi.init()
  })

  afterEach(() => {
    mayanodeApi.restore()
    midgarApi.restore()
  })

  it(`Should validate swap from Rune to BTC without errors with maya address`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
      destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
    })

    expect(errors.length).toBe(0)
  })

  it(`Should validate swap from Rune to BTC without errors with MAYAName`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'eld',
      destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
    })
    expect(errors.length).toBe(0)
  })

  it(`Should validate swap from Rune to BTC with MAYAName error`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'randomAffiliateAddress',
    })

    expect(errors.length).toBe(1)
    expect(errors[0]).toBe('affiliateAddress randomAffiliateAddress is not a valid MAYA address')
  })

  it(`Should validate swap from Rune to BTC with affiliateBps error`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateBps: -1,
    })

    expect(errors.length).toBe(1)
    expect(errors[0]).toBe('affiliateBps -1 out of range [0 - 10000]')
  })
})
