import { AssetETH } from '@xchainjs/xchain-ethereum'
import { AssetCryptoAmount, AssetType, assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { ThorchainAMM } from '../src'

describe('ThorchainAMM', () => {
  let thorchainAMM: ThorchainAMM

  beforeAll(() => {
    thorchainAMM = new ThorchainAMM()
  })

  beforeEach(() => {
    mockMidgardApi.init()
    mockThornodeApi.init()
  })

  afterEach(() => {
    mockMidgardApi.restore()
    mockThornodeApi.restore()
  })

  describe('Trade assets', () => {
    it('Should estimate add to trade account with no errors', async () => {
      const quote = await thorchainAMM.estimateAddToTradeAccount({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        address: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg',
      })

      expect(quote.memo).toBe('TRADE+:thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg')
      expect(quote.toAddress).toBe('0xb030b2297315185acec73fce4df95e7859021c8a')
      expect(assetToString(quote.value.asset)).toBe('ETH.ETH')
      expect(quote.value.assetAmount.amount().toString()).toBe('1')
      expect(quote.allowed).toBeTruthy()
      expect(quote.errors.length).toBe(0)
    })

    it('Should estimate add to trade account with address error', async () => {
      const quote = await thorchainAMM.estimateAddToTradeAccount({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(1, 18)), AssetETH),
        address: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7se',
      })

      expect(quote.memo).toBe('')
      expect(quote.toAddress).toBe('')
      expect(assetToString(quote.value.asset)).toBe('ETH.ETH')
      expect(quote.value.assetAmount.amount().toString()).toBe('0')
      expect(quote.allowed).toBeFalsy()
      expect(quote.errors.length).toBe(1)
      expect(quote.errors[0]).toBe('Invalid trade account address')
    })

    it('Should estimate add to trade account with asset error', async () => {
      const quote = await thorchainAMM.estimateAddToTradeAccount({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(1, 18)), {
          chain: 'ETHH',
          symbol: '',
          ticker: '',
          type: AssetType.NATIVE,
        }),
        address: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg',
      })

      expect(quote.memo).toBe('')
      expect(quote.toAddress).toBe('')
      expect(assetToString(quote.value.asset)).toBe('ETHH.')
      expect(quote.value.assetAmount.amount().toString()).toBe('0')
      expect(quote.allowed).toBeFalsy()
      expect(quote.errors.length).toBe(1)
      expect(quote.errors[0]).toBe('Can not get inbound address for ETHH')
    })
  })
})
