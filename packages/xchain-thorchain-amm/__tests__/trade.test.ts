import { AVAXChain } from '@xchainjs/xchain-avax'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import {
  AssetCryptoAmount,
  AssetType,
  CryptoAmount,
  TradeCryptoAmount,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
} from '@xchainjs/xchain-util'

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

    it('Should estimate withdraw from trade account with no errors', async () => {
      const quote = await thorchainAMM.estimateWithdrawFromTradeAccount({
        amount: new TradeCryptoAmount(assetToBase(assetAmount(1, 18)), {
          chain: AVAXChain,
          symbol: 'AVAX',
          ticker: 'AVAX',
          type: AssetType.TRADE,
        }),
        address: '0x09383137C1eEe3E1A8bc781228E4199f6b4A9bbf',
      })

      expect(quote.memo).toBe('TRADE-:0x09383137C1eEe3E1A8bc781228E4199f6b4A9bbf')
      expect(assetToString(quote.value.asset)).toBe('AVAX~AVAX')
      expect(quote.value.assetAmount.amount().toString()).toBe('1')
      expect(quote.allowed).toBeTruthy()
      expect(quote.errors.length).toBe(0)
    })

    it('Should estimate withdraw from trade account with address errors', async () => {
      const quote = await thorchainAMM.estimateWithdrawFromTradeAccount({
        amount: new TradeCryptoAmount(assetToBase(assetAmount(0.25, 8)), {
          chain: AVAXChain,
          symbol: 'AVAX',
          ticker: 'AVAX',
          type: AssetType.TRADE,
        }),
        address: '0x09383137C1eEe3E1A8bc781f',
      })

      expect(quote.memo).toBe('')
      expect(assetToString(quote.value.asset)).toBe('AVAX~AVAX')
      expect(quote.value.assetAmount.amount().toString()).toBe('0')
      expect(quote.allowed).toBeFalsy()
      expect(quote.errors.length).toBe(1)
      expect(quote.errors[0]).toBe('Invalid address to send the withdraw')
    })

    it('Should validate trade swap with no errors', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: assetFromStringEx('AVAX~AVAX'),
        amount: new CryptoAmount(assetToBase(assetAmount('100')), assetFromStringEx('AVAX~AVAX')),
        destinationAddress: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg',
        destinationAsset: assetFromStringEx('ETH~ETH'),
      })
      expect(errors.length).toBe(0)
    })

    it('Should validate trade swap with incompatible destination asset error', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: assetFromStringEx('AVAX~AVAX'),
        amount: new CryptoAmount(assetToBase(assetAmount('100')), assetFromStringEx('AVAX~AVAX')),
        destinationAddress: '0x09383137C1eEe3E1A8bc781228E4199f6b4A9bbf',
        destinationAsset: assetFromStringEx('ETH.ETH'),
      })
      expect(errors.length).toBe(1)
      expect(errors[0]).toBe(
        'Can not make swap from trade asset to non trade asset or non Rune asset. Use withdrawFromTrade (TRADE-) operation',
      )
    })

    it('Should validate trade swap with incompatible source asset error', async () => {
      const errors = await thorchainAMM.validateSwap({
        fromAsset: assetFromStringEx('AVAX.AVAX'),
        amount: new CryptoAmount(assetToBase(assetAmount('100')), assetFromStringEx('AVAX.AVAX')),
        destinationAddress: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg',
        destinationAsset: assetFromStringEx('ETH~ETH'),
      })
      expect(errors.length).toBe(1)
      expect(errors[0]).toBe(
        'Can not make swap from non trade asset or non Rune asset to trade asset. Use addToTrade (TRADE+) operation',
      )
    })

    it('Should estimate trade asset swap', async () => {
      const tAvax = assetFromStringEx('AVAX~AVAX')
      const tEth = assetFromStringEx('ETH~ETH')

      const quote = await thorchainAMM.estimateSwap({
        fromAsset: assetFromStringEx('AVAX~AVAX'),
        amount: new CryptoAmount(assetToBase(assetAmount('100')), tAvax),
        destinationAddress: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg',
        destinationAsset: tEth,
      })

      expect(quote.toAddress).toBe('')
      expect(quote.memo).toBe('=:ETH~ETH:thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg')
      expect(assetToString(quote.txEstimate.netOutput.asset)).toBe(assetToString(tEth))
      expect(quote.txEstimate.netOutput.baseAmount.amount().toString()).toBe('7940816')
      expect(quote.txEstimate.netOutput.baseAmount.decimal).toBe(8)
      expect(assetToString(quote.dustThreshold.asset)).toBe(assetToString(tAvax))
      expect(quote.dustThreshold.baseAmount.amount().toString()).toBe('0')
      expect(quote.dustThreshold.baseAmount.decimal).toBe(8)
      expect(assetToString(quote.txEstimate.totalFees.asset)).toBe(assetToString(tEth))
      expect(assetToString(quote.txEstimate.totalFees.affiliateFee.asset)).toBe(assetToString(tEth))
      expect(quote.txEstimate.totalFees.affiliateFee.baseAmount.amount().toString()).toBe('0')
      expect(quote.txEstimate.totalFees.affiliateFee.baseAmount.decimal).toBe(8)
      expect(assetToString(quote.txEstimate.totalFees.outboundFee.asset)).toBe(assetToString(tEth))
      expect(quote.txEstimate.totalFees.outboundFee.baseAmount.amount().toString()).toBe('0')
      expect(quote.txEstimate.totalFees.outboundFee.baseAmount.decimal).toBe(8)
      expect(quote.txEstimate.outboundDelayBlocks).toBe(1)
      expect(quote.txEstimate.outboundDelaySeconds).toBe(6)
      expect(quote.txEstimate.totalSwapSeconds).toBe(6)
      expect(quote.txEstimate.slipBasisPoints).toBe(5)
      expect(quote.txEstimate.canSwap).toBe(true)
      expect(quote.txEstimate.errors.length).toBe(0)
      expect(quote.txEstimate.warning).toBe('Do not cache this response. Do not send funds after the expiry.')
    })
  })
})
