import { CryptoAmount, assetAmount, assetFromStringEx, assetToBase, baseAmount } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { ThorchainQuery } from '../src/thorchain-query'
import { AssetRuneNative } from '../src/utils'

const thorchainQuery = new ThorchainQuery()
const AssetBTC = assetFromStringEx('BTC.BTC')
const AssetETH = assetFromStringEx('ETH.ETH')

const assetUSDC = assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
// const BUSD = assetFromString('BNB.BUSD-BD1')

describe('decimal math tests', () => {
  beforeAll(() => {
    mockMidgardApi.init()
    mockThornodeApi.init()
  })
  afterAll(() => {
    mockThornodeApi.restore()
    mockThornodeApi.restore()
  })

  it(`Should convert BTC to ETH `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('0.5')), AssetBTC)
    const amount = await thorchainQuery.thorchainCache.convert(input, AssetETH)
    const expected = new CryptoAmount(baseAmount('1279915270'), AssetETH)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert USDC to Rune`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('7.55', 6)), assetUSDC)
    const amount = await thorchainQuery.thorchainCache.convert(input, AssetRuneNative)
    const expected = new CryptoAmount(baseAmount('143893200'), AssetRuneNative)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert Rune to USDC`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('5')), AssetRuneNative)
    const amount = await thorchainQuery.thorchainCache.convert(input, assetUSDC)
    const expected = new CryptoAmount(baseAmount('26234730', 6), assetUSDC)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert ETH to USDC`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('5', 18)), AssetETH)
    const amount = await thorchainQuery.thorchainCache.convert(input, assetUSDC)
    const expected = new CryptoAmount(baseAmount('13170356385', 6), assetUSDC)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert USDC to ETH`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('500', 6)), assetUSDC)
    const amount = await thorchainQuery.thorchainCache.convert(input, AssetETH)
    const expected = new CryptoAmount(baseAmount('189820000000000000', 18), AssetETH)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert BTC to RUNE `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC)
    const amount = await thorchainQuery.thorchainCache.convert(input, AssetRuneNative)
    const expected = new CryptoAmount(baseAmount('1285085873144'), AssetRuneNative)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })

  it(`Should convert RUNE to BTC `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative)
    const amount = await thorchainQuery.thorchainCache.convert(input, AssetBTC)
    const expected = new CryptoAmount(assetToBase(assetAmount(`0.00778158`)), AssetBTC)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
})
