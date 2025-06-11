import { AVAX_DECIMAL, AssetAVAX, Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { AssetBSC, Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Network } from '@xchainjs/xchain-client'
import { AssetATOM, COSMOS_DECIMAL, Client as GaiaClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { AssetETH, Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { Client as ThorClient, defaultClientConfig as defaultThorParams } from '@xchainjs/xchain-thorchain'
import { SaversPosition, ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { CryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { ThorchainAMM } from '../src/thorchain-amm'

function printSaversPosition(saver: SaversPosition) {
  const expanded = {
    depositValue: saver.depositValue.formatedAssetString(),
    redeemableValue: saver.redeemableValue.formatedAssetString(),
    lastAddHeight: saver.lastAddHeight,
    percentageGrowth: saver.percentageGrowth,
    ageInDays: saver.ageInDays,
  }
  console.log(expanded)
}

describe('ThorchainAmm e2e tests', () => {
  describe('Savers', () => {
    let wallet: Wallet
    let thorchainAmm: ThorchainAMM

    beforeAll(() => {
      const phrase = process.env.PHRASE_MAINNET
      wallet = new Wallet({
        BTC: new BtcClient({ ...defaultBtcParams, phrase, network: Network.Mainnet }),
        BCH: new BchClient({ ...defaultBchParams, phrase, network: Network.Mainnet }),
        LTC: new LtcClient({ ...defaultLtcParams, phrase, network: Network.Mainnet }),
        DOGE: new DogeClient({ ...defaultDogeParams, phrase, network: Network.Mainnet }),
        ETH: new EthClient({ ...defaultEthParams, phrase, network: Network.Mainnet }),
        AVAX: new AvaxClient({ ...defaultAvaxParams, phrase, network: Network.Mainnet }),
        BSC: new BscClient({ ...defaultBscParams, phrase, network: Network.Mainnet }),
        GAIA: new GaiaClient({ phrase, network: Network.Mainnet }),
        THOR: new ThorClient({ ...defaultThorParams, phrase, network: Network.Mainnet }),
      })
      thorchainAmm = new ThorchainAMM(new ThorchainQuery(), wallet)
    })

    it(`Should check ETH savers position `, async () => {
      const saversPosition = await thorchainAmm.getSaverPosition({
        asset: AssetETH,
        address: '0xf34d2f3c28a24dde83005db8cf51f080bb6dc65f',
      })
      printSaversPosition(saversPosition)
    })

    it(`Should add BNB savers position`, async () => {
      try {
        const hash = await thorchainAmm.addSaver(new CryptoAmount(assetToBase(assetAmount(0.01, 8)), AssetBNB))
        console.log(hash)
      } catch (error) {
        console.error(error)
      }
    })

    it(`Should withdraw BNB savers position`, async () => {
      const hash = await thorchainAmm.withdrawSaver({
        asset: AssetBSC,
        address: await wallet.getAddress(AssetBSC.chain),
        withdrawBps: 10000,
      })
      console.log(hash)
    })

    it(`Should add AVAX savers position`, async () => {
      try {
        const hash = await thorchainAmm.addSaver(
          new CryptoAmount(assetToBase(assetAmount(0.01, AVAX_DECIMAL)), AssetAVAX),
        )
        console.log(hash)
      } catch (error) {
        console.error(error)
      }
    })

    it(`Should withdraw AVAX savers position`, async () => {
      try {
        const hash = await thorchainAmm.withdrawSaver({
          asset: AssetAVAX,
          address: await wallet.getAddress(AssetAVAX.chain),
          withdrawBps: 10000,
        })
        console.log(hash)
      } catch (error) {
        console.error(error)
      }
    })

    it(`Should add ATOM savers position`, async () => {
      try {
        const hash = await thorchainAmm.addSaver(
          new CryptoAmount(assetToBase(assetAmount(0.1, COSMOS_DECIMAL)), AssetATOM),
        )
        console.log(hash)
      } catch (error) {
        console.error(error)
      }
    })

    it(`Should withdraw ATOM savers position`, async () => {
      try {
        const hash = await thorchainAmm.withdrawSaver({
          asset: AssetATOM,
          address: await wallet.getAddress(AssetATOM.chain),
          withdrawBps: 10000,
        })
        console.log(hash)
      } catch (error) {
        console.error(error)
      }
    })
  })
})
