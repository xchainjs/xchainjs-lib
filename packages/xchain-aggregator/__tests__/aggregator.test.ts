import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import {
  Asset,
  BaseAmount,
  CryptoAmount,
  assetAmount,
  assetToBase,
  assetToString,
  baseToAsset,
} from '@xchainjs/xchain-util'

import mockThornodeApi from '../__mocks__/mayachain/mayanode/api'
import mockMayaMidgardApi from '../__mocks__/mayachain/midgard/api'
import mockThorMidgardApi from '../__mocks__/thorchain/midgard/api'
import mockMayanodeApi from '../__mocks__/thorchain/thornode/api'
import { Aggregator, QuoteSwap, SuccessSwap } from '../src'
import { SupportedProtocols } from '../src/const'

function bestSwap(allQuotes: QuoteSwap[]) {
  const bestQuote = allQuotes.reduce((best, current) =>
    current.expectedAmount.gt(best.expectedAmount) ? current : best,
  )
  return bestQuote
}

describe('Aggregator', () => {
  let aggregator: Aggregator

  beforeAll(() => {
    aggregator = new Aggregator()
  })

  beforeEach(() => {
    mockThornodeApi.init()
    mockThorMidgardApi.init()
    mockMayanodeApi.init()
    mockMayaMidgardApi.init()
  })

  afterEach(() => {
    mockThornodeApi.restore()
    mockThorMidgardApi.restore()
    mockMayanodeApi.restore()
    mockMayaMidgardApi.restore()
  })

  it('Should init with no parameters', () => {
    expect(() => new Aggregator()).not.toThrow()
  })

  it('Should init with all protocols enabled', () => {
    const aggregator = new Aggregator()
    expect(aggregator.getConfiguration().protocols.length).toBe(SupportedProtocols.length)
  })

  it('Should init with custom protocols enabled', () => {
    const aggregator = new Aggregator({ protocols: ['Thorchain'] })
    expect(aggregator.getConfiguration().protocols.length).toBe(1)
  })

  it('Should throw error if no protocols enabled', () => {
    expect(() => new Aggregator({ protocols: [] })).toThrow(/No protocols enabled/)
  })

  it('Should throw error if basis points lower than 0', () => {
    expect(() => new Aggregator({ affiliate: { basisPoints: -1, affiliates: {} } })).toThrow(
      'Invalid affiliate basis point due to it is out of bound. It must be between [0 - 10000]',
    )
  })

  it('Should throw error if basis points greater than 10000', () => {
    expect(() => new Aggregator({ affiliate: { basisPoints: 10001, affiliates: {} } })).toThrow(
      'Invalid affiliate basis point due to it is out of bound. It must be between [0 - 10000]',
    )
  })

  it('Should find swap with greatest expected amount', async () => {
    const txEstimated = await aggregator.estimateSwap({
      fromAsset: AssetBTC,
      destinationAsset: AssetETH,
      amount: new CryptoAmount(assetToBase(assetAmount('1', 8)), AssetBTC),
    })
    expect(bestSwap(txEstimated).expectedAmount.assetAmount.amount().toString()).toBe('17.70607901')
  })

  it('Should get swap history', async () => {
    const swapHistory = await aggregator.getSwapHistory({
      chainAddresses: [
        { chain: 'THOR', address: 'address' },
        { chain: 'MAYA', address: 'address' },
      ],
    })
    expect(swapHistory.count).toEqual(swapHistory.swaps.length)
    const thorchainSwap = swapHistory.swaps.find((swap) => swap.protocol === 'Thorchain')
    expect(thorchainSwap).not.toBeUndefined()
    const successThorchainSwap = thorchainSwap as SuccessSwap
    expect({
      date: successThorchainSwap.date,
      status: successThorchainSwap.status,
      protocol: successThorchainSwap.protocol,
      in: {
        hash: successThorchainSwap.inboundTx.hash,
        address: successThorchainSwap.inboundTx.address,
        asset: assetToString(successThorchainSwap.inboundTx.amount.asset as Asset),
        amount: baseToAsset(successThorchainSwap.inboundTx.amount.baseAmount as BaseAmount)
          .amount()
          .toString(),
      },
      out: {
        hash: successThorchainSwap.outboundTx.hash,
        address: successThorchainSwap?.outboundTx?.address,
        asset: assetToString(successThorchainSwap?.outboundTx.amount.asset as Asset),
        amount: baseToAsset(successThorchainSwap?.outboundTx.amount.baseAmount as BaseAmount)
          .amount()
          .toString(),
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
    const mayachainSwap = swapHistory.swaps.find((swap) => swap.protocol === 'Mayachain')
    expect(mayachainSwap).not.toBeUndefined()
    const successMayachainSwap = mayachainSwap as SuccessSwap
    expect({
      date: successMayachainSwap.date,
      status: successMayachainSwap.status,
      protocol: successMayachainSwap.protocol,
      in: {
        hash: successMayachainSwap.inboundTx.hash,
        address: successMayachainSwap.inboundTx.address,
        asset: assetToString(successMayachainSwap.inboundTx.amount.asset as Asset),
        amount: baseToAsset(successMayachainSwap.inboundTx.amount.baseAmount as BaseAmount)
          .amount()
          .toString(),
      },
      out: {
        hash: successMayachainSwap.outboundTx.hash,
        address: successMayachainSwap.outboundTx.address,
        asset: assetToString(successMayachainSwap.outboundTx.amount.asset as Asset),
        amount: baseToAsset(successMayachainSwap.outboundTx.amount.baseAmount as BaseAmount)
          .amount()
          .toString(),
      },
    }).toEqual({
      date: new Date('2024-03-12T02:28:28.760Z'),
      status: 'success',
      protocol: 'Mayachain',
      in: {
        hash: '224CAF4D502A0A415F1312AFD16C0E7A2E3E79840AF593C2F875C806AA12E020',
        address: '0xaa278b62225f6dbc4436de8fa3dd195e1542d159',
        asset: 'ETH.ETH',
        amount: '0.01',
      },
      out: {
        hash: '',
        address: 'maya17xu9ej4rkxsmnl3wkp0kph6k4jk70gzay56p0l',
        asset: 'MAYA.CACAO',
        amount: '3329.7336036086',
      },
    })
  })
})
