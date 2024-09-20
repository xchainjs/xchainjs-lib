import {
  Asset,
  AssetCryptoAmount,
  CryptoAmount,
  SynthAsset,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
  baseToAsset,
} from '@xchainjs/xchain-util'

import mockMayanodeApi from '../__mocks__/mayanode-api'
import mockMayamidgardApi from '../__mocks__/midgard-api'
import { BtcAsset, EthAsset, PendingSwap, RuneAsset, SuccessSwap } from '../src/'
import { MayachainCache } from '../src/mayachain-cache'
import { MayachainQuery } from '../src/mayachain-query'

describe('Mayachain-query tests', () => {
  let mayachainQuery: MayachainQuery

  beforeAll(() => {
    mockMayanodeApi.init()
    mockMayamidgardApi.init()
    mayachainQuery = new MayachainQuery(new MayachainCache())
  })

  afterAll(() => {
    mockMayamidgardApi.restore()
    mockMayanodeApi.restore()
  })

  it('Should fetch BTC to ETH swap', async () => {
    const quoteSwap = await mayachainQuery.quoteSwap({
      amount: new AssetCryptoAmount(assetToBase(assetAmount(1)), BtcAsset),
      fromAsset: BtcAsset,
      destinationAsset: EthAsset,
    })
    expect(quoteSwap.toAddress).toBe('bc1q0cyg49kz2u982x0m57f8ces0296s04wedddrcs')
    expect(quoteSwap.memo).toBe('')
    expect(assetToString(quoteSwap.expectedAmount.asset)).toBe(assetToString(EthAsset))
    expect(quoteSwap.expectedAmount.baseAmount.amount().toString()).toBe('1740667871')
    expect(quoteSwap.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.dustThreshold.asset)).toBe(assetToString(BtcAsset))
    expect(quoteSwap.dustThreshold.baseAmount.amount().toString()).toBe('10000')
    expect(quoteSwap.dustThreshold.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.asset)).toBe(assetToString(EthAsset))
    expect(assetToString(quoteSwap.fees.affiliateFee.asset)).toBe(assetToString(EthAsset))
    expect(quoteSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.fees.affiliateFee.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.outboundFee.asset)).toBe(assetToString(EthAsset))
    expect(quoteSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('360000')
    expect(quoteSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
    expect(quoteSwap.inboundConfirmationBlocks).toBe(1)
    expect(quoteSwap.inboundConfirmationSeconds).toBe(600)
    expect(quoteSwap.outboundDelayBlocks).toBe(248)
    expect(quoteSwap.outboundDelaySeconds).toBe(3720)
    expect(quoteSwap.totalSwapSeconds).toBe(600 + 3720)
    expect(quoteSwap.slipBasisPoints).toBe(189)
    expect(quoteSwap.canSwap).toBe(false)
    expect(quoteSwap.errors.length).toBe(1)
    expect(quoteSwap.warning).toBe('')
  })

  it('Should fetch RUNE to BTC swap', async () => {
    const quoteSwap = await mayachainQuery.quoteSwap({
      fromAsset: RuneAsset,
      destinationAsset: BtcAsset,
      amount: new AssetCryptoAmount(baseAmount('688598892692', 8), BtcAsset),
      fromAddress: 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55',
      destinationAddress: 'bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj',
      affiliateAddress: 'maya17hwqt302e5f2xm4h95ma8wuggqkvfzgvsyfc54',
      affiliateBps: 1000,
    })
    expect(quoteSwap.toAddress).toBe('thor10cyg49kz2u982x0m57f8ces0296s04weas2nfz')
    expect(quoteSwap.memo).toBe(
      '=:BTC.BTC:bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj::maya17hwqt302e5f2xm4h95ma8wuggqkvfzgvsyfc54:1000',
    )
    expect(assetToString(quoteSwap.expectedAmount.asset)).toBe(assetToString(BtcAsset))
    expect(quoteSwap.expectedAmount.baseAmount.amount().toString()).toBe('86790283')
    expect(quoteSwap.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.dustThreshold.asset)).toBe(assetToString(RuneAsset))
    expect(quoteSwap.dustThreshold.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.dustThreshold.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.asset)).toBe(assetToString(BtcAsset))
    expect(assetToString(quoteSwap.fees.affiliateFee.asset)).toBe(assetToString(BtcAsset))
    expect(quoteSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('9652531')
    expect(quoteSwap.fees.affiliateFee.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.outboundFee.asset)).toBe(assetToString(BtcAsset))
    expect(quoteSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('82500')
    expect(quoteSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
    expect(quoteSwap.inboundConfirmationBlocks).toBe(undefined)
    expect(quoteSwap.inboundConfirmationSeconds).toBe(undefined)
    expect(quoteSwap.outboundDelayBlocks).toBe(225)
    expect(quoteSwap.outboundDelaySeconds).toBe(135000)
    expect(quoteSwap.totalSwapSeconds).toBe(0 + 135000)
    expect(quoteSwap.slipBasisPoints).toBe(83)
    expect(quoteSwap.canSwap).toBe(true)
    expect(quoteSwap.errors.length).toBe(0)
    expect(quoteSwap.warning).toBe('')
  })

  it('Should fetch ETH to BTC streaming swap', async () => {
    const quoteSwap = await mayachainQuery.quoteSwap({
      fromAsset: EthAsset,
      destinationAsset: BtcAsset,
      amount: new CryptoAmount(baseAmount('688598892692', 8), BtcAsset),
      fromAddress: '0xe3985E6b61b814F7Cdb188766562ba71b446B46d',
      destinationAddress: 'bc1q07kx42qz758yhr7jn3pu9ffz2rwy0snlwztwf8',
      streamingInterval: 100,
      streamingQuantity: 10,
    })

    expect(quoteSwap.toAddress).toBe('0xb9ac6d689a18be4588f348301208e40f57a868d4')
    expect(quoteSwap.memo).toBe('=:BTC.BTC:bc1q07kx42qz758yhr7jn3pu9ffz2rwy0snlwztwf8:5216435/100/2')
    expect(assetToString(quoteSwap.expectedAmount.asset)).toBe(assetToString(BtcAsset))
    expect(quoteSwap.expectedAmount.baseAmount.amount().toString()).toBe('5248264')
    expect(quoteSwap.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.dustThreshold.asset)).toBe(assetToString(EthAsset))
    expect(quoteSwap.dustThreshold.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.dustThreshold.baseAmount.decimal).toBe(18)
    expect(assetToString(quoteSwap.fees.asset)).toBe(assetToString(BtcAsset))
    expect(assetToString(quoteSwap.fees.affiliateFee.asset)).toBe(assetToString(BtcAsset))
    expect(quoteSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.fees.affiliateFee.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.outboundFee.asset)).toBe(assetToString(BtcAsset))
    expect(quoteSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('9110')
    expect(quoteSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
    expect(quoteSwap.inboundConfirmationBlocks).toBe(undefined)
    expect(quoteSwap.inboundConfirmationSeconds).toBe(undefined)
    expect(quoteSwap.outboundDelayBlocks).toBe(14)
    expect(quoteSwap.outboundDelaySeconds).toBe(84)
    expect(quoteSwap.totalSwapSeconds).toBe(600)
    expect(quoteSwap.slipBasisPoints).toBe(11)
    expect(quoteSwap.streamingSwapBlocks).toBe(100)
    expect(quoteSwap.streamingSwapSeconds).toBe(600)
    expect(quoteSwap.maxStreamingQuantity).toBe(2)
    expect(quoteSwap.expiry).toBe(1721775525)
    expect(quoteSwap.router).toBe('0xe3985E6b61b814F7Cdb188766562ba71b446B46d')
    expect(quoteSwap.gasRateUnits).toBe('gwei')
    expect(quoteSwap.recommendedGasRate).toBe('1')
    expect(assetToString(quoteSwap.recommendedMinAmountIn?.asset as Asset)).toBe('ETH.ETH')
    expect(quoteSwap.canSwap).toBe(true)
    expect(quoteSwap.errors.length).toBe(0)
    expect(quoteSwap.warning).toBe('')
  })

  it('Should return the number of decimals of Mayachain assets', async () => {
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('BTC.BTC') as Asset)).toBe(8)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('BTC/BTC') as SynthAsset)).toBe(8)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('ETH.ETH') as Asset)).toBe(18)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('DASH.DASH') as Asset)).toBe(8)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('KUJI.KUJI') as Asset)).toBe(6)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('THOR.RUNE') as Asset)).toBe(8)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('MAYA.CACAO') as Asset)).toBe(10)
    expect(
      await mayachainQuery.getAssetDecimals(
        assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7') as TokenAsset,
      ),
    ).toBe(6)
    expect(
      await mayachainQuery.getAssetDecimals(
        assetFromStringEx('ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48') as TokenAsset,
      ),
    ).toBe(6)
    expect(
      await mayachainQuery.getAssetDecimals(
        assetFromStringEx('ETH.WSTETH-0X7F39C581F595B53C5CB19BD0B3F8DA6C935E2CA0') as TokenAsset,
      ),
    ).toBe(18)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('KUJI.USK') as TokenAsset)).toBe(6)
    expect(
      mayachainQuery.getAssetDecimals(
        assetFromStringEx('ETH.BNB-0xB8c77482e45F1F44dE1745F52C74426C631bDD52') as TokenAsset,
      ),
    ).rejects.toThrowError('Can not get decimals for ETH.BNB-0xB8c77482e45F1F44dE1745F52C74426C631bDD52')
  })

  it('Should get swaps history', async () => {
    const swapResume = await mayachainQuery.getSwapHistory({ addresses: ['address'] })
    expect(swapResume.count === swapResume.swaps.length)
    const pendingSwap = swapResume.swaps[0] as PendingSwap
    expect({
      date: pendingSwap.date,
      status: pendingSwap.status,
      fromAsset: assetToString(pendingSwap.fromAsset),
      toAsset: assetToString(pendingSwap.toAsset),
      in: {
        hash: pendingSwap.inboundTx.hash,
        address: pendingSwap.inboundTx.address,
        asset: assetToString(pendingSwap.inboundTx.amount.asset),
        amount: baseToAsset(pendingSwap.inboundTx.amount.baseAmount).amount().toString(),
      },
    }).toEqual({
      date: new Date('2024-09-20T11:46:24.224Z'),
      status: 'pending',
      fromAsset: 'ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7',
      toAsset: 'THOR.RUNE',
      in: {
        hash: '4C8A83C316B0247AE293F3D5A0B07974DE4083F220BF5551ACF20E66D17BC252',
        address: '0xd1f7112354055160d58fa1b1e7cfd15c0bfee464',
        asset: 'ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7',
        amount: '104.34782608',
      },
    })
    const successSwap = swapResume.swaps[1] as SuccessSwap
    expect({
      date: successSwap.date,
      status: successSwap.status,
      fromAsset: assetToString(successSwap.fromAsset),
      toAsset: assetToString(successSwap.toAsset),
      in: {
        hash: successSwap.inboundTx.hash,
        address: successSwap.inboundTx.address,
        asset: assetToString(successSwap.inboundTx.amount.asset),
        amount: baseToAsset(successSwap.inboundTx.amount.baseAmount).amount().toString(),
      },
      out: {
        hash: successSwap.outboundTx.hash,
        address: successSwap.outboundTx.address,
        asset: assetToString(successSwap.outboundTx.amount.asset),
        amount: baseToAsset(successSwap.outboundTx.amount.baseAmount).amount().toString(),
      },
    }).toEqual({
      date: new Date('2024-03-12T02:28:28.760Z'),
      status: 'success',
      fromAsset: 'ETH.ETH',
      toAsset: 'MAYA.CACAO',
      in: {
        hash: '224CAF4D502A0A415F1312AFD16C0E7A2E3E79840AF593C2F875C806AA12E020',
        address: '0xaa278b62225f6dbc4436de8fa3dd195e1542d159',
        asset: 'ETH.ETH',
        amount: '0.99',
      },
      out: {
        hash: '',
        address: 'maya17xu9ej4rkxsmnl3wkp0kph6k4jk70gzay56p0l',
        asset: 'MAYA.CACAO',
        amount: '3329.7336036086',
      },
    })
  })

  it('Should get MAYAName details', async () => {
    const details = await mayachainQuery.getMAYANameDetails('eld')
    expect(details).toBeTruthy()
    expect(details?.name).toBe('eld')
    expect(details?.expireBlockHeight).toBe(66754201)
    expect(details?.owner).toBe('maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn')
    expect(details?.aliases.length).toBe(6)
    expect(details?.aliases[0].address).toBe('bc1qvqxs558vgquwkchw64erd5hfpxfj5kmn7lyklz')
    expect(details?.aliases[0].chain).toBe('BTC')
    expect(details?.aliases[1].address).toBe('XgYRN3TLoYaodB5Y6AMZuYhjv8fKKG5tgh')
    expect(details?.aliases[1].chain).toBe('DASH')
    expect(details?.aliases[2].address).toBe('0x7316da75796f74e83b71c72ed6f138dd3b6b4957')
    expect(details?.aliases[2].chain).toBe('ETH')
    expect(details?.aliases[3].address).toBe('kujira1x8z69wuczjk42l22c3u6qzzd5vdeqdyhwkv84v')
    expect(details?.aliases[3].chain).toBe('KUJI')
    expect(details?.aliases[4].address).toBe('maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn')
    expect(details?.aliases[4].chain).toBe('MAYA')
    expect(details?.aliases[5].address).toBe('thor13x0f2r0jltfplmxe40cc67hhca27np34e495yr')
    expect(details?.aliases[5].chain).toBe('THOR')
  })

  it('Should get the MAYAnames owned by an address', async () => {
    const mayaNames = await mayachainQuery.getMAYANamesByOwner('maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn')
    expect(mayaNames.length).toBe(1)
    expect(mayaNames[0]?.name).toBe('eld')
    expect(mayaNames[0]?.expireBlockHeight).toBe(66754201)
    expect(mayaNames[0]?.owner).toBe('maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn')
    expect(mayaNames[0]?.aliases.length).toBe(6)
    expect(mayaNames[0]?.aliases[0].address).toBe('bc1qvqxs558vgquwkchw64erd5hfpxfj5kmn7lyklz')
    expect(mayaNames[0]?.aliases[0].chain).toBe('BTC')
    expect(mayaNames[0]?.aliases[1].address).toBe('XgYRN3TLoYaodB5Y6AMZuYhjv8fKKG5tgh')
    expect(mayaNames[0]?.aliases[1].chain).toBe('DASH')
    expect(mayaNames[0]?.aliases[2].address).toBe('0x7316da75796f74e83b71c72ed6f138dd3b6b4957')
    expect(mayaNames[0]?.aliases[2].chain).toBe('ETH')
    expect(mayaNames[0]?.aliases[3].address).toBe('kujira1x8z69wuczjk42l22c3u6qzzd5vdeqdyhwkv84v')
    expect(mayaNames[0]?.aliases[3].chain).toBe('KUJI')
    expect(mayaNames[0]?.aliases[4].address).toBe('maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn')
    expect(mayaNames[0]?.aliases[4].chain).toBe('MAYA')
    expect(mayaNames[0]?.aliases[5].address).toBe('thor13x0f2r0jltfplmxe40cc67hhca27np34e495yr')
    expect(mayaNames[0]?.aliases[5].chain).toBe('THOR')
  })

  it('Should estimate MAYAName registration with owner', async () => {
    const estimated = await mayachainQuery.estimateMAYAName({
      name: 'pg',
      chain: 'BTC',
      chainAddress: 'chainAddress',
      owner: 'mayaOwner',
    })

    const splittedMemo = estimated.memo.split(':')
    expect(splittedMemo[0] ?? splittedMemo[0]).toBe('~')
    expect(splittedMemo[1] ?? splittedMemo[1]).toBe('pg')
    expect(splittedMemo[2] ?? splittedMemo[2]).toBe('BTC')
    expect(splittedMemo[3] ?? splittedMemo[3]).toBe('chainAddress')
    expect(splittedMemo[4] ?? splittedMemo[4]).toBe('mayaOwner')
    expect(splittedMemo[5] ?? splittedMemo[5]).toBe('MAYA.CACAO')
    expect(assetToString(estimated.value.asset)).toBe('MAYA.CACAO')
    expect(estimated.value.assetAmount.amount().toString()).toBe('11.2512')
  })

  it('Should not estimate register over already registered MAYAName', async () => {
    expect(
      mayachainQuery.estimateMAYAName({
        name: 'eld',
        chain: 'BTC',
        chainAddress: 'chainAddress',
        owner: 'mayaOwner',
      }),
    ).rejects.toThrowError('MAYAName already registered')
  })
})
