import { Network } from '@xchainjs/xchain-client'
import { AssetRuneNative, Client as ThorClient } from '@xchainjs/xchain-thorchain'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { AssetCryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { ThorchainAMM } from '../src/thorchain-amm'

describe('ThorchainAmm e2e tests', () => {
  describe('Rune pool', () => {
    let thorchainAmm: ThorchainAMM
    let wallet: Wallet

    beforeAll(() => {
      const mayaChainQuery = new ThorchainQuery()
      const phrase = process.env.MAINNET_PHRASE
      wallet = new Wallet({
        THOR: new ThorClient({ phrase, network: Network.Mainnet }),
      })
      thorchainAmm = new ThorchainAMM(mayaChainQuery, wallet)
    })

    it('Should deposit to Rune pool', async () => {
      const txSubmitted = await thorchainAmm.depositToRunePool({
        amount: new AssetCryptoAmount(assetToBase(assetAmount(10)), AssetRuneNative),
      })

      console.log(txSubmitted)
    })
  })
})
