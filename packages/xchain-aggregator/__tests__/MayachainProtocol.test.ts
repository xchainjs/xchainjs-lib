import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { assetFromStringEx } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/mayachain/midgard/api'
import { MayachainProtocol } from '../src/protocols'

describe('Mayachain protocol', () => {
  let protocol: MayachainProtocol

  beforeAll(() => {
    protocol = new MayachainProtocol()
    mockMidgardApi.init()
  })

  afterAll(() => {
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
})
