import { TxType, txTypeFromMemo } from '../src/thorchain-checktx'

describe('txTypeFromMemo', () => {
  it('classifies a swap from the action field alone', () => {
    expect(txTypeFromMemo('=:BTC.BTC:bc1qaddress')).toBe(TxType.Swap)
    expect(txTypeFromMemo('=<:BTC.BTC:bc1qaddress:100000')).toBe(TxType.Swap)
    expect(txTypeFromMemo('s:BTC.BTC:bc1qaddress')).toBe(TxType.Swap)
    expect(txTypeFromMemo('swap:BTC.BTC:bc1qaddress')).toBe(TxType.Swap)
    expect(txTypeFromMemo('SWAP:ETH.ETH:0xabc')).toBe(TxType.Swap)
  })

  it('treats pool memos as liquidity and ignores retired saver memos', () => {
    expect(txTypeFromMemo('+:BTC.BTC:thor1abc')).toBe(TxType.AddLP)
    expect(txTypeFromMemo('+:BTC/BTC')).toBe(TxType.Unknown)
    expect(txTypeFromMemo('-:BTC.BTC:100')).toBe(TxType.WithdrawLP)
    expect(txTypeFromMemo('wd:BTC/BTC:1000')).toBe(TxType.Unknown)
  })

  it('does not treat a letter inside another action as its own action', () => {
    expect(txTypeFromMemo('switch:BTC.BTC')).toBe(TxType.Unknown)
    expect(txTypeFromMemo('reserve')).toBe(TxType.Unknown)
    expect(txTypeFromMemo('OUT:abc')).toBe(TxType.Other)
    expect(txTypeFromMemo('REFUND:abc')).toBe(TxType.Refund)
  })
})
