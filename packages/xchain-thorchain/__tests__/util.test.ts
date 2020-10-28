import { AssetRune } from '../src/types'
import { getDenom, getAsset } from '../src/util'

describe('thorchain/util', () => {
  describe('Denom <-> Asset', () => {
    describe('getDenom', () => {
      it('get denom for AssetRune', () => {
        expect(getDenom(AssetRune)).toEqual('thor')
      })
    })

    describe('getAsset', () => {
      it('get asset for thor', () => {
        expect(getAsset('thor')).toEqual(AssetRune)
      })

      it('get asset for unknown', () => {
        expect(getAsset('unknown')).toBeNull()
      })
    })
  })
})
