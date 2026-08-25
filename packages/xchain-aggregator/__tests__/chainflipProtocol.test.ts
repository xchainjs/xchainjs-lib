import { AssetBTC, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { AssetETH, Client as EthClient, ETH_GAS_ASSET_DECIMAL, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import {
  Asset,
  CryptoAmount,
  SynthAsset,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { SwapSDK } from '@chainflip/sdk/swap'

import { Aggregator } from '../src'
import { ChainflipProtocol } from '../src/protocols/chainflip'

jest.setTimeout(60000)

describe('Chainflip protocol', () => {
  let protocol: ChainflipProtocol
  let wallet: Wallet

  beforeAll(() => {
    const phrase = process.env.PHRASE_MAINNET

    wallet = new Wallet({
      BTC: new BtcClient({ ...defaultBtcParams, phrase, network: Network.Mainnet }),
      ETH: new EthClient({
        ...defaultEthParams,
        phrase,
      }),
    })

    protocol = new ChainflipProtocol({ wallet })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Should get supported chains', async () => {
    const chains = await protocol.getSupportedChains()
    expect(chains.length).toBe(2)
  })

  it('Should check native assets are supported', async () => {
    expect(await protocol.isAssetSupported(AssetBTC)).toBeTruthy()
    expect(await protocol.isAssetSupported(AssetETH)).toBeTruthy()
  })

  it('Should check native assets are not supported', async () => {
    expect(await protocol.isAssetSupported(AssetCacao)).toBeFalsy()
    expect(await protocol.isAssetSupported(AssetRuneNative)).toBeFalsy()
  })

  it('Should check Tron assets are supported', async () => {
    expect(await protocol.isAssetSupported(assetFromStringEx('TRON.TRX'))).toBeTruthy()
    expect(
      await protocol.isAssetSupported(assetFromStringEx('TRON.USDT-TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')),
    ).toBeTruthy()
  })

  it('Should check trade assets are not supported', async () => {
    expect(await protocol.isAssetSupported(assetFromStringEx('AVAX~AVAX'))).toBeFalsy()
  })

  it('Should check ERC20 assets are supported', async () => {
    expect(
      await protocol.isAssetSupported(assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7')),
    ).toBeTruthy()
    expect(
      await protocol.isAssetSupported(assetFromStringEx('ETH.USDT-0xdac17f958d2ee523a2206206994597c13d831ec7')),
    ).toBeTruthy()
    expect(
      await protocol.isAssetSupported(assetFromStringEx('ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')),
    ).toBeTruthy()
    expect(
      await protocol.isAssetSupported(assetFromStringEx('ETH.FLIP-0x826180541412D574cf1336d22c0C0a287822678A')),
    ).toBeTruthy()
  })

  it('Should check ERC20 assets are not supported', async () => {
    expect(
      await protocol.isAssetSupported(assetFromStringEx('ETH.BNB-0x826180541412D574cf1336d22c0C0a287822678A')),
    ).toBeFalsy()
  })

  it('Should not get swap history', async () => {
    await expect(async () => {
      await protocol.getSwapHistory()
    }).rejects.toThrow(/Method not implemented./)
  })

  it('Should estimate native swap', async () => {
    const estimatedSwap = await protocol.estimateSwap({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      fromAddress: 'ETHEREUMfakeaddress',
      amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      destinationAddress: 'BITCOINFakeAddress',
    })
    expect(estimatedSwap.protocol).toBe('Chainflip')
    // Quote-only: no deposit channel opened on estimate
    expect(estimatedSwap.toAddress).toBe('')
    expect(estimatedSwap.depositChannelId).toBeUndefined()
    expect(estimatedSwap.memo).toBe('')
    expect(assetToString(estimatedSwap.expectedAmount.asset)).toBe('BTC.BTC')
    expect(estimatedSwap.expectedAmount.baseAmount.amount().toString()).toBe('51193')
    expect(estimatedSwap.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(estimatedSwap.dustThreshold.asset)).toBe('ETH.ETH')
    expect(estimatedSwap.dustThreshold.baseAmount.amount().toString()).toBe('10000000000000000')
    expect(estimatedSwap.dustThreshold.baseAmount.decimal).toBe(18)
    expect(assetToString(estimatedSwap.fees.asset)).toBe('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
    expect(assetToString(estimatedSwap.fees.affiliateFee.asset)).toBe(
      'ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
    )
    expect(estimatedSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
    expect(estimatedSwap.fees.affiliateFee.baseAmount.decimal).toBe(6)
    expect(assetToString(estimatedSwap.fees.outboundFee.asset)).toBe('BTC.BTC')
    expect(estimatedSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('1599')
    expect(estimatedSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
    expect(estimatedSwap.totalSwapSeconds).toBe(702)
    expect(estimatedSwap.slipBasisPoints).toBe(100)
    expect(estimatedSwap.canSwap).toBe(true)
    expect(estimatedSwap.errors.length).toBe(0)
    expect(estimatedSwap.warning).toContain('Open a deposit channel immediately before broadcast')
  })

  it('Should estimate from ERC-20 swap', async () => {
    const USDT = assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7') as
      | Asset
      | TokenAsset
      | SynthAsset
    const estimatedSwap = await protocol.estimateSwap({
      fromAsset: USDT,
      destinationAsset: AssetETH,
      fromAddress: 'ETHEREUMfakeaddress',
      amount: new CryptoAmount(assetToBase(assetAmount(20, 6)), USDT),
      destinationAddress: 'ETHEREUMfakeaddress',
    })
    expect(estimatedSwap.protocol).toBe('Chainflip')
    expect(estimatedSwap.toAddress).toBe('')
    expect(estimatedSwap.depositChannelId).toBeUndefined()
    expect(estimatedSwap.memo).toBe('')
    expect(assetToString(estimatedSwap.expectedAmount.asset)).toBe('ETH.ETH')
    expect(estimatedSwap.expectedAmount.baseAmount.amount().toString()).toBe('2063188201000691')
    expect(estimatedSwap.expectedAmount.baseAmount.decimal).toBe(18)
    expect(assetToString(estimatedSwap.dustThreshold.asset)).toBe('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7')
    expect(estimatedSwap.dustThreshold.baseAmount.amount().toString()).toBe('20000000')
    expect(estimatedSwap.dustThreshold.baseAmount.decimal).toBe(6)
    expect(assetToString(estimatedSwap.fees.asset)).toBe('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
    expect(assetToString(estimatedSwap.fees.affiliateFee.asset)).toBe(
      'ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
    )
    expect(estimatedSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
    expect(estimatedSwap.fees.affiliateFee.baseAmount.decimal).toBe(6)
    expect(assetToString(estimatedSwap.fees.outboundFee.asset)).toBe('ETH.ETH')
    expect(estimatedSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('1447621978320000')
    expect(estimatedSwap.fees.outboundFee.baseAmount.decimal).toBe(18)
    expect(estimatedSwap.totalSwapSeconds).toBe(114)
    expect(estimatedSwap.slipBasisPoints).toBe(100)
    expect(estimatedSwap.canSwap).toBe(true)
    expect(estimatedSwap.errors.length).toBe(0)
    expect(estimatedSwap.warning).toContain('Open a deposit channel immediately before broadcast')
  })

  it('Should estimate to ERC-20 swap', async () => {
    const USDT = assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7') as
      | Asset
      | TokenAsset
      | SynthAsset
    const estimatedSwap = await protocol.estimateSwap({
      fromAsset: AssetETH,
      destinationAsset: USDT,
      fromAddress: 'ETHEREUMfakeaddress',
      amount: new CryptoAmount(assetToBase(assetAmount(0.01, 18)), AssetETH),
      destinationAddress: 'ETHEREUMfakeaddress',
    })
    expect(estimatedSwap.protocol).toBe('Chainflip')
    expect(estimatedSwap.toAddress).toBe('')
    expect(estimatedSwap.depositChannelId).toBeUndefined()
    expect(estimatedSwap.memo).toBe('')
    expect(assetToString(estimatedSwap.expectedAmount.asset)).toBe(
      'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
    )
    expect(estimatedSwap.expectedAmount.baseAmount.amount().toString()).toBe('24884030')
    expect(estimatedSwap.expectedAmount.baseAmount.decimal).toBe(6)
    expect(assetToString(estimatedSwap.dustThreshold.asset)).toBe('ETH.ETH')
    expect(estimatedSwap.dustThreshold.baseAmount.amount().toString()).toBe('10000000000000000')
    expect(estimatedSwap.dustThreshold.baseAmount.decimal).toBe(18)
    expect(assetToString(estimatedSwap.fees.asset)).toBe('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48')
    expect(assetToString(estimatedSwap.fees.affiliateFee.asset)).toBe(
      'ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
    )
    expect(estimatedSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
    expect(estimatedSwap.fees.affiliateFee.baseAmount.decimal).toBe(6)
    expect(assetToString(estimatedSwap.fees.outboundFee.asset)).toBe(
      'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
    )
    expect(estimatedSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('8988369')
    expect(estimatedSwap.fees.outboundFee.baseAmount.decimal).toBe(6)
    expect(estimatedSwap.totalSwapSeconds).toBe(114)
    expect(estimatedSwap.slipBasisPoints).toBe(100)
    expect(estimatedSwap.canSwap).toBe(true)
    expect(estimatedSwap.errors.length).toBe(0)
    expect(estimatedSwap.warning).toContain('Open a deposit channel immediately before broadcast')
  })

  it('Should estimate without addresses (quote refresh path)', async () => {
    const estimatedSwap = await protocol.estimateSwap({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
    })
    expect(estimatedSwap.canSwap).toBe(true)
    expect(estimatedSwap.toAddress).toBe('')
    expect(estimatedSwap.depositChannelId).toBeUndefined()
    expect(estimatedSwap.expectedAmount.baseAmount.amount().toString()).toBe('51193')
  })

  it('Should open deposit channel with address, channel id, expiry, and quote snapshot', async () => {
    const channel = await protocol.openDepositChannel({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      fromAddress: 'ETHEREUMfakeaddress',
      amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      destinationAddress: 'BITCOINFakeAddress',
    })
    expect(channel.depositAddress).toBe('ETHEREUMfakeaddress')
    expect(channel.depositChannelId).toBe('ethereum-channel-id')
    expect(channel.expiresAt).toEqual(new Date(1716889354 * 1000))
    expect(channel.depositChannelExpiryBlock).toBe(BigInt(20000))
    expect(channel.expectedAmount.baseAmount.amount().toString()).toBe('51193')
    expect(channel.slipBasisPoints).toBe(100)
  })

  it('Should pass dest/src/refund and effective quote slippage into requestDepositAddressV2', async () => {
    const spy = jest.spyOn(SwapSDK.prototype, 'requestDepositAddressV2')

    await protocol.openDepositChannel({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      fromAddress: 'ETHEREUMrefundAddress',
      amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      destinationAddress: 'BITCOINFakeAddress',
    })

    expect(spy).toHaveBeenCalledTimes(1)
    const args = spy.mock.calls[0][0]
    expect(args.destAddress).toBe('BITCOINFakeAddress')
    expect(args.srcAddress).toBe('ETHEREUMrefundAddress')
    expect(args.fillOrKillParams.refundAddress).toBe('ETHEREUMrefundAddress')
    expect(args.fillOrKillParams.slippageTolerancePercent).toBe(args.quote.recommendedSlippageTolerancePercent)
  })

  it('Should use boost quote slippage (not parent) when enableBoost is set', async () => {
    const parentSlippage = 1
    const boostSlippage = 5
    const boostQuote = {
      srcAsset: { chain: 'Ethereum', asset: 'ETH' },
      destAsset: { chain: 'Bitcoin', asset: 'BTC' },
      depositAmount: '1000000',
      type: 'REGULAR',
      egressAmount: '50000',
      includedFees: [
        { type: 'NETWORK', chain: 'Ethereum', asset: 'USDC', amount: '100' },
        { type: 'BOOST', chain: 'Ethereum', asset: 'ETH', amount: '1000' },
        { type: 'EGRESS', chain: 'Bitcoin', asset: 'BTC', amount: '1599' },
      ],
      lowLiquidityWarning: false,
      estimatedDurationSeconds: 100,
      recommendedSlippageTolerancePercent: boostSlippage,
      poolInfo: [],
      estimatedPrice: '2300',
    }
    const parentQuote = {
      ...boostQuote,
      egressAmount: '51193',
      recommendedSlippageTolerancePercent: parentSlippage,
      boostQuote,
    }

    jest.spyOn(SwapSDK.prototype, 'getQuoteV2').mockResolvedValueOnce({
      amount: '10000000000000000',
      srcChain: 'Ethereum',
      srcAsset: 'ETH',
      destChain: 'Bitcoin',
      destAsset: 'BTC',
      quotes: [parentQuote],
    } as never)

    const spy = jest.spyOn(SwapSDK.prototype, 'requestDepositAddressV2')

    await protocol.openDepositChannel({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      fromAddress: 'ETHEREUMrefundAddress',
      amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      destinationAddress: 'BITCOINFakeAddress',
      enableBoost: true,
    })

    expect(spy).toHaveBeenCalledTimes(1)
    const args = spy.mock.calls[0][0]
    expect(args.quote).toBe(boostQuote)
    expect(args.quote.recommendedSlippageTolerancePercent).toBe(boostSlippage)
    expect(args.fillOrKillParams.slippageTolerancePercent).toBe(boostSlippage)
    expect(args.fillOrKillParams.slippageTolerancePercent).not.toBe(parentSlippage)
  })

  it('Should fall back to ~24h expiry when broker response omits estimatedDepositChannelExpiryTime', async () => {
    jest.spyOn(SwapSDK.prototype, 'requestDepositAddressV2').mockResolvedValueOnce({
      depositAddress: 'ETHEREUMfakeaddress',
      depositChannelId: 'ethereum-channel-id',
      depositChannelExpiryBlock: BigInt(20000),
      // estimatedDepositChannelExpiryTime intentionally omitted (broker SDK path)
    } as never)

    const beforeMs = Date.now()
    const channel = await protocol.openDepositChannel({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      fromAddress: 'ETHEREUMfakeaddress',
      amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      destinationAddress: 'BITCOINFakeAddress',
    })
    const afterMs = Date.now()

    expect(channel.depositAddress).toBe('ETHEREUMfakeaddress')
    expect(channel.depositChannelId).toBe('ethereum-channel-id')
    // Fallback = now + 24h; allow small clock skew around the call
    const minExpiryMs = beforeMs + 24 * 60 * 60 * 1000 - 1000
    const maxExpiryMs = afterMs + 24 * 60 * 60 * 1000 + 1000
    expect(channel.expiresAt.getTime()).toBeGreaterThanOrEqual(minExpiryMs)
    expect(channel.expiresAt.getTime()).toBeLessThanOrEqual(maxExpiryMs)
  })

  it('Should require addresses to open deposit channel', async () => {
    await expect(
      protocol.openDepositChannel({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      }),
    ).rejects.toThrow(/fromAddress is required/)

    await expect(
      protocol.openDepositChannel({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        fromAddress: 'ETHEREUMfakeaddress',
        amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      }),
    ).rejects.toThrow(/destinationAddress is required/)
  })

  it('Aggregator.requestChainflipDepositAddress should open a channel', async () => {
    const aggregator = new Aggregator({ protocols: ['Chainflip'] })
    const channel = await aggregator.requestChainflipDepositAddress({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      fromAddress: 'ETHEREUMfakeaddress',
      amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      destinationAddress: 'BITCOINFakeAddress',
    })
    expect(channel.depositChannelId).toBe('ethereum-channel-id')
    expect(channel.expiresAt).toEqual(new Date(1716889354 * 1000))
  })

  it('Aggregator.requestChainflipDepositAddress should throw if Chainflip disabled', async () => {
    const aggregator = new Aggregator({ protocols: ['Thorchain'] })
    await expect(
      aggregator.requestChainflipDepositAddress({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        fromAddress: 'ETHEREUMfakeaddress',
        amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
        destinationAddress: 'BITCOINFakeAddress',
      }),
    ).rejects.toThrow(/Chainflip protocol is not enabled/)
  })
})
