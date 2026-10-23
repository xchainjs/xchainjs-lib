import { Tx, TxDetailsResponse } from '@xchainjs/xchain-thornode'
import { assetToString } from '@xchainjs/xchain-util'

import { ThorchainCache } from '../src/thorchain-cache'
import { SwapStatus, TransactionStage, TxType, WithdrawStatus } from '../src/thorchain-checktx'

const lastBlock = [
  { chain: 'THOR', last_observed_in: 1000, last_signed_out: 1000, thorchain: 1000 },
  { chain: 'BTC', last_observed_in: 800000, last_signed_out: 800000, thorchain: 1000 },
  { chain: 'ETH', last_observed_in: 19000000, last_signed_out: 19000000, thorchain: 1000 },
]

const decimals = async (asset: { chain: string }) => (asset.chain === 'ETH' ? 18 : 8)

function stageFor(txData: TxDetailsResponse): TransactionStage {
  const cache = {
    thornode: {
      getTxDetail: async () => txData,
      getLastBlock: async () => lastBlock,
    },
    midgardQuery: { getDecimalForAsset: decimals },
  }
  return new TransactionStage(cache as unknown as ThorchainCache)
}

function observedTx(memo: string, outTxs: Tx[] = [], fields: Partial<TxDetailsResponse> = {}): TxDetailsResponse {
  return {
    tx: {
      status: 'done',
      tx: {
        chain: 'BTC',
        from_address: 'bc1qfrom',
        coins: [{ asset: 'BTC.BTC', amount: '100000' }],
        gas: [],
        memo,
      },
    },
    txs: [],
    actions: [],
    out_txs: outTxs,
    consensus_height: 900,
    finalised_height: 900,
    outbound_height: 1010,
    ...fields,
  } as TxDetailsResponse
}

function outTx(amount: string, memo = 'OUT:abc', asset = 'BTC.BTC'): Tx {
  return {
    chain: 'BTC',
    to_address: 'bc1qdest',
    coins: [{ asset, amount }],
    gas: [],
    memo,
  }
}

describe('TransactionStage', () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => undefined)

  afterAll(() => {
    expect(log).not.toHaveBeenCalled()
    log.mockRestore()
  })

  it('keeps a streaming swap pending when nothing has been sent', async () => {
    const progress = await stageFor(observedTx('=:BTC.BTC:bc1qdest:0/1/0:xc:0', [])).checkTxProgress('hash')

    expect(progress.txType).toBe(TxType.Swap)
    expect(progress.swapInfo?.status).toBe(SwapStatus.Incomplete)
    expect(progress.swapInfo?.minimumAmountOut.baseAmount.amount().isNaN()).toBe(false)
    expect(progress.swapInfo?.minimumAmountOut.baseAmount.amount().toString()).toBe('0')
    expect(progress.swapInfo?.affliateFee.baseAmount.amount().toString()).toBe('0')
    expect(progress.swapInfo?.actualAmountOut).toBeUndefined()
  })

  it('reads the swap limit in 1e8 and does not treat affiliate basis points as an amount', async () => {
    const progress = await stageFor(observedTx('=:ETH.ETH:0xdest:100000000/1/0:dx:100', [])).checkTxProgress('hash')

    expect(progress.swapInfo?.status).toBe(SwapStatus.Incomplete)
    expect(progress.swapInfo?.minimumAmountOut.baseAmount.decimal).toBe(18)
    expect(progress.swapInfo?.minimumAmountOut.baseAmount.amount().toString()).toBe('1000000000000000000')
    expect(progress.swapInfo?.affliateFee.baseAmount.amount().toString()).toBe('0')
  })

  it('fills swap progress for a limit-swap memo', async () => {
    const progress = await stageFor(observedTx('=<:BTC.BTC:bc1qdest:100000')).checkTxProgress('hash')

    expect(progress.txType).toBe(TxType.Swap)
    expect(progress.swapInfo?.status).toBe(SwapStatus.Incomplete)
    expect(progress.swapInfo?.minimumAmountOut.baseAmount.amount().toString()).toBe('100000')
  })

  it('sums completed outbounds and reports the affiliate fee from basis points', async () => {
    const progress = await stageFor(
      observedTx('=:BTC.BTC:bc1qdest:1000:dx:100', [outTx('4000', 'OUT:one'), outTx('5900', 'OUT:two')]),
    ).checkTxProgress('hash')

    expect(progress.swapInfo?.status).toBe(SwapStatus.Complete)
    expect(progress.swapInfo?.actualAmountOut?.baseAmount.amount().toString()).toBe('9900')
    expect(progress.swapInfo?.affliateFee.baseAmount.amount().toString()).toBe('100')
    expect(progress.swapInfo?.minimumAmountOut.baseAmount.amount().toString()).toBe('1000')
    expect(assetToString(progress.swapInfo!.actualAmountOut!.asset)).toBe('BTC.BTC')
  })

  it('scales an ETH outbound from 1e8 to wei', async () => {
    const progress = await stageFor(
      observedTx('=:ETH.ETH:0xdest:100000000:dx:100', [outTx('100000000', 'OUT:one', 'ETH.ETH')]),
    ).checkTxProgress('hash')

    expect(progress.swapInfo?.actualAmountOut?.baseAmount.decimal).toBe(18)
    expect(progress.swapInfo?.actualAmountOut?.baseAmount.amount().toString()).toBe('1000000000000000000')
    expect(progress.swapInfo?.affliateFee.baseAmount.decimal).toBe(18)
    expect(progress.swapInfo?.affliateFee.baseAmount.amount().toString()).toBe('10101010101010101')
  })

  it('marks a refund outbound as refunded', async () => {
    const progress = await stageFor(
      observedTx('=:BTC.BTC:bc1qdest::dx:50', [outTx('100000', 'REFUND:abc')]),
    ).checkTxProgress('hash')

    expect(progress.swapInfo?.status).toBe(SwapStatus.Complete_Refunded)
    expect(progress.swapInfo?.actualAmountOut).toBeUndefined()
    expect(progress.swapInfo?.affliateFee.baseAmount.amount().toString()).toBe('0')
  })

  it('schedules the outbound date from the THORChain height once', async () => {
    const before = Date.now()
    const progress = await stageFor(
      observedTx('=:BTC.BTC:bc1qdest:1000', [], { outbound_height: 1010, finalised_height: 900 }),
    ).checkTxProgress('hash')
    const delta = progress.swapInfo!.expectedOutDate.getTime() - before

    expect(delta).toBeGreaterThan(50_000)
    expect(delta).toBeLessThan(70_000)

    const pastBefore = Date.now()
    const past = await stageFor(
      observedTx('=:BTC.BTC:bc1qdest:1000', [], { outbound_height: 940, finalised_height: 900 }),
    ).checkTxProgress('hash')
    const pastDelta = past.swapInfo!.expectedOutDate.getTime() - pastBefore

    // 60 THORChain blocks at 6 seconds is 360 seconds.
    expect(pastDelta).toBeGreaterThan(-370_000)
    expect(pastDelta).toBeLessThan(-350_000)
  })

  it('reports a zero withdraw when the outbound has not been sent', async () => {
    const progress = await stageFor(
      observedTx('-:BTC.BTC:1000', [], { tx: { status: 'incomplete', tx: observedTx('-:BTC.BTC:1000').tx.tx } }),
    ).checkTxProgress('hash')

    expect(progress.txType).toBe(TxType.WithdrawLP)
    expect(progress.withdrawLpInfo?.status).toBe(WithdrawStatus.Incomplete)
    expect(progress.withdrawLpInfo?.withdrawalAmount.baseAmount.amount().toString()).toBe('0')
  })

  it('reads the withdraw amount from the outbound coin', async () => {
    const inbound = observedTx('-:BTC.BTC:1000').tx
    inbound.status = 'done'
    const progress = await stageFor(observedTx('-:BTC.BTC:1000', [outTx('5000')], { tx: inbound })).checkTxProgress(
      'hash',
    )

    expect(progress.withdrawLpInfo?.status).toBe(WithdrawStatus.Complete)
    expect(progress.withdrawLpInfo?.withdrawalAmount.baseAmount.amount().toString()).toBe('5000')
  })

  it('scales a withdraw outbound from 1e8 to native decimals', async () => {
    const inbound = observedTx('-:ETH.ETH:1000').tx
    inbound.status = 'done'
    const progress = await stageFor(
      observedTx('-:ETH.ETH:1000', [outTx('100000000', 'OUT:one', 'ETH.ETH')], { tx: inbound }),
    ).checkTxProgress('hash')

    expect(progress.withdrawLpInfo?.withdrawalAmount.baseAmount.decimal).toBe(18)
    expect(progress.withdrawLpInfo?.withdrawalAmount.baseAmount.amount().toString()).toBe('1000000000000000000')
  })
})
