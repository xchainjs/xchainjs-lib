import { AssetBTC, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as DashClient, defaultDashParams } from '@xchainjs/xchain-dash'
import { AssetETH, Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as KujiraClient, defaultKujiParams } from '@xchainjs/xchain-kujira'
import { Client as MayaClient } from '@xchainjs/xchain-mayachain'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { Client as RadixClient } from '@xchainjs/xchain-radix'
import { AssetRuneNative, Client as ThorClient } from '@xchainjs/xchain-thorchain'
import { Asset, CryptoAmount, assetToString, baseAmount } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import mayanodeApi from '../__mocks__/mayanode-api/mayanode-api'
import midgarApi from '../__mocks__/midgard-api/midgard-api'
import { MayachainAMM } from '../src'

describe('MayachainAMM', () => {
  describe('Swaps', () => {
    let mayachainAmm: MayachainAMM

    beforeAll(() => {
      const mayaChainQuery = new MayachainQuery()
      const wallet = new Wallet({
        BTC: new BtcClient({ ...defaultBtcParams, network: Network.Mainnet }),
        ETH: new EthClient({ ...defaultEthParams, network: Network.Mainnet }),
        DASH: new DashClient({ ...defaultDashParams, network: Network.Mainnet }),
        KUJI: new KujiraClient({ ...defaultKujiParams, network: Network.Mainnet }),
        THOR: new ThorClient({ network: Network.Mainnet }),
        MAYA: new MayaClient({ network: Network.Mainnet }),
        XRD: new RadixClient({ network: Network.Mainnet }),
      })
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

    it(`Should validate streaming swap from ETH to BTC with streamingInterval error`, async () => {
      const errors = await mayachainAmm.validateSwap({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount('688598892692', 8), AssetBTC),
        fromAddress: '0xe3985E6b61b814F7Cdb188766562ba71b446B46d',
        destinationAddress: 'bc1q07kx42qz758yhr7jn3pu9ffz2rwy0snlwztwf8',
        streamingInterval: -1,
        streamingQuantity: 10,
      })

      expect(errors.length).toBe(1)
      expect(errors[0]).toBe('streaming interval can not be lower than 0')
    })

    it(`Should validate streaming swap from ETH to BTC with streamingQuantity error`, async () => {
      const errors = await mayachainAmm.validateSwap({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount('688598892692', 8), AssetBTC),
        fromAddress: '0xe3985E6b61b814F7Cdb188766562ba71b446B46d',
        destinationAddress: 'bc1q07kx42qz758yhr7jn3pu9ffz2rwy0snlwztwf8',
        streamingInterval: 100,
        streamingQuantity: -1,
      })

      expect(errors.length).toBe(1)
      expect(errors[0]).toBe('streaming quantity can not be lower than 0')
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

    it(`Should quote streaming swap without errors`, async () => {
      const quoteSwap = await mayachainAmm.estimateSwap({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount('688598892692', 8), AssetBTC),
        fromAddress: '0xe3985E6b61b814F7Cdb188766562ba71b446B46d',
        destinationAddress: 'bc1q07kx42qz758yhr7jn3pu9ffz2rwy0snlwztwf8',
        streamingInterval: 100,
        streamingQuantity: 10,
      })

      expect(quoteSwap.toAddress).toBe('0x37f4bc8b3a06a751fc36baa928d3fa5b63a540fc')
      expect(quoteSwap.memo).toBe('=:BTC.BTC:bc1q07kx42qz758yhr7jn3pu9ffz2rwy0snlwztwf8:0/100/10')
      expect(assetToString(quoteSwap.expectedAmount.asset)).toBe(assetToString(AssetBTC))
      expect(quoteSwap.expectedAmount.baseAmount.amount().toString()).toBe('11361662429')
      expect(quoteSwap.expectedAmount.baseAmount.decimal).toBe(8)
      expect(assetToString(quoteSwap.dustThreshold.asset)).toBe(assetToString(AssetETH))
      expect(quoteSwap.dustThreshold.baseAmount.amount().toString()).toBe('0')
      expect(quoteSwap.dustThreshold.baseAmount.decimal).toBe(18)
      expect(assetToString(quoteSwap.fees.asset)).toBe(assetToString(AssetBTC))
      expect(assetToString(quoteSwap.fees.affiliateFee.asset)).toBe(assetToString(AssetBTC))
      expect(quoteSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
      expect(quoteSwap.fees.affiliateFee.baseAmount.decimal).toBe(8)
      expect(assetToString(quoteSwap.fees.outboundFee.asset)).toBe(assetToString(AssetBTC))
      expect(quoteSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('5691')
      expect(quoteSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
      expect(quoteSwap.inboundConfirmationBlocks).toBe(undefined)
      expect(quoteSwap.inboundConfirmationSeconds).toBe(undefined)
      expect(quoteSwap.outboundDelayBlocks).toBe(720)
      expect(quoteSwap.outboundDelaySeconds).toBe(4320)
      expect(quoteSwap.totalSwapSeconds).toBe(5400)
      expect(quoteSwap.slipBasisPoints).toBe(4396)
      expect(quoteSwap.streamingSwapBlocks).toBe(900)
      expect(quoteSwap.streamingSwapSeconds).toBe(5400)
      expect(quoteSwap.maxStreamingQuantity).toBe(144)
      expect(quoteSwap.expiry).toBe(1722246842)
      expect(quoteSwap.router).toBe('0xe3985E6b61b814F7Cdb188766562ba71b446B46d')
      expect(quoteSwap.gasRateUnits).toBe('gwei')
      expect(quoteSwap.recommendedGasRate).toBe('1')
      expect(assetToString(quoteSwap.recommendedMinAmountIn?.asset as Asset)).toBe('ETH.ETH')
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
})
