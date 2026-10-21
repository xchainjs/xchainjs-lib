import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { FeeOption } from '@xchainjs/xchain-client'
import { AssetDASH } from '@xchainjs/xchain-dash'
import { CryptoAmount, assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
import { AssetZEC } from '@xchainjs/xchain-zcash'

import { MayachainAction } from '../src/mayachain-action'

function mockWallet() {
  return {
    transfer: jest.fn().mockResolvedValue('txid'),
    getFeeRates: jest.fn(),
    getExplorerTxUrl: jest.fn().mockResolvedValue('https://blockchair.com/zcash/transaction/txid'),
  }
}

describe('MayachainAction ZEC deposit', () => {
  it('sends ZEC without asking for a sat/vbyte fee rate', async () => {
    const wallet = mockWallet()
    const amount = new CryptoAmount(assetToBase(assetAmount(0.1, 8)), AssetZEC)
    const recipient = 'tex1nyfspsu4vaxnn025gv754njwckzm8dyuv0calv'
    const memo = '=:BTC.BTC:bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'

    await MayachainAction.makeAction({
      wallet: wallet as unknown as Wallet,
      assetAmount: amount,
      recipient,
      memo,
    })

    expect(wallet.getFeeRates).not.toHaveBeenCalled()
    expect(wallet.transfer).toHaveBeenCalledWith({
      asset: AssetZEC,
      amount: amount.baseAmount,
      recipient,
      memo,
      walletIndex: undefined,
    })
  })

  it.each([
    ['BTC', AssetBTC, 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'],
    ['DASH', AssetDASH, 'XoA1n5q1v1oA1n5q1v1oA1n5q1v1oA1n5q'],
  ])('requests a fast fee rate for %s', async (_label, asset, recipient) => {
    const fast = baseAmount(5, 8)
    const wallet = mockWallet()
    wallet.getFeeRates.mockResolvedValue({
      [FeeOption.Average]: baseAmount(1, 8),
      [FeeOption.Fast]: fast,
      [FeeOption.Fastest]: baseAmount(10, 8),
    })
    const amount = new CryptoAmount(assetToBase(assetAmount(0.01, 8)), asset)

    await MayachainAction.makeAction({
      wallet: wallet as unknown as Wallet,
      assetAmount: amount,
      recipient,
      memo: '=:ETH.ETH:0x0000000000000000000000000000000000000000',
    })

    expect(wallet.getFeeRates).toHaveBeenCalled()
    expect(wallet.transfer).toHaveBeenCalledWith(expect.objectContaining({ feeRate: fast }))
  })
})
