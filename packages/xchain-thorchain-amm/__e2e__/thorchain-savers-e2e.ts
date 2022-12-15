import {
  CryptoAmount,
  SaversPosition,
  SaversWithdraw,
  ThorchainQuery,
  getSaver,
} from '@xchainjs/xchain-thorchain-query'
import { AssetAVAX, AssetBNB, assetAmount, assetToBase, baseToAsset } from '@xchainjs/xchain-util'

import { Wallet } from '../src/Wallet'
import { ThorchainAMM } from '../src/thorchain-amm'

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
    const addSaverAmount = new CryptoAmount(assetToBase(assetAmount(0.1, 8)), AssetBNB)
    const hash = await mainetThorchainAmm.addSaver(mainnetWallet, addSaverAmount)
    console.log(hash)
  })

  it(`Should check savers position `, async () => {
    const walletAddress = await mainnetWallet.clients[AssetBNB.chain].getAddress()
    const getSaver: getSaver = {
      asset: AssetBNB,
      address: walletAddress,
    }
    const saversPosition = await thorchainQueryMainnet.getSaverPosition(getSaver)
    printSaversPosition(saversPosition)
  })

  it(`Should check balance of an address`, async () => {
    const check = await mainnetWallet.clients[AssetAVAX.chain].getBalance('0x5acaed152386de95772468072e1b3fad2f4423f0')
    console.log(baseToAsset(check[0].amount).amount().toNumber())
  })
  it(`Should withdraw savers position`, async () => {
    const walletAddress = await mainnetWallet.clients[AssetBNB.chain].getAddress()
    const saversWithdraw: SaversWithdraw = {
      height: 8214446,
      asset: AssetBNB,
      address: walletAddress,
      withdrawBps: 10000,
    }
    const hash = await mainetThorchainAmm.withdrawSaver(mainnetWallet, saversWithdraw)
    console.log(hash)
  })
})
