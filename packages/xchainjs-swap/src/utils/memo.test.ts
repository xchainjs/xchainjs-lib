import { AssetBNB, AssetBTC, AssetRuneB1A, AssetRuneNative, baseAmount } from '@xchainjs/xchain-util'
import {
  getBondMemo,
  getDepositMemo,
  getLeaveMemo,
  getSwapMemo,
  getSwitchMemo,
  getUnbondMemo,
  getWithdrawMemo
} from './memo'

describe('memo', () => {
  describe('getSwapMemo', () => {
    it('returns long memo to swap BNB', () => {
      expect(getSwapMemo({ asset: AssetBNB, address: 'bnb123', limit: baseAmount(1234), short: false })).toEqual(
        'SWAP:BNB.BNB:bnb123:1234'
      )
    })
    it('returns long memo for an empty address, but w/ limit ', () => {
      expect(getSwapMemo({ asset: AssetBNB, limit: baseAmount(1234), short: false })).toEqual('SWAP:BNB.BNB::1234')
    })
    it('returns long memo w/o limit ', () => {
      expect(getSwapMemo({ asset: AssetBNB, address: 'bnb123', short: false })).toEqual('SWAP:BNB.BNB:bnb123')
    })
  })
  it('returns long memo w/o address and w/o limit ', () => {
    expect(getSwapMemo({ asset: AssetBNB, short: false })).toEqual('SWAP:BNB.BNB:')
  })
  it('returns long memo to swap RUNE', () => {
    expect(getSwapMemo({ asset: AssetRuneB1A, address: 'bnb123', limit: baseAmount(1234), short: false })).toEqual(
      'SWAP:BNB.RUNE-B1A:bnb123:1234'
    )
  })
  it('returns long memo to swap BTC', () => {
    expect(getSwapMemo({ asset: AssetBTC, address: 'btc123', limit: baseAmount(1234), short: false })).toEqual(
      'SWAP:BTC.BTC:btc123:1234'
    )
  })
  it('force short memo', () => {
    expect(getSwapMemo({ asset: AssetBTC, address: 'btc123', short: true })).toEqual('=:BTC.BTC:btc123')
  })

  it('short memo by default', () => {
    expect(getSwapMemo({ asset: AssetBTC, address: 'btc123' })).toEqual('=:BTC.BTC:btc123')
  })

  describe('getDepositMemo', () => {
    it('returns long memo to deposit BNB', () => {
      expect(getDepositMemo({ asset: AssetBNB, short: false })).toEqual('ADD:BNB.BNB')
    })
    it('force short memo', () => {
      expect(getDepositMemo({ asset: AssetBNB, short: true })).toEqual('+:BNB.BNB')
    })
    it('short memo by default', () => {
      expect(getDepositMemo({ asset: AssetBNB, short: true })).toEqual('+:BNB.BNB')
    })
    it('returns long memo to deposit RUNE', () => {
      expect(getDepositMemo({ asset: AssetRuneB1A, short: false })).toEqual('ADD:BNB.RUNE-B1A')
    })
    it('returns long memo to deposit BTC', () => {
      expect(getDepositMemo({ asset: AssetBTC, short: false })).toEqual('ADD:BTC.BTC')
    })
    it('returns long memo to deposit BTC with cross-referenced address', () => {
      expect(getDepositMemo({ asset: AssetBTC, address: 'bnb123', short: false })).toEqual('ADD:BTC.BTC:bnb123')
    })
  })
  describe('getWithdrawMemo', () => {
    it('returns long memo to withdraw BNB', () => {
      expect(getWithdrawMemo({ asset: AssetBNB, percent: 11, short: false })).toEqual('WITHDRAW:BNB.BNB:1100')
    })
    it('returns long memo to withdraw RUNE', () => {
      expect(getWithdrawMemo({ asset: AssetRuneNative, percent: 22, short: false })).toEqual('WITHDRAW:THOR.RUNE:2200')
    })
    it('returns long memo to withdraw BTC', () => {
      expect(getWithdrawMemo({ asset: AssetBTC, percent: 33, short: false })).toEqual('WITHDRAW:BTC.BTC:3300')
    })
    it('returns long memo to withdraw (asym) BTC', () => {
      expect(getWithdrawMemo({ asset: AssetBTC, percent: 100, targetAsset: AssetBTC, short: false })).toEqual(
        'WITHDRAW:BTC.BTC:10000:BTC.BTC'
      )
    })
    it('returns long memo to withdraw (asym) RUNE', () => {
      expect(getWithdrawMemo({ asset: AssetBTC, percent: 100, targetAsset: AssetRuneNative, short: false })).toEqual(
        'WITHDRAW:BTC.BTC:10000:THOR.RUNE'
      )
    })
    it('force short memo', () => {
      expect(getWithdrawMemo({ asset: AssetBTC, percent: 100, targetAsset: AssetRuneNative, short: true })).toEqual(
        '-:BTC.BTC:10000:THOR.RUNE'
      )
    })
    it('short memo by default', () => {
      expect(getWithdrawMemo({ asset: AssetBTC, percent: 100, targetAsset: AssetRuneNative })).toEqual(
        '-:BTC.BTC:10000:THOR.RUNE'
      )
    })
    it('adjusts percent to 100 if percent > 100 ', () => {
      expect(getWithdrawMemo({ asset: AssetBTC, percent: 101, short: false })).toEqual('WITHDRAW:BTC.BTC:10000')
    })
    it('adjusts negative number of percent to 0', () => {
      expect(getWithdrawMemo({ asset: AssetBTC, percent: -10, short: false })).toEqual('WITHDRAW:BTC.BTC:0')
    })
  })
  describe('getSwitchMemo', () => {
    it('returns memo to withdraw BNB', () => {
      expect(getSwitchMemo('tthor123')).toEqual('SWITCH:tthor123')
    })
  })

  describe('getBondMemo', () => {
    it('returns memo to bond', () => {
      expect(getBondMemo('tthor123')).toEqual('BOND:tthor123')
    })
  })

  describe('getUnbondMemo', () => {
    it('returns memo to unbond from BaseAmount units value', () => {
      expect(getUnbondMemo('tthor123', baseAmount('1000'))).toEqual('UNBOND:tthor123:1000')
    })
  })

  describe('getLeaveMemo', () => {
    it('returns memo to leave', () => {
      expect(getLeaveMemo('tthor123')).toEqual('LEAVE:tthor123')
    })
  })
})
