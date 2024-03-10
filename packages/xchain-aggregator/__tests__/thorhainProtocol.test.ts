import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'

import mockThornodeApi from '../__mocks__/thorchain/thornode/api'
import { ThorchainProtocol } from '../src/protocols'

describe('Thorchain protocol', () => {
  let protocol: ThorchainProtocol

  beforeAll(() => {
    protocol = new ThorchainProtocol()
    mockThornodeApi.init()
  })

  afterAll(() => {
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
})
