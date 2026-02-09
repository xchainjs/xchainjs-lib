import { DASHChain, Client as DashClient, defaultDashParams } from '@xchainjs/xchain-dash'
import { ETHChain, AssetETH, Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Network } from '@xchainjs/xchain-client'
import { AssetCacao, Client as MayaClient, MAYAChain } from '@xchainjs/xchain-mayachain'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { AssetCryptoAmount, AssetType, TradeCryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { MayachainAMM } from '../src'

describe('MayachainAMM e2e tests for Trade Accounts', () => {
  describe('Trade assets', () => {
    let mayaAMM: MayachainAMM
    let wallet: Wallet

    beforeAll(() => {
      const phrase = process.env.MAINNET_PHRASE
      if (!phrase) {
        throw new Error('MAINNET_PHRASE environment variable is required for e2e tests')
      }

      const mayachainQuery = new MayachainQuery()
      wallet = new Wallet({
        ETH: new EthClient({
          ...defaultEthParams,
          phrase,
          network: Network.Mainnet,
        }),
        MAYA: new MayaClient({ phrase, network: Network.Mainnet }),
        DASH: new DashClient({
          ...defaultDashParams,
          phrase,
          network: Network.Mainnet,
        }),
      })
      mayaAMM = new MayachainAMM(mayachainQuery, wallet)
    })

    it('Should estimate add to trade account', async () => {
      const quote = await mayaAMM.estimateAddToTradeAccount({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(0.1, 18)), AssetETH),
        address: await wallet.getAddress(MAYAChain),
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

      expect(quote.allowed).toBeTruthy()
      expect(quote.memo).toContain('TRADE+:')
      expect(quote.toAddress).toBeTruthy()
      expect(quote.errors.length).toBe(0)
    })

    it('Should add to trade account', async () => {
      const txSubmitted = await mayaAMM.addToTradeAccount({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(0.1, 18)), AssetETH),
        address: await wallet.getAddress(MAYAChain),
      })

      console.log(txSubmitted)
      expect(txSubmitted.hash).toBeTruthy()
      expect(txSubmitted.url).toBeTruthy()
    })

    it('Should estimate withdraw from trade account', async () => {
      const quote = await mayaAMM.estimateWithdrawFromTradeAccount({
        amount: new TradeCryptoAmount(assetToBase(assetAmount(0.05, 18)), {
          chain: ETHChain,
          symbol: 'ETH',
          ticker: 'ETH',
          type: AssetType.TRADE,
        }),
        address: await wallet.getAddress(ETHChain),
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

      expect(quote.allowed).toBeTruthy()
      expect(quote.memo).toContain('TRADE-:')
      expect(quote.errors.length).toBe(0)
    })

    it('Should withdraw from trade account', async () => {
      const txSubmitted = await mayaAMM.withdrawFromTradeAccount({
        amount: new TradeCryptoAmount(assetToBase(assetAmount(0.05, 18)), {
          chain: ETHChain,
          symbol: 'ETH',
          ticker: 'ETH',
          type: AssetType.TRADE,
        }),
        address: await wallet.getAddress(ETHChain),
      })

      console.log(txSubmitted)
      expect(txSubmitted.hash).toBeTruthy()
      expect(txSubmitted.url).toBeTruthy()
    })

    it('Should swap trade assets', async () => {
      const txSubmitted = await mayaAMM.doSwap({
        fromAsset: {
          chain: ETHChain,
          symbol: 'ETH',
          ticker: 'ETH',
          type: AssetType.TRADE,
        },
        amount: new TradeCryptoAmount(assetToBase(assetAmount('0.01')), {
          chain: ETHChain,
          symbol: 'ETH',
          ticker: 'ETH',
          type: AssetType.TRADE,
        }),
        destinationAddress: await wallet.getAddress(MAYAChain, 0),
        destinationAsset: {
          chain: DASHChain,
          symbol: 'DASH',
          ticker: 'DASH',
          type: AssetType.TRADE,
        },
      })

      console.log(txSubmitted)
      expect(txSubmitted.hash).toBeTruthy()
      expect(txSubmitted.url).toBeTruthy()
    })

    it('Should swap CACAO to trade asset', async () => {
      const txSubmitted = await mayaAMM.doSwap({
        fromAsset: AssetCacao,
        amount: new AssetCryptoAmount(assetToBase(assetAmount('10')), AssetCacao),
        destinationAddress: await wallet.getAddress(MAYAChain, 0),
        destinationAsset: {
          chain: DASHChain,
          symbol: 'DASH',
          ticker: 'DASH',
          type: AssetType.TRADE,
        },
      })

      console.log(txSubmitted)
      expect(txSubmitted.hash).toBeTruthy()
      expect(txSubmitted.url).toBeTruthy()
    })
  })
})
