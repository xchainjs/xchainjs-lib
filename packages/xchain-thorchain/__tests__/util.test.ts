import { AssetType } from '@xchainjs/xchain-util'

import { isAssetRuneNative as isAssetRune } from '../src'

describe('Utils', () => {
  it('Should validate Rune asset', () => {
    expect(isAssetRune({ chain: 'THOR', symbol: 'RUNE', ticker: 'RUNE', type: AssetType.NATIVE })).toBeTruthy()
    expect(isAssetRune({ chain: 'ARB', symbol: 'ARB', ticker: 'ETH', type: AssetType.NATIVE })).toBeFalsy()
  })
})
