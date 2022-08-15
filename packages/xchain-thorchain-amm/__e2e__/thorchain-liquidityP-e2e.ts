import { Network } from '@xchainjs/xchain-client'
import { AssetRuneNative, assetAmount, assetFromString, assetToBase, baseAmount } from '@xchainjs/xchain-util'

import { CryptoAmount } from '../src/crypto-amount'
import { ThorchainAMM } from '../src/thorchain-amm'
import { ThorchainCache } from '../src/thorchain-cache'
import { Midgard } from '../src/utils/midgard'
import { Wallet } from '../src/wallet'
require('dotenv').config()

const midgard = new Midgard(Network.Mainnet)
const mainnetCache = new ThorchainCache(midgard)
const thorchainAmm = new ThorchainAMM(mainnetCache)
const mainnetWallet = new Wallet(process.env.MAINNETPHRASE || 'you forgot to set the phrase', mainnetCache)

const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('bad asset')

// Test User Functions - single and double swap using mock pool data
describe('Thorchain-amm liquidity action end to end Tests', () => {
  it(`Should add BUSD liquidity asymmetrically to BUSD pool `, async () => {
    const LPAction = '+' // add to lP position
    const hash = await thorchainAmm.liquidityPosition(mainnetWallet, {
      asset: new CryptoAmount(assetToBase(assetAmount(1)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(0)), AssetRuneNative),
      action: LPAction,
    })

    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should add RUNE liquidity asymmetrically to BUSD pool `, async () => {
    const LPAction = '+' // add to lP position
    const hash = await thorchainAmm.liquidityPosition(mainnetWallet, {
      asset: new CryptoAmount(assetToBase(assetAmount(0)), BUSD),
      rune: new CryptoAmount(assetToBase(assetAmount(1)), AssetRuneNative),
      action: LPAction,
    })
    console.log(hash)
    expect(hash).toBeTruthy()
  })
  it(`Should return correct lp details`, async () => {
    const busd = new CryptoAmount(assetToBase(assetAmount(1)), BUSD)
    const address = 'bnb150vpa06jrgucqz9ycgun73t0n0rrxq4m69fc22'
    const poolShare = await thorchainAmm.checkLiquidityPosition(address)
    expect(baseAmount(poolShare.assetAdded).amount()).toEqual(busd.baseAmount.amount())
  })
})
