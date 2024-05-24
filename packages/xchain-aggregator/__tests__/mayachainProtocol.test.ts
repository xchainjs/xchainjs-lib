import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { assetFromStringEx, assetToString, baseToAsset } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/mayachain/midgard/api'
import { MayachainProtocol } from '../src/protocols'

describe('Mayachain protocol', () => {
  let protocol: MayachainProtocol

  beforeAll(() => {
    protocol = new MayachainProtocol()
  })

  beforeEach(() => {
    mockMidgardApi.init()
  })

  afterEach(() => {
    mockMidgardApi.restore()
  })

  it('Should check asset is supported', async () => {
    expect(await protocol.isAssetSupported(AssetBTC)).toBeTruthy()
  })

  it('Should check native asset is supported', async () => {
    expect(await protocol.isAssetSupported(AssetCacao)).toBeTruthy()
  })

  it('Should check asset is not supported', async () => {
    expect(await protocol.isAssetSupported(assetFromStringEx('AVAX.AVAX'))).toBeFalsy()
  })

  it('Should get all swaps with correct protocol name', async () => {
    const swaps = await protocol.getSwapHistory({ chainAddresses: [{ chain: 'chain', address: 'address' }] })
    expect(swaps.swaps.every((swap) => swap.protocol === 'Mayachain')).toEqual(true)
  })

  it('Should get swaps history', async () => {
    const swapResume = await protocol.getSwapHistory({ chainAddresses: [{ chain: 'chain', address: 'address' }] })
    expect(swapResume.count === swapResume.swaps.length)
    expect({
      date: swapResume.swaps[0].date,
      status: swapResume.swaps[0].status,
      protocol: swapResume.swaps[0].protocol,
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
