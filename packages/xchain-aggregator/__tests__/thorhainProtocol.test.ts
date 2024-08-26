import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { assetFromStringEx, assetToString, baseToAsset } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/thorchain/midgard/api'
import mockThornodeApi from '../__mocks__/thorchain/thornode/api'
import { ThorchainProtocol } from '../src/protocols/thorchain'

describe('Thorchain protocol', () => {
  let protocol: ThorchainProtocol

  beforeAll(() => {
    protocol = new ThorchainProtocol()
  })

  beforeEach(() => {
    mockMidgardApi.init()
    mockThornodeApi.init()
  })

  afterEach(() => {
    mockMidgardApi.restore()
    mockThornodeApi.restore()
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
    expect({
      date: swapResume.swaps[0].date,
      protocol: swapResume.swaps[0].protocol,
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
})
