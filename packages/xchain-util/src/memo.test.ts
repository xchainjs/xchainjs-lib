import { AssetBNB, AssetBTC, AssetRuneB1A, baseAmount } from './asset'
import { getDepositMemo, getSwapMemo, getWithdrawMemo } from './memo'

describe('memo', () => {
  describe('getSwapMemo', () => {
    it('returns memo to swap BNB', () => {
      expect(getSwapMemo({ asset: AssetBNB, address: 'bnb123', limit: baseAmount(1234) })).toEqual(
        'SWAP:BNB.BNB:bnb123:1234',
      )
    })
    it('returns memo for an empty address ', () => {
      expect(getSwapMemo({ asset: AssetBNB, limit: baseAmount(1234) })).toEqual('SWAP:BNB.BNB::1234')
    })
    it('returns memo w/o limit ', () => {
      expect(getSwapMemo({ asset: AssetBNB, address: 'bnb123' })).toEqual('SWAP:BNB.BNB:bnb123:')
    })
  })
  it('returns memo w/o address and w/o limit ', () => {
    expect(getSwapMemo({ asset: AssetBNB })).toEqual('SWAP:BNB.BNB::')
  })
  it('returns memo to swap RUNE', () => {
    expect(getSwapMemo({ asset: AssetRuneB1A, address: 'bnb123', limit: baseAmount(1234) })).toEqual(
      'SWAP:BNB.RUNE-B1A:bnb123:1234',
    )
  })
  it('returns memo to swap BTC', () => {
    expect(getSwapMemo({ asset: AssetBTC, address: 'btc123', limit: baseAmount(1234) })).toEqual(
      'SWAP:BTC.BTC:btc123:1234',
    )
  })
})
describe('getDepositMemo', () => {
  it('returns memo to deposit BNB', () => {
    expect(getDepositMemo(AssetBNB)).toEqual('STAKE:BNB.BNB:')
  })
  it('returns memo to deposit RUNE', () => {
    expect(getDepositMemo(AssetRuneB1A)).toEqual('STAKE:BNB.RUNE-B1A:')
  })
  it('returns memo to deposit BTC', () => {
    expect(getDepositMemo(AssetBTC)).toEqual('STAKE:BTC.BTC:')
  })
  it('returns memo to deposit BTC with cross-referenced address', () => {
    expect(getDepositMemo(AssetBTC, 'bnb123')).toEqual('STAKE:BTC.BTC:bnb123')
  })
})
describe('getWithdrawMemo', () => {
  it('returns memo to withdraw BNB', () => {
    expect(getWithdrawMemo(AssetBNB, 11)).toEqual('WITHDRAW:BNB.BNB:11')
  })
  it('returns memo to withdraw RUNE', () => {
    expect(getWithdrawMemo(AssetRuneB1A, 22)).toEqual('WITHDRAW:BNB.RUNE-B1A:22')
  })
  it('returns memo to withdraw BTC', () => {
    expect(getWithdrawMemo(AssetBTC, 33)).toEqual('WITHDRAW:BTC.BTC:33')
  })
})
