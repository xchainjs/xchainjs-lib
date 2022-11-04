import fs = require('fs')

import { Network } from '@xchainjs/xchain-client'
import { decryptFromKeystore } from '@xchainjs/xchain-crypto'
import { ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import {
  AddliquidityPosition,
  CryptoAmount,
  EstimateSwapParams,
  // AddliquidityPosition,
  // CryptoAmount,
  LiquidityPool,
  Midgard,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  //WithdrawLiquidityPosition,
} from '@xchainjs/xchain-thorchain-query'
import { Asset, AssetRuneNative, assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'
import * as weighted from 'weighted'

import { TxDetail } from './types'

// import { JammerAction } from './types'
// const BUSD = assetFromStringEx('BNB.BUSD-BD1')
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class TxJammer {
  private pools: Record<string, LiquidityPool> | undefined
  private weightedActions: Record<string, number> = {}
  private weightedSwap: Record<string, number> = {}
  private weightedAddLP: Record<string, number> = {}
  private weightedWithdrawLP: Record<string, number> = {}
  private weightedTransfer: Record<string, number> = {}
  private txRecords: TxDetail[] = []
  private thorchainCache: ThorchainCache
  private thorchainQuery: ThorchainQuery
  private thorchainAmm: ThorchainAMM

  private estimateOnly: boolean
  private minAmount: number
  private maxAmount: number
  private durationSeconds: number
  private pauseTimeSeconds: number

  private keystore1FilePath: string
  private keystore1Password: string
  private keystore2FilePath: string
  private keystore2Password: string
  private wallet1: Wallet | undefined
  private wallet2: Wallet | undefined

  constructor(
    estimateOnly: boolean,
    minAmount: number,
    maxAmount: number,
    durationSeconds: number,
    pauseTimeSeconds: number,
    keystore1FilePath: string,
    keystore1Password: string,
    keystore2FilePath: string,
    keystore2Password: string,
  ) {
    this.estimateOnly = estimateOnly
    this.minAmount = minAmount
    this.maxAmount = maxAmount
    this.durationSeconds = durationSeconds
    this.pauseTimeSeconds = pauseTimeSeconds

    this.keystore1FilePath = keystore1FilePath
    this.keystore1Password = keystore1Password
    this.keystore2FilePath = keystore2FilePath
    this.keystore2Password = keystore2Password

    this.thorchainCache = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
    this.thorchainQuery = new ThorchainQuery(this.thorchainCache)
    this.thorchainAmm = new ThorchainAMM(this.thorchainQuery)
  }

  private async setup() {
    const keystore1 = JSON.parse(fs.readFileSync(this.keystore1FilePath, 'utf8'))
    const keystore2 = JSON.parse(fs.readFileSync(this.keystore2FilePath, 'utf8'))
    const phrase1 = await decryptFromKeystore(keystore1, this.keystore1Password)
    const phrase2 = await decryptFromKeystore(keystore2, this.keystore2Password)

    this.wallet1 = new Wallet(phrase1, this.thorchainQuery)
    this.wallet2 = new Wallet(phrase2, this.thorchainQuery)

    this.pools = await this.thorchainCache.getPools()
    this.setupWeightedActions()
    await this.setupWeightedChoices()
  }
  private getAvailablePoolAssets(): string[] {
    const availablePools = Object.values(this.pools).filter((i) => i.isAvailable())
    const assets = availablePools.map((i) => i.assetString)
    return assets
  }
  private setupWeightedActions() {
    this.weightedActions = {
      swap: 100,
      addLp: 100,
      withdrawLp: 100,
      transfer: 100,
    }
  }

  private async setupWeightedChoices() {
    const assets = await this.getAvailablePoolAssets()
    for (const asset of assets) {
      this.weightedSwap[asset] = 100
      this.weightedTransfer[asset] = 100
      this.weightedWithdrawLP[asset] = 100
      this.weightedAddLP[asset] = 100
    }
  }

  async start() {
    await this.setup()
    const startTime = new Date()
    let currentTime = new Date()
    while (currentTime.getTime() < startTime.getTime() + this.durationSeconds * 1000) {
      currentTime = new Date()
      // select a random action
      const action = weighted.select(this.weightedActions) as string
      console.log(`executing ${action}..`)
      this.executeAction(action)
      await delay(this.pauseTimeSeconds * 1000)
    }
    console.log('Complete')
    console.log(JSON.stringify(this.txRecords, null, 2))
  }
  private async executeAction(action: string) {
    switch (action) {
      case 'swap':
        await this.executeSwap()
        break
      case 'addLp':
        await this.executeAddLp()
        break
      case 'withdrawLp':
        // await this.executeSwap()
        break
      case 'transfer':
        // await this.executeSwap()
        break
      default:
        break
    }
  }
  private async executeSwap() {
    const [senderWallet, receiverWallet] = this.getRandomWallets()
    const [sourceAsset, destinationAsset] = this.getRandomSourceAndDestAssets()
    const swapParams: EstimateSwapParams = {
      input: await this.createCryptoAmount(sourceAsset),
      destinationAsset,
      destinationAddress: receiverWallet.clients[destinationAsset.chain].getAddress(),
    }
    let result: TxDetail
    try {
      const estimate = await this.thorchainQuery.estimateSwap(swapParams)
      if (estimate.txEstimate.canSwap && !this.estimateOnly) {
        result.details = swapParams
        const txhash = await this.thorchainAmm.doSwap(senderWallet, swapParams)
        result.date = new Date()
        result.result = txhash
      }
    } catch (e) {
      result.result = e.message
      throw Error(`Error in swapping to rune ${e}`)
    }
  }
  private async createCryptoAmount(asset: Asset): Promise<CryptoAmount> {
    const amount = this.getRandom(this.maxAmount, this.minAmount)
    const usdPool = await this.thorchainCache.getDeepestUSDPool()
    const usdAmount = new CryptoAmount(assetToBase(assetAmount(amount)), usdPool.asset)
    return await this.thorchainQuery.convert(usdAmount, asset)
  }
  private getRandomWallets(): [Wallet, Wallet] {
    const rand = this.getRandom(1, 0)
    return rand == 0 ? [this.wallet1, this.wallet2] : [this.wallet2, this.wallet1]
  }
  private getRandomSourceAndDestAssets(): [Asset, Asset] {
    const sourceAssetString = weighted.select(this.weightedSwap) as string
    let destinationAssetString = weighted.select(this.weightedSwap) as string
    while (sourceAssetString === destinationAssetString) {
      //can't have same source and dest
      destinationAssetString = weighted.select(this.weightedSwap)
    }
    const sourceAsset = assetFromStringEx(sourceAssetString)
    const destinationAsset = assetFromStringEx(destinationAssetString)
    sourceAsset.synth = this.doSynthSwap()
    destinationAsset.synth = this.doSynthSwap()
    return [sourceAsset, destinationAsset]
  }
  private doSynthSwap(): boolean {
    // 1/4 of the time do a synth swap
    const rand = this.getRandom(3, 0)
    return rand == 0
  }
  private getRandom(max: number, min: number) {
    const randomNumber = Math.random() * (max - min) + min
    return randomNumber
  }
  private recordActionAndResult() {}

  /**
   * Executes add lp for a random wallet, random amount, and random asset
   */
  private async executeAddLp() {
    const [senderWallet] = this.getRandomWallets()
    const [sourceAsset, destinationAsset] = this.getRandomSourceAndDestAssets()

    const amount = await this.createCryptoAmount(sourceAsset)
    const rune = await this.thorchainQuery.convert(amount, AssetRuneNative)
    const destinationAmount = await this.thorchainQuery.convert(amount, destinationAsset)

    const inboundDetails = await this.thorchainQuery.thorchainCache.getPoolForAsset(destinationAsset)
    const decimals = inboundDetails.pool.nativeDecimal
    const randomNumber = this.getRandom(1, 10)
    // if it is even its a symmetrical add if its odd the its an asymetrical add
    const isEven = randomNumber % 2 === 0
    const addlpSym: AddliquidityPosition = {
      asset: destinationAmount,
      rune: rune,
    }
    const addlpAsym: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0, +decimals)), destinationAsset), // leave as empty. for asym,
      rune: rune,
    }

    let result: TxDetail
    try {
      const estimateSym = await this.thorchainQuery.estimateAddLP(addlpSym)
      if (isEven) {
        if (estimateSym.canAdd && !this.estimateOnly) {
          result.details = addlpSym
          const txhash = await this.thorchainAmm.addLiquidityPosition(senderWallet, addlpSym)
          result.result = txhash[1]
        }
      } else {
        const estimate = await this.thorchainQuery.estimateAddLP(addlpAsym)
        if (estimate.canAdd && !this.estimateOnly) {
          result.details = addlpAsym
          const txhash = await this.thorchainAmm.addLiquidityPosition(senderWallet, addlpAsym)
          result.result = txhash[1]
        }
      }
    } catch (e) {
      throw Error(`Error in swapping from synth ${e}`)
    }
  }
}

// // const withdrawLp = async (
// //   amount: CryptoAmount,
// //   wallet1: Wallet,
// //   wallet2: Wallet,
// //   tcAmm: ThorchainAMM,
// //   tcQuery: ThorchainQuery,
// // ) => {
// //   //const runeAddress = await wallet1.clients[Chain.THORChain].getAddress()
// //   // const checkLp = await tcQuery.checkLiquidityPosition( assetList[], runeAddress) return lp
// //   // const withdrawLParams: WithdrawLiquidityPosition = {
// //   //   asset:
// //   // }
// //   // try {
// //   //   const estimate = await tcQuery.estimateWithdrawLP(withdrawLParams)
// //   //   if (estimate) {
// //   //     const txhash = await tcAmm.withdrawLiquidityPosition(wallet1, withdrawLParams)
// //   //     txCount += 1
// //   //     const txDetails: TxDetail = {
// //   //       txCount: txCount,
// //   //       hash: txhash[1],
// //   //       amount: `${estimate.assetAmount.formatedAssetString()}, ${estimate.runeAmount.formatedAssetString()}`,
// //   //     }
// //   //     txRecord.push(txDetails)
// //   //   }
// //   // } catch (e) {
// //   //   throw Error(`Error in swapping from synth ${e}`)
// //   // }
// // }

// // const dexAggSwapIn = async () => {}
// // const dexAggSwapOut = async () => {}
// // const addSavers = async () => {}
// // const withdrawSavers = async () => {}

// // Rebalance wallets to be of equal value..
// // const reBalanceWallets = async (tcAmm: ThorchainAMM, tcQuery: ThorchainQuery, wallet1: Wallet, wallet2: Wallet) => {
// //   const
// // }

// /**
//  * tx : {hash: hash,
//  * memo: memo,
//  * vault: vault,
//  * amount: amount,}
//  * @param txDetails - details to write to the file
//  */
// const writeTxsToFile = async () => {
//   fs.writeFileSync(`./txJammer${Date}.json`, JSON.stringify(txRecord, null, 4), 'utf8')
// }

// /**
//  *
//  * @param tcAmm - AMM instance
//  * @param tcQuery - Query instance
//  * @param wallet1 - wallet 1
//  * @param wallet2 - wallet 2
//  */
// const startTxJammer = async (tcAmm: ThorchainAMM, tcQuery: ThorchainQuery, wallet1: Wallet, wallet2: Wallet) => {
//   const txRandomCeiling = await getRandomArbitrary(txMax, txMin)
//   console.log(`TX Jammer Time`)
//   // run while transactions are less than max transactions
//   while (txCount < txRandomCeiling) {
//     // select random Action
//     // execute action
//     // wait random secs between 1 sec - 10 sec
//     // update

//     // convert 2 usdt to random asset.
//     const amount = await getRandomAssetCryptoAmount(tcQuery, minTxAmount)
//     await swapToRune(amount, wallet1, wallet2, tcAmm, tcQuery)
//     // delay program by 2 seconds
//     await delay(2000)
//     await swapToOtherRandomL1(amount, wallet1, wallet2, tcAmm, tcQuery)
//     // delay program by 2 seconds
//     await delay(2000)
//     await swapToSynth(amount, wallet1, wallet2, tcAmm, tcQuery)
//     // delay program by 2 seconds
//     await delay(2000)
//     await swapFromSynth(amount, wallet1, wallet2, tcAmm, tcQuery)
//     // delay program by 2 seconds
//     await delay(2000)
//     await addLiquidity(amount, wallet1, wallet2, tcAmm, tcQuery)
//     // delay program by 2 seconds
//     await delay(2000)
//     //await withdrawLp(amount, wallet1, wallet2, tcAmm, tcQuery)
//     console.log(txRecord)
//   }
//   await writeTxsToFile()
//   // shutdown
//   // withdraw all LP positions?
//   //
// }

// /**
//  * ToDo Make wallet random. or self balancing, so it doesn't matter which wallet makes the transaction
//  */
// const main = async () => {
//   const phrase1 = await decryptFromKeystore(keystore1, password)
//   const phrase2 = await decryptFromKeystore(keystore2, password)
//   const thorchainCache = new ThorchainCache(new Midgard(Network.Stagenet), new Thornode(Network.Stagenet))
//   const thorchainQuery = new ThorchainQuery(thorchainCache)
//   const thorchainAmm = new ThorchainAMM(thorchainQuery)
//   const wallet1 = new Wallet(phrase1, thorchainQuery)
//   const wallet2 = new Wallet(phrase2, thorchainQuery)
//   await startTxJammer(thorchainAmm, thorchainQuery, wallet1, wallet2)
// }

// main()
//   .then(() => process.exit(0))
//   .catch((err) => console.error(err))
