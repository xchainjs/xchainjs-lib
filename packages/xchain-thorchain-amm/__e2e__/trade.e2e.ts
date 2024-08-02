import { AVAXChain, AssetAVAX, Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { BTCChain } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as ThorClient, THORChain } from '@xchainjs/xchain-thorchain'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { AssetCryptoAmount, AssetType, TradeCryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { ThorchainAMM } from '../src/thorchain-amm'

describe('ThorchainAmm e2e tests', () => {
  describe('Trade assets', () => {
    let thorchainAmm: ThorchainAMM
    let wallet: Wallet

    beforeAll(() => {
      const mayaChainQuery = new ThorchainQuery()
      const phrase = process.env.MAINNET_PHRASE
      wallet = new Wallet({
        AVAX: new AvaxClient({ ...defaultAvaxParams, phrase, network: Network.Mainnet }),
        THOR: new ThorClient({ phrase, network: Network.Mainnet }),
      })
      thorchainAmm = new ThorchainAMM(mayaChainQuery, wallet)
    })

    it('Should estimate add to trade amount', async () => {
      const quote = await thorchainAmm.estimateAddToTradeAccount({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(0.5, 18)), AssetAVAX),
        address: await wallet.getAddress(THORChain),
      })

      console.log({
        toAddress: quote.toAddress,
        memo: quote.memo,
        allowed: quote.allowed,
        errors: quote.errors,
        value: {
          amount: quote.value.assetAmount.amount().toString(),
          asset: quote.value.asset,
        },
      })
    })

    it('Should add to trade amount', async () => {
      const txSubmitted = await thorchainAmm.addToTradeAccount({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(1, 18)), AssetAVAX),
        address: await wallet.getAddress(THORChain),
      })

      console.log(txSubmitted)
    })

    it('Should estimate withdraw from trade amount', async () => {
      const quote = await thorchainAmm.estimateWithdrawFromTradeAccount({
        amount: new TradeCryptoAmount(assetToBase(assetAmount(0.25, 8)), {
          chain: AVAXChain,
          symbol: 'AVAX',
          ticker: 'AVAX',
          type: AssetType.TRADE,
        }),
        address: await wallet.getAddress(AVAXChain),
      })

      console.log({
        memo: quote.memo,
        allowed: quote.allowed,
        errors: quote.errors,
        value: {
          amount: quote.value.assetAmount.amount().toString(),
          asset: quote.value.asset,
        },
      })
    })

    it('Should withdraw from trade amount', async () => {
      const txSubmitted = await thorchainAmm.withdrawFromTradeAccount({
        amount: new TradeCryptoAmount(assetToBase(assetAmount(0.25, 8)), {
          chain: AVAXChain,
          symbol: 'AVAX',
          ticker: 'AVAX',
          type: AssetType.TRADE,
        }),
        address: await wallet.getAddress(AVAXChain),
      })

      console.log(txSubmitted)
    })

    it('Should swap trade assets', async () => {
      const txSubmitted = await thorchainAmm.doSwap({
        fromAsset: {
          chain: AVAXChain,
          symbol: 'AVAX',
          ticker: 'AVAX',
          type: AssetType.TRADE,
        },
        amount: new TradeCryptoAmount(assetToBase(assetAmount('10')), {
          chain: AVAXChain,
          symbol: 'AVAX',
          ticker: 'AVAX',
          type: AssetType.TRADE,
        }),
        destinationAddress: await wallet.getAddress(THORChain),
        destinationAsset: {
          chain: BTCChain,
          symbol: 'BTC',
          ticker: 'BTC',
          type: AssetType.TRADE,
        },
      })

      console.log(txSubmitted)
    })
  })
})
