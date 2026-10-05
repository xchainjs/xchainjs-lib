import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { FeeOption } from '@xchainjs/xchain-client'
import { AssetZEC } from '@xchainjs/xchain-zcash'
import { CryptoAmount, assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { ThorchainAction } from '../src/thorchain-action'

function mockWallet() {
  return {
    transfer: jest.fn().mockResolvedValue('txid'),
    getFeeRates: jest.fn(),
    getExplorerTxUrl: jest.fn().mockResolvedValue('https://blockchair.com/zcash/transaction/txid'),
  }
}

describe('ThorchainAction ZEC deposit', () => {
  it('sends ZEC without asking for a sat/vbyte fee rate', async () => {
    const wallet = mockWallet()
    const amount = new CryptoAmount(assetToBase(assetAmount(0.1, 8)), AssetZEC)
    const recipient = 'tex1nyfspsu4vaxnn025gv754njwckzm8dyuv0calv'
    const memo = '=:BTC.BTC:bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'

    await ThorchainAction.makeAction({
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

  it('still requests a fee rate for a UTXO chain that uses one', async () => {
    const fast = baseAmount(5, 8)
    const wallet = mockWallet()
    wallet.getFeeRates.mockResolvedValue({
      [FeeOption.Average]: baseAmount(1, 8),
      [FeeOption.Fast]: fast,
      [FeeOption.Fastest]: baseAmount(10, 8),
    })
    const amount = new CryptoAmount(assetToBase(assetAmount(0.01, 8)), AssetBTC)

    await ThorchainAction.makeAction({
      wallet: wallet as unknown as Wallet,
      assetAmount: amount,
      recipient: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
      memo: '=:ZEC.ZEC:t1XpzA33okQrBQsqdbwZqZLMNao5UNjU3PD',
    })

    expect(wallet.getFeeRates).toHaveBeenCalled()
    expect(wallet.transfer).toHaveBeenCalledWith(expect.objectContaining({ feeRate: fast }))
  })
})
