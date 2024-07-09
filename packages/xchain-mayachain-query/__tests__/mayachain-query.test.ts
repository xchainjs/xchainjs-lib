import {
  Asset,
  AssetCryptoAmount,
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
import { BtcAsset, EthAsset, RuneAsset } from '../src/'
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
    expect({
      date: swapResume.swaps[0].date,
      status: swapResume.swaps[0].status,
      in: {
        hash: swapResume.swaps[0].inboundTx.hash,
        address: swapResume.swaps[0].inboundTx.address,
        asset: assetToString(swapResume.swaps[0].inboundTx.amount.asset),
        amount: baseToAsset(swapResume.swaps[0].inboundTx.amount.baseAmount).amount().toString(),
      },
      out: {
        hash: swapResume.swaps[0].outboundTx?.hash,
        address: swapResume.swaps[0].outboundTx?.address,
        asset: swapResume.swaps[0].outboundTx ? assetToString(swapResume.swaps[0].outboundTx.amount.asset) : undefined,
        amount: swapResume.swaps[0].outboundTx
          ? baseToAsset(swapResume.swaps[0].outboundTx.amount.baseAmount).amount().toString()
          : undefined,
      },
    }).toEqual({
      date: new Date('2024-03-12T02:28:28.760Z'),
      status: 'success',
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
    expect(details?.expire).toBe('66754201')
    expect(details?.owner).toBe('maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn')
    expect(details?.entries.length).toBe(6)
    expect(details?.entries[0].address).toBe('bc1qvqxs558vgquwkchw64erd5hfpxfj5kmn7lyklz')
    expect(details?.entries[0].chain).toBe('BTC')
    expect(details?.entries[1].address).toBe('XgYRN3TLoYaodB5Y6AMZuYhjv8fKKG5tgh')
    expect(details?.entries[1].chain).toBe('DASH')
    expect(details?.entries[2].address).toBe('0x7316da75796f74e83b71c72ed6f138dd3b6b4957')
    expect(details?.entries[2].chain).toBe('ETH')
    expect(details?.entries[3].address).toBe('kujira1x8z69wuczjk42l22c3u6qzzd5vdeqdyhwkv84v')
    expect(details?.entries[3].chain).toBe('KUJI')
    expect(details?.entries[4].address).toBe('maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn')
    expect(details?.entries[4].chain).toBe('MAYA')
    expect(details?.entries[5].address).toBe('thor13x0f2r0jltfplmxe40cc67hhca27np34e495yr')
    expect(details?.entries[5].chain).toBe('THOR')
  })

  it('Should get the MAYAnames owned by an address', async () => {
    const mayaNames = await mayachainQuery.getMAYANamesByOwner('maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn')
    expect(mayaNames.length).toBe(1)
    expect(mayaNames[0]?.name).toBe('eld')
    expect(mayaNames[0]?.expire).toBe('66754201')
    expect(mayaNames[0]?.owner).toBe('maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn')
    expect(mayaNames[0]?.entries.length).toBe(6)
    expect(mayaNames[0]?.entries[0].address).toBe('bc1qvqxs558vgquwkchw64erd5hfpxfj5kmn7lyklz')
    expect(mayaNames[0]?.entries[0].chain).toBe('BTC')
    expect(mayaNames[0]?.entries[1].address).toBe('XgYRN3TLoYaodB5Y6AMZuYhjv8fKKG5tgh')
    expect(mayaNames[0]?.entries[1].chain).toBe('DASH')
    expect(mayaNames[0]?.entries[2].address).toBe('0x7316da75796f74e83b71c72ed6f138dd3b6b4957')
    expect(mayaNames[0]?.entries[2].chain).toBe('ETH')
    expect(mayaNames[0]?.entries[3].address).toBe('kujira1x8z69wuczjk42l22c3u6qzzd5vdeqdyhwkv84v')
    expect(mayaNames[0]?.entries[3].chain).toBe('KUJI')
    expect(mayaNames[0]?.entries[4].address).toBe('maya13x0f2r0jltfplmxe40cc67hhca27np34ezmcjn')
    expect(mayaNames[0]?.entries[4].chain).toBe('MAYA')
    expect(mayaNames[0]?.entries[5].address).toBe('thor13x0f2r0jltfplmxe40cc67hhca27np34e495yr')
    expect(mayaNames[0]?.entries[5].chain).toBe('THOR')
  })
})
