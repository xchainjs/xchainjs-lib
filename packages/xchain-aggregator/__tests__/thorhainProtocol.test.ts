/* eslint-disable ordered-imports/ordered-imports */
import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import {
  Asset,
  CryptoAmount,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
  baseToAsset,
} from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/thorchain/midgard/api'
import mockThornodeApi from '../__mocks__/thorchain/thornode/api'
import { ThorchainProtocol } from '../src/protocols/thorchain'
import { SuccessSwap } from '../src'

describe('Thorchain protocol', () => {
  let protocol: ThorchainProtocol
  let mockApproveRouterToSpend: jest.Mock
  let mockIsRouterApprovedToSpend: jest.Mock

  beforeAll(() => {
    mockIsRouterApprovedToSpend = jest
      .fn()
      .mockReturnValue(['Thorchain router has not been approved to spend this amount'])
    ThorchainAMM.prototype.isRouterApprovedToSpend = mockIsRouterApprovedToSpend

    mockApproveRouterToSpend = jest.fn().mockResolvedValue({
      hash: 'mockedHash',
      url: 'http://mocked.url',
    })
    ThorchainAMM.prototype.approveRouterToSpend = mockApproveRouterToSpend
    protocol = new ThorchainProtocol()
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => {
    mockMidgardApi.init()
    mockThornodeApi.init()
  })

  afterEach(() => {
    mockMidgardApi.restore()
    mockThornodeApi.restore()
  })

  it('Should approve router to spend', async () => {
    const asset = assetFromStringEx('ETH.USDT-0XA3910454BF2CB59B8B3A401589A3BACC5CA42306') as TokenAsset
    const amount = new CryptoAmount(assetToBase(assetAmount('1', 6)), asset)

    const result = await protocol.approveRouterToSpend({ asset, amount })

    expect(mockApproveRouterToSpend).toHaveBeenCalledWith({
      asset,
      amount,
    })

    expect(result).toEqual({
      hash: 'mockedHash',
      url: 'http://mocked.url',
    })
  })

  it('Should check if tx is approved', async () => {
    const asset = assetFromStringEx('ETH.USDT-0XA3910454BF2CB59B8B3A401589A3BACC5CA42306') as TokenAsset
    const amount = new CryptoAmount(assetToBase(assetAmount('1', 6)), asset)
    const errors = await protocol.shouldBeApproved({
      asset,
      amount,
      address: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97',
    })

    expect(mockIsRouterApprovedToSpend).toBeCalledWith({
      asset,
      amount,
      address: '0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97',
    })

    expect(errors).toEqual(true)
  })

  it('Should check asset is supported', async () => {
    expect(await protocol.isAssetSupported(AssetBTC)).toBeTruthy()
  })

  it('Should check native asset is supported', async () => {
    expect(await protocol.isAssetSupported(AssetRuneNative)).toBeTruthy()
  })

  it('Should check asset is not supported', async () => {
    expect(await protocol.isAssetSupported(AssetCacao)).toBeFalsy()
  })

  it('Should check trade assets are supported', async () => {
    expect(await protocol.isAssetSupported(assetFromStringEx('AVAX~AVAX'))).toBeTruthy()
  })

  it('Should get all swaps with correct protocol name', async () => {
    const swaps = await protocol.getSwapHistory({ chainAddresses: [{ chain: 'chain', address: 'address' }] })
    expect(swaps.swaps.every((swap) => swap.protocol === 'Thorchain')).toEqual(true)
  })

  it('Should get swaps history', async () => {
    const swapResume = await protocol.getSwapHistory({ chainAddresses: [{ chain: 'chain', address: 'address' }] })
    expect(swapResume.count === swapResume.swaps.length)
    const sucessSwap = swapResume.swaps[0] as SuccessSwap
    expect({
      date: sucessSwap.date,
      protocol: sucessSwap.protocol,
      status: sucessSwap.status,
      in: {
        hash: sucessSwap.inboundTx.hash,
        address: sucessSwap.inboundTx.address,
        asset: assetToString(sucessSwap.inboundTx.amount.asset),
        amount: baseToAsset(sucessSwap.inboundTx.amount.baseAmount).amount().toString(),
      },
      out: {
        hash: sucessSwap.outboundTx.hash,
        address: sucessSwap.outboundTx.address,
        asset: assetToString(sucessSwap.outboundTx.amount.asset),
        amount: baseToAsset(sucessSwap.outboundTx.amount.baseAmount).amount().toString(),
      },
    }).toEqual({
      date: new Date('2024-03-17T14:29:09.029Z'),
      status: 'success',
      protocol: 'Thorchain',
      in: {
        hash: 'EA7F60B6EB355A40FA7DAA030A0F09F27B7C3AE18E8AE8AB55A7C87DA80F0446',
        address: 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55',
        asset: 'DOGE/DOGE',
        amount: '8992.93646959',
      },
      out: {
        hash: '',
        address: 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55',
        asset: 'ETH/USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
        amount: '1355.86901',
      },
    })
  })
  it('Should list earn products', async () => {
    const vaults = await protocol.listEarnProducts()
    expect(vaults.length).toBe(11)
    expect(vaults.every((vault) => vault.protocol === 'Thorchain')).toBeTruthy()
    expect(assetToString(vaults[0].asset)).toBe('AVAX.AVAX')
    expect(vaults[0].isEnabled).toBeTruthy()
    expect(vaults[0].apr).toBe(0.048445694045141235)
  })

  it('Should estimate add to earn product', async () => {
    const quote = await protocol.estimateAddToEarnProduct({
      amount: new CryptoAmount<Asset>(baseAmount(1 * 10 ** 8, 8), AssetBTC),
    })
    expect(quote.protocol).toBe('Thorchain')
    expect(quote.canAdd).toBeTruthy()
    expect(quote.memo).toBe('+:BTC/BTC')
    expect(quote.toAddress).toBe('bc1qsjppu8lmy3ketcck6vm7jpsm0wpnfz4nfayuze')
    expect(assetToString(quote.amount.asset)).toBe('BTC.BTC')
    expect(quote.amount.assetAmount.amount().toString()).toBe('0.99725019')
    expect(assetToString(quote.depositedAmount.asset)).toBe('BTC.BTC')
    expect(quote.depositedAmount.assetAmount.amount().toString()).toBe('0.99725019')
    expect(quote.recommendedMinAmount ? assetToString(quote.recommendedMinAmount.asset) : undefined).toBe('BTC.BTC')
    expect(quote.recommendedMinAmount ? quote.recommendedMinAmount?.assetAmount.amount().toString() : undefined).toBe(
      '0.0001',
    )
    expect(quote.amount.assetAmount.amount().toString()).toBe('0.99725019')
    expect(quote.errors.length).toBe(0)
    expect(assetToString(quote.fees.asset)).toBe('BTC/BTC')
    expect(quote.fees.affiliateFee.assetAmount.amount().toString()).toBe('0')
    expect(assetToString(quote.fees.affiliateFee.asset)).toBe('BTC.BTC')
    expect(quote.fees.outboundFee.assetAmount.amount().toString()).toBe('0.00000161')
    expect(assetToString(quote.fees.outboundFee.asset)).toBe('BTC/BTC')
    expect(quote.fees.liquidityFee.assetAmount.amount().toString()).toBe('0.00274449')
    expect(assetToString(quote.fees.liquidityFee.asset)).toBe('BTC/BTC')
  })

  it('Should estimate withdraw from earn product', async () => {
    const quote = await protocol.estimateWithdrawFromEarnProduct({
      asset: AssetBTC,
      address: 'bc1qqduzvppjz2v0mccuel5d94qy2k43xhyr6amnp2',
      withdrawBps: 5000,
    })
    expect(quote.protocol).toBe('Thorchain')
    expect(quote.memo).toBe('-:BTC/BTC:5000')
    expect(quote.toAddress).toBe('bc1qsrfhgcmj09086rjkk22d5pq27ldphpm5r0jaa7')
    expect(quote.dustAmount.assetAmount.amount().toString()).toBe('0.00015')
    expect(assetToString(quote.dustAmount.asset)).toBe('BTC.BTC')
    expect(assetToString(quote.expectedAmount.asset)).toBe('BTC.BTC')
    expect(quote.expectedAmount.assetAmount.amount().toString()).toBe('24.31783828')
    expect(quote.errors.length).toBe(0)
    expect(assetToString(quote.fees.asset)).toBe('BTC.BTC')
    expect(quote.fees.affiliateFee.assetAmount.amount().toString()).toBe('0')
    expect(assetToString(quote.fees.affiliateFee.asset)).toBe('BTC.BTC')
    expect(quote.fees.outboundFee.assetAmount.amount().toString()).toBe('0.00002232')
    expect(assetToString(quote.fees.outboundFee.asset)).toBe('BTC.BTC')
    expect(quote.fees.liquidityFee.assetAmount.amount().toString()).toBe('0.05607546')
    expect(assetToString(quote.fees.liquidityFee.asset)).toBe('BTC.BTC')
  })
})
