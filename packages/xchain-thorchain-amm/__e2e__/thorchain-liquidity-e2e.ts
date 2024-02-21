import { Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { BNBChain, Client as BnbClient } from '@xchainjs/xchain-binance'
import { AssetBTC, BTCChain, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Network } from '@xchainjs/xchain-client'
import { AssetATOM, COSMOS_DECIMAL, Client as GaiaClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import {
  AssetETH,
  Client as EthClient,
  ETHChain,
  ETH_GAS_ASSET_DECIMAL,
  defaultEthParams,
} from '@xchainjs/xchain-ethereum'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import {
  AssetRuneNative,
  Client as ThorClient,
  THORChain,
  defaultClientConfig as defaultThorParams,
} from '@xchainjs/xchain-thorchain'
import {
  AddliquidityPosition,
  LiquidityPosition,
  ThorchainQuery,
  WithdrawLiquidityPosition,
} from '@xchainjs/xchain-thorchain-query'
import { CryptoAmount, assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { ThorchainAMM } from '../src/thorchain-amm'

// mainnet asset
const BUSD = assetFromStringEx('BNB.BUSD-BD1')

function printLiquidityPosition(liquidityPosition: LiquidityPosition) {
  const expanded = {
    assetPool: liquidityPosition.position.asset,
    assetAmount: liquidityPosition.position.asset_deposit_value,
    runeAmount: liquidityPosition.position.rune_deposit_value,
    impermanentLossProtection: {
      ILProtection: liquidityPosition.impermanentLossProtection.ILProtection.formatedAssetString(),
      totalDays: liquidityPosition.impermanentLossProtection.totalDays,
    },
  }
  console.log(expanded)
}

describe('ThorchainAmm e2e tests', () => {
  describe('Liquidity', () => {
    let wallet: Wallet
    let thorchainQuery: ThorchainQuery
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
        BNB: new BnbClient({ phrase, network: Network.Mainnet }),
        THOR: new ThorClient({ ...defaultThorParams, phrase, network: Network.Mainnet }),
      })
      thorchainQuery = new ThorchainQuery()
      thorchainAmm = new ThorchainAMM(thorchainQuery, wallet)
    })

    // Check liquidity position
    it(`Should check liquidity position`, async () => {
      const lpPosition = await thorchainQuery.checkLiquidityPosition(BUSD, 'bnb1s6zsj373mpufaj4vvmpp47runlr2mk55htzlyy')
      printLiquidityPosition(lpPosition)
    })

    // Add liquidity positions
    it(`Should add BUSD liquidity asymmetrically to BUSD pool`, async () => {
      const hash = await thorchainAmm.addLiquidityPosition({
        asset: new CryptoAmount(assetToBase(assetAmount(2)), BUSD),
        rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      })

      console.log(hash)
      expect(hash).toBeTruthy()
    })

    // Add liquidity positions
    it(`Should add Atom liquidity asymmetrically to Atom pool`, async () => {
      const hash = await thorchainAmm.addLiquidityPosition({
        asset: new CryptoAmount(assetToBase(assetAmount(0.1, COSMOS_DECIMAL)), AssetATOM),
        rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      })

      console.log(hash)
      expect(hash).toBeTruthy()
    })

    it(`Should add ETH liquidity asymmetrically to ETH pool`, async () => {
      const addLPparams: AddliquidityPosition = {
        asset: new CryptoAmount(assetToBase(assetAmount(1.5, ETH_GAS_ASSET_DECIMAL)), AssetETH),
        rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      }
      const hash = await thorchainAmm.addLiquidityPosition(addLPparams)

      console.log(hash)
      expect(hash).toBeTruthy()
    })

    it(`Should add BTC liquidity asymmetrically to BTC pool`, async () => {
      const addLPparams: AddliquidityPosition = {
        asset: new CryptoAmount(assetToBase(assetAmount(0.009)), AssetBTC),
        rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      }
      const hash = await thorchainAmm.addLiquidityPosition(addLPparams)

      console.log(hash)
      expect(hash).toBeTruthy()
    })

    it(`Should add RUNE liquidity asymmetrically to BUSD pool`, async () => {
      const addLPparams: AddliquidityPosition = {
        asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSD),
        rune: new CryptoAmount(assetToBase(assetAmount(1.19997)), AssetRuneNative),
      }
      const hash = await thorchainAmm.addLiquidityPosition(addLPparams)
      console.log(hash)
      expect(hash).toBeTruthy()
    })

    it(`Should add BUSD & RUNE liquidity symmetrically to BUSD pool`, async () => {
      const poolRatio = await thorchainQuery.getPoolRatios(BUSD)
      // get ratios for pool and retrieve rune amount
      const busdtAmount = poolRatio.assetToRune.times(3)
      const runeAmount = poolRatio.runeToAsset.times(busdtAmount)
      const hash = await thorchainAmm.addLiquidityPosition({
        asset: new CryptoAmount(assetToBase(assetAmount(busdtAmount)), BUSD),
        rune: new CryptoAmount(assetToBase(assetAmount(runeAmount)), AssetRuneNative),
      })

      console.log(hash)
      expect(hash).toBeTruthy()
    })

    // Remove Liquidity Positions
    it(`Should remove BUSD only liquidity asymmetrically from the BUSD pool`, async () => {
      const percentage = 100 // gets converted to basis points later
      const removeLp: WithdrawLiquidityPosition = {
        percentage: percentage,
        asset: BUSD,
        assetAddress: await wallet.getAddress(BNBChain),
      }
      const hash = await thorchainAmm.withdrawLiquidityPosition(removeLp)
      console.log(hash)
      expect(hash).toBeTruthy()
    })

    it(`Should remove Rune liquidity asymetrically from the BUSD pool`, async () => {
      const percentage = 100 // gets converted to basis points later
      const removeLp: WithdrawLiquidityPosition = {
        percentage: percentage,
        asset: BUSD,
        runeAddress: await wallet.getAddress(THORChain),
      }
      const hash = await thorchainAmm.withdrawLiquidityPosition(removeLp)
      console.log(hash)
      expect(hash).toBeTruthy()
    })

    it(`Should remove BUSDT & RUNE symmetrically from symmetrical lp`, async () => {
      const percentage = 100 // gets converted to basis points later
      const removeLp: WithdrawLiquidityPosition = {
        percentage: percentage,
        asset: BUSD,
        assetAddress: await wallet.getAddress(BUSD.chain),
        runeAddress: await wallet.getAddress(THORChain),
      }
      const hash = await thorchainAmm.withdrawLiquidityPosition(removeLp)
      console.log(hash)
      expect(hash).toBeTruthy()
    })

    it(`Should remove ETH liquidity asymetrically from the ETH pool`, async () => {
      const percentage = 100 // gets converted to basis points later
      const removeLp: WithdrawLiquidityPosition = {
        percentage: percentage,
        asset: AssetETH,
        assetAddress: await wallet.getAddress(ETHChain),
      }
      const hash = await thorchainAmm.withdrawLiquidityPosition(removeLp)
      console.log(hash)
      expect(hash).toBeTruthy()
    })

    it(`Should remove BTC liquidity asymetrically from the BTC pool`, async () => {
      const percentage = 100 // gets converted to basis points later
      const removeLp: WithdrawLiquidityPosition = {
        percentage: percentage,
        asset: AssetBTC,
        assetAddress: await wallet.getAddress(BTCChain),
      }
      const hash = await thorchainAmm.withdrawLiquidityPosition(removeLp)
      console.log(hash)
      expect(hash).toBeTruthy()
    })
  })
})
