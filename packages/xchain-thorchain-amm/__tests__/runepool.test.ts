import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { AssetCryptoAmount, assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { ThorchainAMM } from '../src'

describe('ThorchainAMM', () => {
  describe('Rune pool', () => {
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

    it('Should estimate deposit with no errors', async () => {
      const quote = await thorchainAMM.estimateDepositToRunePool({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(1)), AssetRuneNative),
      })

      expect(quote.allowed).toBeTruthy()
      expect(quote.memo).toBe('POOL+')
      expect(quote.errors.length).toBe(0)
      expect(quote.maturityBlocks).toBe(1296000)
      expect(assetToString(quote.amount.asset)).toBe('THOR.RUNE')
      expect(quote.amount.assetAmount.amount().toString()).toBe('1')
    })

    it('Should estimate withdraw with no errors', async () => {
      const quote = await thorchainAMM.estimateWithdrawFromRunePool({
        withdrawBps: 1000,
        affiliate: 'thor1wfaju5arm7fz6ynylqtccpwcaf67484fautrsf',
        feeBps: 300,
      })

      expect(quote.allowed).toBeTruthy()
      expect(quote.memo).toBe('POOL-:1000:thor1wfaju5arm7fz6ynylqtccpwcaf67484fautrsf:300')
      expect(quote.errors.length).toBe(0)
      expect(assetToString(quote.amount.asset)).toBe('THOR.RUNE')
      expect(quote.amount.assetAmount.amount().toString()).toBe('0')
    })

    it('Should estimate withdraw with no errors with THORName', async () => {
      const quote = await thorchainAMM.estimateWithdrawFromRunePool({
        withdrawBps: 1000,
        affiliate: 'odin',
        feeBps: 300,
      })

      expect(quote.allowed).toBeTruthy()
      expect(quote.memo).toBe('POOL-:1000:odin:300')
      expect(quote.errors.length).toBe(0)
      expect(assetToString(quote.amount.asset)).toBe('THOR.RUNE')
      expect(quote.amount.assetAmount.amount().toString()).toBe('0')
    })

    it('Should estimate withdraw with no errors without affiliate', async () => {
      const quote = await thorchainAMM.estimateWithdrawFromRunePool({
        withdrawBps: 1000,
      })

      expect(quote.allowed).toBeTruthy()
      expect(quote.memo).toBe('POOL-:1000::')
      expect(quote.errors.length).toBe(0)
      expect(assetToString(quote.amount.asset)).toBe('THOR.RUNE')
      expect(quote.amount.assetAmount.amount().toString()).toBe('0')
    })

    it('Should estimate withdraw with withdrawBps error', async () => {
      const quote = await thorchainAMM.estimateWithdrawFromRunePool({
        withdrawBps: -1,
      })

      expect(quote.allowed).toBeFalsy()
      expect(quote.memo).toBe('')
      expect(quote.errors.length).toBe(1)
      expect(quote.errors[0]).toBe('withdrawBps out of range. Range 0-10000')
      expect(assetToString(quote.amount.asset)).toBe('THOR.RUNE')
      expect(quote.amount.assetAmount.amount().toString()).toBe('0')
    })

    it('Should estimate withdraw with affiliate address error', async () => {
      const quote = await thorchainAMM.estimateWithdrawFromRunePool({
        withdrawBps: 100,
        affiliate: 'randomAddress',
        feeBps: 10,
      })

      expect(quote.allowed).toBeFalsy()
      expect(quote.memo).toBe('')
      expect(quote.errors.length).toBe(1)
      expect(quote.errors[0]).toBe('Invalid affiliate. Affiliate must be a THORName or THOR address')
      expect(assetToString(quote.amount.asset)).toBe('THOR.RUNE')
      expect(quote.amount.assetAmount.amount().toString()).toBe('0')
    })

    it('Should estimate withdraw with affiliate feeBps error', async () => {
      const quote = await thorchainAMM.estimateWithdrawFromRunePool({
        withdrawBps: 100,
        affiliate: 'thor1wfaju5arm7fz6ynylqtccpwcaf67484fautrsf',
        feeBps: -1,
      })

      expect(quote.allowed).toBeFalsy()
      expect(quote.memo).toBe('')
      expect(quote.errors.length).toBe(1)
      expect(quote.errors[0]).toBe('feeBps out of range. Range 0-1000')
      expect(assetToString(quote.amount.asset)).toBe('THOR.RUNE')
      expect(quote.amount.assetAmount.amount().toString()).toBe('0')
    })
  })
})
