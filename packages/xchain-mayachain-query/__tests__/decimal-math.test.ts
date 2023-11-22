import { assetAmount, assetFromStringEx, assetToBase, baseAmount } from '@xchainjs/xchain-util'

import mockMayanodeApi from '../__mocks__/mayanode-api'
import mockMidgardApi from '../__mocks__/midgard-api'
import { CryptoAmount } from '../src/crypto-amount'
import { MayachainQuery } from '../src/mayachain-query'
import { AssetCacaoNative } from '../src/utils'

const mayachainQuery = new MayachainQuery()
const AssetBTC = assetFromStringEx('BTC.BTC')
const AssetETH = assetFromStringEx('ETH.ETH')

const assetUSDC = assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
// const BUSD = assetFromString('BNB.BUSD-BD1')

describe('decimal math tests', () => {
  beforeAll(() => {
    mockMidgardApi.init()
    mockMayanodeApi.init()
  })
  afterAll(() => {
    mockMidgardApi.restore()
    mockMayanodeApi.restore()
  })

  it(`Should convert BTC to ETH `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('0.5')), AssetBTC)
    const amount = await mayachainQuery.mayachainCache.convert(input, AssetETH)
    const expected = new CryptoAmount(baseAmount('807282839'), AssetETH)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert USDC to Cacao`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('7.55', 6)), assetUSDC)
    const amount = await mayachainQuery.mayachainCache.convert(input, AssetCacaoNative)
    const expected = new CryptoAmount(baseAmount('7523163928', 6), AssetCacaoNative)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert Cacao to USDC`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('5')), AssetCacaoNative)
    const amount = await mayachainQuery.mayachainCache.convert(input, assetUSDC)
    const expected = new CryptoAmount(baseAmount('000501784', 8), assetUSDC)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert ETH to USDC`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('5', 18)), AssetETH)
    const amount = await mayachainQuery.mayachainCache.convert(input, assetUSDC)
    const expected = new CryptoAmount(baseAmount('800170879691', 8), assetUSDC)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert USDC to ETH`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('500', 6)), assetUSDC)
    const amount = await mayachainQuery.mayachainCache.convert(input, AssetETH)
    const expected = new CryptoAmount(baseAmount('312433000000000000', 18), AssetETH)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert BTC to CACAO `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC)
    const amount = await mayachainQuery.mayachainCache.convert(input, AssetCacaoNative)
    const expected = new CryptoAmount(baseAmount('2574672695212569', 8), AssetCacaoNative)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })

  it(`Should convert CACAO to BTC `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(100)), AssetCacaoNative)
    const amount = await mayachainQuery.mayachainCache.convert(input, AssetBTC)
    const expected = new CryptoAmount(assetToBase(assetAmount(`0.00000388`)), AssetBTC)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
})
