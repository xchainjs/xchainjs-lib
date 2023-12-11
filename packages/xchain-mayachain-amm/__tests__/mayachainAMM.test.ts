import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { CryptoAmount, assetToString, baseAmount } from '@xchainjs/xchain-util'

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

  it(`Should validate swap from Rune to BTC with destination address error`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      destinationAddress: 'randomDestinationAddress',
    })

    expect(errors.length).toBe(1)
    expect(errors[0]).toBe('destinationAddress randomDestinationAddress is not a valid address')
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

  it(`Should validate swap from Rune to BTC with multiple errors`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      destinationAddress: 'randomDestinationAddress',
      affiliateAddress: 'randomAffiliateAddress',
      affiliateBps: -1,
    })

    expect(errors.length).toBe(3)
    expect(errors[0]).toBe('destinationAddress randomDestinationAddress is not a valid address')
    expect(errors[1]).toBe('affiliateAddress randomAffiliateAddress is not a valid MAYA address')
    expect(errors[2]).toBe('affiliateBps -1 out of range [0 - 10000]')
  })

  it(`Should quote swap without errors`, async () => {
    const quoteSwap = await mayachainAmm.estimateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
      affiliateBps: 300,
      destinationAddress: 'bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj',
    })

    expect(quoteSwap.toAddress).toBe('thor1qtemwlu9ju3ts3da5l82qejnzdl3xfs309c9l6')
    expect(quoteSwap.memo).toBe(
      '=:BTC.BTC:bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj::maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz:300',
    )
    expect(assetToString(quoteSwap.expectedAmount.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.expectedAmount.baseAmount.amount().toString()).toBe('98647691')
    expect(quoteSwap.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.dustThreshold.asset)).toBe(assetToString(AssetRuneNative))
    expect(quoteSwap.dustThreshold.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.dustThreshold.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.asset)).toBe(assetToString(AssetBTC))
    expect(assetToString(quoteSwap.fees.affiliateFee.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('3061722')
    expect(quoteSwap.fees.affiliateFee.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.outboundFee.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('348000')
    expect(quoteSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
    expect(quoteSwap.inboundConfirmationBlocks).toBe(undefined)
    expect(quoteSwap.inboundConfirmationSeconds).toBe(undefined)
    expect(quoteSwap.outboundDelayBlocks).toBe(179)
    expect(quoteSwap.outboundDelaySeconds).toBe(107400)
    expect(quoteSwap.totalSwapSeconds).toBe(107400)
    expect(quoteSwap.slipBasisPoints).toBe(83)
    expect(quoteSwap.canSwap).toBe(true)
    expect(quoteSwap.errors.length).toBe(0)
    expect(quoteSwap.warning).toBe('')
  })

  it(`Should quote swap from Rune to BTC with MAYAName error`, async () => {
    const quoteSwap = await mayachainAmm.estimateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'randomAffiliateAddress',
      affiliateBps: 300,
      destinationAddress: 'bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj',
    })

    expect(quoteSwap.toAddress).toBe('')
    expect(quoteSwap.memo).toBe('')
    expect(assetToString(quoteSwap.expectedAmount.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.expectedAmount.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.dustThreshold.asset)).toBe(assetToString(AssetRuneNative))
    expect(quoteSwap.dustThreshold.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.dustThreshold.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.asset)).toBe(assetToString(AssetBTC))
    expect(assetToString(quoteSwap.fees.affiliateFee.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.fees.affiliateFee.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.outboundFee.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
    expect(quoteSwap.inboundConfirmationBlocks).toBe(0)
    expect(quoteSwap.inboundConfirmationSeconds).toBe(0)
    expect(quoteSwap.outboundDelayBlocks).toBe(0)
    expect(quoteSwap.outboundDelaySeconds).toBe(0)
    expect(quoteSwap.totalSwapSeconds).toBe(0)
    expect(quoteSwap.slipBasisPoints).toBe(0)
    expect(quoteSwap.canSwap).toBe(false)
    expect(quoteSwap.errors.length).toBe(1)
    expect(quoteSwap.errors[0]).toBe('affiliateAddress randomAffiliateAddress is not a valid MAYA address')
    expect(quoteSwap.warning).toBe('')
  })
})
