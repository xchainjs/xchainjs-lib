import { AssetBTC, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { AssetETH, Client as EthClient, ETH_GAS_ASSET_DECIMAL, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { CryptoAmount, assetAmount, assetFromStringEx, assetToBase, assetToString } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

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

  it('Should get supported chains', async () => {
    const chains = await protocol.getSupportedChains()
    expect(chains.length).toBe(3)
  })

  it('Should check native assets are supported', async () => {
    expect(await protocol.isAssetSupported(AssetBTC)).toBeTruthy()
    expect(await protocol.isAssetSupported(AssetETH)).toBeTruthy()
  })

  it('Should check native assets are not supported', async () => {
    expect(await protocol.isAssetSupported(AssetCacao)).toBeFalsy()
    expect(await protocol.isAssetSupported(AssetRuneNative)).toBeFalsy()
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

  it('Should not get swap history', () => {
    expect(async () => {
      await protocol.getSwapHistory()
    }).rejects.toThrowError('Method not implemented.')
  })

  it('Should estimate native swap', async () => {
    const estimatedSwap = await protocol.estimateSwap({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      destinationAddress: 'BITCOINFakeAddress',
    })
    expect(estimatedSwap.protocol).toBe('Chainflip')
    expect(estimatedSwap.toAddress).toBe('ETHEREUMfakeaddress')
    expect(estimatedSwap.memo).toBe('')
    expect(assetToString(estimatedSwap.expectedAmount.asset)).toBe('BTC.BTC')
    expect(estimatedSwap.expectedAmount.baseAmount.amount().toString()).toBe('51193')
    expect(estimatedSwap.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(estimatedSwap.dustThreshold.asset)).toBe('ETH.ETH')
    expect(estimatedSwap.dustThreshold.baseAmount.amount().toString()).toBe('10000000000000000')
    expect(estimatedSwap.dustThreshold.baseAmount.decimal).toBe(18)
    expect(assetToString(estimatedSwap.fees.asset)).toBe('BTC.BTC')
    expect(assetToString(estimatedSwap.fees.affiliateFee.asset)).toBe('BTC.BTC')
    expect(estimatedSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
    expect(estimatedSwap.fees.affiliateFee.baseAmount.decimal).toBe(8)
    expect(assetToString(estimatedSwap.fees.outboundFee.asset)).toBe('BTC.BTC')
    expect(estimatedSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('1599')
    expect(estimatedSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
    expect(estimatedSwap.totalSwapSeconds).toBe(702)
    expect(estimatedSwap.slipBasisPoints).toBe(0)
    expect(estimatedSwap.canSwap).toBe(true)
    expect(estimatedSwap.errors.length).toBe(0)
    expect(estimatedSwap.warning).toBe('Do not cache this response. Do not send funds after the expiry.')
  })

  it('Should estimate from ERC-20 swap', async () => {
    const USDT = assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7')
    const estimatedSwap = await protocol.estimateSwap({
      fromAsset: USDT,
      destinationAsset: AssetETH,
      amount: new CryptoAmount(assetToBase(assetAmount(20, 6)), USDT),
      destinationAddress: 'ETHEREUMfakeaddress',
    })
    expect(estimatedSwap.protocol).toBe('Chainflip')
    expect(estimatedSwap.toAddress).toBe('ETHEREUMfakeaddress')
    expect(estimatedSwap.memo).toBe('')
    expect(assetToString(estimatedSwap.expectedAmount.asset)).toBe('ETH.ETH')
    expect(estimatedSwap.expectedAmount.baseAmount.amount().toString()).toBe('2063188201000691')
    expect(estimatedSwap.expectedAmount.baseAmount.decimal).toBe(18)
    expect(assetToString(estimatedSwap.dustThreshold.asset)).toBe('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7')
    expect(estimatedSwap.dustThreshold.baseAmount.amount().toString()).toBe('20000000')
    expect(estimatedSwap.dustThreshold.baseAmount.decimal).toBe(6)
    expect(assetToString(estimatedSwap.fees.asset)).toBe('ETH.ETH')
    expect(assetToString(estimatedSwap.fees.affiliateFee.asset)).toBe('ETH.ETH')
    expect(estimatedSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
    expect(estimatedSwap.fees.affiliateFee.baseAmount.decimal).toBe(18)
    expect(assetToString(estimatedSwap.fees.outboundFee.asset)).toBe('ETH.ETH')
    expect(estimatedSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('1447621978320000')
    expect(estimatedSwap.fees.outboundFee.baseAmount.decimal).toBe(18)
    expect(estimatedSwap.totalSwapSeconds).toBe(114)
    expect(estimatedSwap.slipBasisPoints).toBe(0)
    expect(estimatedSwap.canSwap).toBe(true)
    expect(estimatedSwap.errors.length).toBe(0)
    expect(estimatedSwap.warning).toBe('Do not cache this response. Do not send funds after the expiry.')
  })

  it('Should estimate to ERC-20 swap', async () => {
    const USDT = assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7')
    const estimatedSwap = await protocol.estimateSwap({
      fromAsset: AssetETH,
      destinationAsset: USDT,
      amount: new CryptoAmount(assetToBase(assetAmount(0.01, 18)), AssetETH),
      destinationAddress: 'ETHEREUMfakeaddress',
    })
    expect(estimatedSwap.protocol).toBe('Chainflip')
    expect(estimatedSwap.toAddress).toBe('ETHEREUMfakeaddress')
    expect(estimatedSwap.memo).toBe('')
    expect(assetToString(estimatedSwap.expectedAmount.asset)).toBe(
      'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
    )
    expect(estimatedSwap.expectedAmount.baseAmount.amount().toString()).toBe('24884030')
    expect(estimatedSwap.expectedAmount.baseAmount.decimal).toBe(6)
    expect(assetToString(estimatedSwap.dustThreshold.asset)).toBe('ETH.ETH')
    expect(estimatedSwap.dustThreshold.baseAmount.amount().toString()).toBe('10000000000000000')
    expect(estimatedSwap.dustThreshold.baseAmount.decimal).toBe(18)
    expect(assetToString(estimatedSwap.fees.asset)).toBe('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7')
    expect(assetToString(estimatedSwap.fees.affiliateFee.asset)).toBe(
      'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
    )
    expect(estimatedSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
    expect(estimatedSwap.fees.affiliateFee.baseAmount.decimal).toBe(6)
    expect(assetToString(estimatedSwap.fees.outboundFee.asset)).toBe(
      'ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
    )
    expect(estimatedSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('8988369')
    expect(estimatedSwap.fees.outboundFee.baseAmount.decimal).toBe(6)
    expect(estimatedSwap.totalSwapSeconds).toBe(114)
    expect(estimatedSwap.slipBasisPoints).toBe(0)
    expect(estimatedSwap.canSwap).toBe(true)
    expect(estimatedSwap.errors.length).toBe(0)
    expect(estimatedSwap.warning).toBe('Do not cache this response. Do not send funds after the expiry.')
  })
})
