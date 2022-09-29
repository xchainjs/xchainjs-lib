import { Network } from '@xchainjs/xchain-client'
import {
  // Asset,
  // AssetBNB,
  AssetBTC,
  // AssetLTC,
  AssetETH,
  AssetRuneNative,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  baseAmount,
} from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { Midgard } from '../src/utils/midgard'
import { Thornode } from '../src/utils/thornode'

const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))

const thorchainQuery = new ThorchainQuery(thorchainCache)

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
    const expected = new CryptoAmount(baseAmount('625601439'), AssetETH)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert USDC to Rune`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('7.55', 6)), assetUSDC)
    const amount = await thorchainQuery.thorchainCache.convert(input, AssetRuneNative)
    const expected = new CryptoAmount(baseAmount('377951300'), AssetRuneNative)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert Rune to USDC`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('5')), AssetRuneNative)
    const amount = await thorchainQuery.thorchainCache.convert(input, assetUSDC)
    const expected = new CryptoAmount(baseAmount('9988059', 6), assetUSDC)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert ETH to USDC`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('5', 18)), AssetETH)
    const amount = await thorchainQuery.thorchainCache.convert(input, assetUSDC)
    const expected = new CryptoAmount(baseAmount('8698530467', 6), assetUSDC)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert USDC to ETH`, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('500', 6)), assetUSDC)
    const amount = await thorchainQuery.thorchainCache.convert(input, AssetETH)
    const expected = new CryptoAmount(baseAmount('287405000000000000', 18), AssetETH)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
  it(`Should convert BTC to RUNE `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC)
    const amount = await thorchainQuery.thorchainCache.convert(input, AssetRuneNative)
    const expected = new CryptoAmount(baseAmount('1089663786286'), AssetRuneNative)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })

  it(`Should convert RUNE to BTC `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative)
    const amount = await thorchainQuery.thorchainCache.convert(input, AssetBTC)
    const expected = new CryptoAmount(assetToBase(assetAmount(`0.00917714`)), AssetBTC)
    expect(amount.assetAmountFixedString()).toEqual(expected.assetAmountFixedString())
    expect(amount.eq(expected)).toBe(true)
  })
})
