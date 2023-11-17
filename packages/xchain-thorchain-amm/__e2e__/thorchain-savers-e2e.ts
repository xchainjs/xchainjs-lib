import { AVAXChain, AssetAVAX } from '@xchainjs/xchain-avax'
import { AssetBNB, BNBChain } from '@xchainjs/xchain-binance'
import { AssetATOM, COSMOS_DECIMAL, GAIAChain } from '@xchainjs/xchain-cosmos'
import {
  CryptoAmount,
  SaversPosition,
  SaversWithdraw,
  ThorchainQuery,
  getSaver,
} from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetToBase, baseToAsset } from '@xchainjs/xchain-util'

import { ThorchainAMM } from '../src/thorchain-amm'
import { Wallet } from '../src/wallet'

const thorchainQueryMainnet = new ThorchainQuery()
const mainnetWallet = new Wallet(process.env.MAINNETPHRASE || 'you forgot to set the phrase', thorchainQueryMainnet)
const mainetThorchainAmm = new ThorchainAMM(thorchainQueryMainnet)

// mainnet asset
//const BUSD = assetFromStringEx('BNB.BUSD-BD1')
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
// Test User Functions - single and double swap using mock pool data
describe('Thorchain-amm liquidity action end to end Tests', () => {
  // Check liquidity position
  it(`Should add a savers position`, async () => {
    //const addSaverAmount = new CryptoAmount(assetToBase(assetAmount(0.01, 18)), AssetAVAX)
    try {
      const addSaverAmount = new CryptoAmount(assetToBase(assetAmount(0.1, 8)), AssetBNB)
      const hash = await mainetThorchainAmm.addSaver(mainnetWallet, addSaverAmount)
      console.log(hash)
    } catch (error) {
      console.error(error)
    }
  })

  it(`Should check savers position `, async () => {
    const walletAddress = 'cosmos1guhzq2hmmw78s09tsumpgjmvarwrr4r5j9ws3r'
    const getSaver: getSaver = {
      asset: AssetATOM,
      address: walletAddress,
    }
    const saversPosition = await thorchainQueryMainnet.getSaverPosition(getSaver)
    printSaversPosition(saversPosition)
  })

  it(`Should check balance of an address`, async () => {
    const check = await mainnetWallet.clients[AVAXChain].getBalance('0x5acaed152386de95772468072e1b3fad2f4423f0')
    console.log(baseToAsset(check[0].amount).amount().toNumber())
  })
  it(`Should withdraw savers position`, async () => {
    const walletAddress = await mainnetWallet.clients[BNBChain].getAddressAsync()
    const saversWithdraw: SaversWithdraw = {
      height: 8214446,
      asset: AssetBNB,
      address: walletAddress,
      withdrawBps: 10000,
    }
    const hash = await mainetThorchainAmm.withdrawSaver(mainnetWallet, saversWithdraw)
    console.log(hash)
  })

  it(`Should add AVAX savers position`, async () => {
    try {
      const addSaverAmount = new CryptoAmount(assetToBase(assetAmount(0.01, 18)), AssetAVAX)
      const hash = await mainetThorchainAmm.addSaver(mainnetWallet, addSaverAmount)
      console.log(hash)
    } catch (error) {
      console.error(error)
    }
  })
  it(`Should withdraw AVAX savers position`, async () => {
    const walletAddress = await mainnetWallet.clients[AVAXChain].getAddressAsync()
    const saversWithdraw: SaversWithdraw = {
      asset: AssetAVAX,
      address: walletAddress,
      withdrawBps: 10000,
    }
    try {
      const hash = await mainetThorchainAmm.withdrawSaver(mainnetWallet, saversWithdraw)
      console.log(hash)
    } catch (error) {
      console.error(error)
    }
  })

  it(`Should add ATOM savers position`, async () => {
    try {
      const addSaverAmount = new CryptoAmount(assetToBase(assetAmount(0.1, COSMOS_DECIMAL)), AssetATOM)
      const hash = await mainetThorchainAmm.addSaver(mainnetWallet, addSaverAmount)
      console.log(hash)
    } catch (error) {
      console.error(error)
    }
  })
  it(`Should withdraw ATOM savers position`, async () => {
    const walletAddress = await mainnetWallet.clients[GAIAChain].getAddressAsync()
    const saversWithdraw: SaversWithdraw = {
      asset: AssetATOM,
      address: walletAddress,
      withdrawBps: 10000,
    }
    try {
      const hash = await mainetThorchainAmm.withdrawSaver(mainnetWallet, saversWithdraw)
      console.log(hash)
    } catch (error) {
      console.error(error)
    }
  })
})
