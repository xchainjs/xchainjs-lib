import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'
jest.mock('@xchainjs/xchain-mayachain-amm')
import {
  CryptoAmount,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseToAsset,
} from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/mayachain/midgard/api'
import { MayachainProtocol } from '../src/protocols/mayachain'
import { SuccessSwap } from '../src'

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

  const mockIsRouterApprovedToSpend = jest
    .fn()
    .mockReturnValue(['Maya router has not been approved to spend this amount'])
  MayachainAMM.prototype.isRouterApprovedToSpend = mockIsRouterApprovedToSpend

  const mockApproveRouterToSpend = jest.fn().mockResolvedValue({
    hash: 'mockedHash',
    url: 'http://mocked.url',
  })
  MayachainAMM.prototype.approveRouterToSpend = mockApproveRouterToSpend

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

    expect(mockIsRouterApprovedToSpend).toHaveBeenCalledWith({
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
    expect(await protocol.isAssetSupported(AssetCacao)).toBeTruthy()
  })

  it('Should check asset is not supported', async () => {
    expect(await protocol.isAssetSupported(assetFromStringEx('AVAX.AVAX'))).toBeFalsy()
  })

  it('Should check trade assets are not supported', async () => {
    expect(await protocol.isAssetSupported(assetFromStringEx('AVAX~AVAX'))).toBeFalsy()
  })

  it('Should get all swaps with correct protocol name', async () => {
    const swaps = await protocol.getSwapHistory({ chainAddresses: [{ chain: 'chain', address: 'address' }] })
    expect(swaps.swaps.every((swap) => swap.protocol === 'Mayachain')).toEqual(true)
  })

  it('Should get swaps history', async () => {
    const swapResume = await protocol.getSwapHistory({ chainAddresses: [{ chain: 'chain', address: 'address' }] })
    expect(swapResume.count === swapResume.swaps.length)
    const sucessSwap = swapResume.swaps[0] as SuccessSwap
    expect({
      date: sucessSwap.date,
      status: sucessSwap.status,
      protocol: sucessSwap.protocol,
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
