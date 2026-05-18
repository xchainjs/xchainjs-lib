import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { CryptoAmount, baseAmount } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { ThorchainAMM } from '../src'

describe('ThorchainAMM', () => {
  describe('validateSwap (affiliates)', () => {
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

    it('accepts a single affiliateAddress (THORName) within the new bps cap', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
        destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
        affiliateAddress: 'odin',
        affiliateBps: 100,
      })
      expect(errors).toEqual([])
    })

    it('rejects single-affiliate bps above the new THORChain 1000 cap', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
        affiliateAddress: 'odin',
        affiliateBps: 1500,
      })
      expect(errors).toContain('affiliateBps 1500 out of range [0 - 1000]')
    })

    it('rejects single-affiliate bps below zero', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
        affiliateBps: -1,
      })
      expect(errors).toContain('affiliateBps -1 out of range [0 - 1000]')
    })

    it('accepts a multi-affiliate array with valid entries', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
        destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
        affiliates: [
          { address: 'odin', bps: 100 },
          { address: 'thor1s76zxv0kpr78za293kvj0eep4tfqljacknsjzc', bps: 200 },
        ],
      })
      expect(errors).toEqual([])
    })

    it('rejects mixing the affiliates array with the singular fields', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
        destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
        affiliateAddress: 'odin',
        affiliates: [{ address: 'odin', bps: 100 }],
      })
      expect(errors).toContain(
        'affiliates is mutually exclusive with affiliateAddress / affiliateBps; pass one form, not both',
      )
    })

    it('rejects more than 5 affiliates', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
        destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
        affiliates: [
          { address: 'odin', bps: 10 },
          { address: 'odin', bps: 10 },
          { address: 'odin', bps: 10 },
          { address: 'odin', bps: 10 },
          { address: 'odin', bps: 10 },
          { address: 'odin', bps: 10 },
        ],
      })
      expect(errors).toContain('affiliates count 6 exceeds THORChain maximum of 5')
    })

    it('rejects a per-affiliate bps above the THORChain 1000 cap', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
        destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
        affiliates: [
          { address: 'odin', bps: 100 },
          { address: 'odin', bps: 1500 },
        ],
      })
      expect(errors).toContain('affiliate bps 1500 for odin out of range [0 - 1000]')
    })

    it('rejects an empty affiliates array', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
        destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
        affiliates: [],
      })
      expect(errors).toContain('affiliates array is empty; omit the field or include at least one entry')
    })

    it('rejects an affiliate entry whose address is neither a THOR address nor a known THORName', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
        destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
        affiliates: [{ address: 'not-a-real-thorname', bps: 100 }],
      })
      expect(errors).toContain('affiliate address not-a-real-thorname is not a valid THOR address or THORName')
    })
  })
})
