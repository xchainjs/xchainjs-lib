import { AssetAVAX, Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Network } from '@xchainjs/xchain-client'
import { Client as ThorClient, THORChain } from '@xchainjs/xchain-thorchain'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { AssetCryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
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
  })
})
