import fs = require('fs')

import { Network, TxParams } from '@xchainjs/xchain-client'
import { decryptFromKeystore } from '@xchainjs/xchain-crypto'
import { ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import {
  AddliquidityPosition,
  CryptoAmount,
  EstimateSwapParams,
  LiquidityPool,
  Midgard,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  WithdrawLiquidityPosition,
} from '@xchainjs/xchain-thorchain-query'
import {
  Asset,
  AssetRuneNative,
  Chain,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
} from '@xchainjs/xchain-util'
import * as weighted from 'weighted'

import { ActionConfig, JammerAction, SwapConfig, TxDetail } from './types'

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
  private swapConfig: SwapConfig[]
  private actionConfig: ActionConfig[]

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
    swapConfig: SwapConfig[],
    actionConfig: ActionConfig[],
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
    this.swapConfig = swapConfig
    this.actionConfig = actionConfig

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
      swap: this.actionConfig.find((i) => i.action === JammerAction.swap)
        ? this.actionConfig.find((i) => i.action === JammerAction.swap).weight
        : 100,
      addLp: this.actionConfig.find((i) => i.action === JammerAction.addLp)
        ? this.actionConfig.find((i) => i.action === JammerAction.addLp).weight
        : 100,
      withdrawLp: this.actionConfig.find((i) => i.action === JammerAction.withdrawLp)
        ? this.actionConfig.find((i) => i.action === JammerAction.withdrawLp).weight
        : 100,
      transfer: this.actionConfig.find((i) => i.action === JammerAction.transfer)
        ? this.actionConfig.find((i) => i.action === JammerAction.transfer).weight
        : 100,
    }
  }

  private async setupWeightedChoices() {
    const assets = await this.getAvailablePoolAssets()
    for (const asset of assets) {
      let weight = 100
      if (asset.includes('ETH.')) {
        // we want to limit the number to "expensive" (in terms of gas) eth txs
        weight = 10
      }
      this.weightedSwap[asset] = weight
      this.weightedTransfer[asset] = weight
      this.weightedWithdrawLP[asset] = weight
      this.weightedAddLP[asset] = weight
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
        await this.executeWithdraw()
        break
      case 'transfer':
        await this.executeTransfer()
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
    const result: TxDetail = { action: 'swap' }
    try {
      const estimate = await this.thorchainQuery.estimateSwap(swapParams)
      result.date = new Date()
      result.details = `swapping ${swapParams.input.formatedAssetString()} to ${assetToString(destinationAsset)} `
      if (estimate.txEstimate.canSwap && !this.estimateOnly) {
        const txhash = await this.thorchainAmm.doSwap(senderWallet, swapParams)
        result.result = txhash
      } else {
        result.result = 'not submitted, estimate only mode'
      }
    } catch (e) {
      result.result = e.message
    }
    this.txRecords.push(result)
  }

  private async executeTransfer() {
    const [senderWallet, receiverWallet] = this.getRandomWallets()
    const [sourceAsset] = this.getRandomSourceAndDestAssets()

    const result: TxDetail = { action: 'transfer' }
    try {
      const amount = await this.createCryptoAmount(sourceAsset)
      const transferParams: TxParams = {
        asset: amount.asset,
        amount: amount.baseAmount,
        recipient: receiverWallet.clients[sourceAsset.chain].getAddress(),
      }
      result.date = new Date()
      result.details = `transfering ${amount.formatedAssetString()} to ${transferParams.recipient} `
      if (!this.estimateOnly) {
        result.date = new Date()
        result.details = transferParams
        const txhash = await senderWallet.clients[sourceAsset.chain].transfer(transferParams)
        result.result = txhash
      } else {
        result.result = 'not submitted, estimate only mode'
      }
    } catch (e) {
      result.result = e.message
    }
    this.txRecords.push(result)
  }
  private async createCryptoAmount(asset: Asset): Promise<CryptoAmount> {
    const amount = this.getRandomFloat(this.minAmount, this.maxAmount)
    const usdPool = await this.thorchainCache.getDeepestUSDPool()
    const usdAmount = new CryptoAmount(assetToBase(assetAmount(amount)), usdPool.asset)
    return await this.thorchainQuery.convert(usdAmount, asset)
  }
  private getRandomWallets(): [Wallet, Wallet] {
    const rand = this.getRandomInt(0, 1)
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
    return [assetFromStringEx(assetToString(sourceAsset)), assetFromStringEx(assetToString(destinationAsset))]
  }

  private doSynthSwap(): boolean {
    // 1/4 of the time do a synth swap,
    // this should lead to 1/2 swaps being native L1s on one side or another
    const rand = this.getRandomInt(0, 3)
    // console.log(`synth ${rand} ${rand === 0}`)
    return rand === 0
  }
  private getRandomInt(min: number, max: number) {
    const cmin = Math.ceil(min)
    const cmax = Math.floor(max)
    return Math.floor(Math.random() * (cmax - cmin + 1)) + cmin
  }
  private getRandomFloat(min: number, max: number) {
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

    const sourceAssetAmount = await this.createCryptoAmount(sourceAsset)
    const rune = await this.thorchainQuery.convert(sourceAssetAmount, AssetRuneNative)
    //const destinationAmount = await this.thorchainQuery.convert(amount, destinationAsset)

    const inboundDetails = await this.thorchainQuery.thorchainCache.getPoolForAsset(destinationAsset)
    const decimals = inboundDetails.pool.nativeDecimal
    const randomNumber = this.getRandomInt(1, 10)
    // if it is even its a symmetrical add if its odd the its an asymetrical add
    const isEven = randomNumber % 2 === 0
    const addlpSym: AddliquidityPosition = {
      asset: sourceAssetAmount,
      rune: rune,
    }
    const addlpAsym: AddliquidityPosition = {
      asset: new CryptoAmount(assetToBase(assetAmount(0, +decimals)), sourceAssetAmount.asset), // leave as empty. for asym,
      rune: rune,
    }

    const result: TxDetail = {
      action: 'addLp',
    }
    try {
      const estimateSym = await this.thorchainQuery.estimateAddLP(addlpSym)
      result.date = new Date()
      result.details = `Adding liquidity position ${sourceAssetAmount.formatedAssetString()} to ${
        estimateSym.assetPool
      } `
      if (isEven) {
        result.details = `Adding liquidity position ${sourceAssetAmount.formatedAssetString()} and ${rune.formatedAssetString()}  to ${
          estimateSym.assetPool
        } `
        if (estimateSym.canAdd && !this.estimateOnly) {
          result.details = addlpSym
          const txhash = await this.thorchainAmm.addLiquidityPosition(senderWallet, addlpSym)
          result.result = `${txhash[0]}    ${txhash[1]}`
        } else {
          result.result = 'not submitted, estimate only mode'
        }
      } else {
        result.details = `Adding liquidity position ${sourceAssetAmount.formatedAssetString()} to ${
          estimateSym.assetPool
        } `
        const estimate = await this.thorchainQuery.estimateAddLP(addlpAsym)
        if (estimate.canAdd && !this.estimateOnly) {
          result.details = addlpAsym
          const txhash = await this.thorchainAmm.addLiquidityPosition(senderWallet, addlpAsym)
          result.result = txhash[1]
        } else {
          result.result = 'not submitted, estimate only mode'
        }
      }
    } catch (e) {
      result.result = e.message
    }
    this.txRecords.push(result)
  }
  /**
   * Executes add lp for a random wallet, random amount, and random asset
   */
  private async executeWithdraw() {
    const [senderWallet] = this.getRandomWallets()
    const [sourceAsset] = this.getRandomSourceAndDestAssets()

    const runeAddress = senderWallet.clients[Chain.THORChain].getAddress()

    const result: TxDetail = {
      action: 'withdrawLp',
    }
    try {
      result.date = new Date()
      const checkLp = await this.thorchainQuery.checkLiquidityPosition(sourceAsset, runeAddress)
      const withdrawLParams: WithdrawLiquidityPosition = {
        asset: sourceAsset,
        percentage: 100,
        assetAddress: checkLp.position.asset_address,
        runeAddress: checkLp.position.rune_address,
      }

      const estimate = await this.thorchainQuery.estimateWithdrawLP(withdrawLParams)
      result.details = `withdrawing ${checkLp.poolShare.assetShare.formatedAssetString()} and ${checkLp.poolShare.runeShare.formatedAssetString()}`
      if (estimate && !this.estimateOnly) {
        const txhash = await this.thorchainAmm.withdrawLiquidityPosition(senderWallet, withdrawLParams)
        result.details = withdrawLParams
        result.result = txhash[0]
      } else {
        result.result = 'not submitted, estimate only mode'
      }
    } catch (e) {
      result.result = e.message
    }
    this.txRecords.push(result)
  }
}

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
