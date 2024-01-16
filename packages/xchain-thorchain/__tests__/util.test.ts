import { isAssetRune } from '..'
describe('Utils', () => {
  it('Should validate Rune asset', () => {
    expect(isAssetRune({ chain: 'THOR', symbol: 'RUNE', ticker: 'RUNE', synth: false })).toBeTruthy()
    expect(isAssetRune({ chain: 'ARB', symbol: 'ARB', ticker: 'ETH', synth: false })).toBeFalsy()
  })
})
