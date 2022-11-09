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

import {
  ActionConfig,
  AddLpConfig,
  JammerAction,
  SwapConfig,
  TransferConfig,
  TxDetail,
  WithdrawLpConfig,
} from './types'

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
  private addLpConfig: AddLpConfig[]
  private transferConfig: TransferConfig[]
  private withdrawLpConfig: WithdrawLpConfig[]

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
    actionConfig: ActionConfig[],
    swapConfig: SwapConfig[],
    transferConfig: TransferConfig[],
    addLpConfig: AddLpConfig[],
    withdrawLpConfig: WithdrawLpConfig[],
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
    this.addLpConfig = addLpConfig
    this.transferConfig = transferConfig
    this.withdrawLpConfig = withdrawLpConfig

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
    const assetsIncludingSynths: string[] = []
    const assets = await this.getAvailablePoolAssets()
    for (const asset of assets) {
      const synth = assetFromStringEx(asset)
      synth.synth = true
      assetsIncludingSynths.push(asset)
      assetsIncludingSynths.push(assetToString(synth))
    }
    this.setupWeightedSwaps(assetsIncludingSynths)
    this.setupWeightedTransfers(assetsIncludingSynths)
    this.setupWeightedAddLps(assets)
    this.setupWeightedWithdrawLps(assets)

    for (const a of assetsIncludingSynths) {
      let weight = 100
      if (a.includes('ETH.')) {
        // we want to limit the number to "expensive" (in terms of gas) eth txs
        weight = 10
      }
      this.weightedWithdrawLP[a] = weight
    }
  }
  private async setupWeightedTransfers(assetStrings: string[]) {
    for (const asset of assetStrings) {
      if (this.transferConfig.length > 0) {
        for (const config of this.transferConfig) {
          const srcApplies = asset === config.assetString || config.assetString === '*'
          if (srcApplies) {
            this.weightedTransfer[asset] = config.weight
            break // stop looping if a match is found
          }
        }
      } else {
        let weight = 100 // default 100
        if (asset.includes('ETH.')) {
          // default: we want to limit the number to "expensive" (in terms of gas) eth txs
          weight = 10
        }
        this.weightedTransfer[asset] = weight
      }
    }
    console.log(JSON.stringify(this.weightedTransfer, null, 2))
  }
  private async setupWeightedSwaps(assetStrings: string[]) {
    for (const source of assetStrings) {
      for (const dest of assetStrings) {
        if (source === dest) {
          //do nothing, can't swap to same asset
        } else {
          if (this.swapConfig.length > 0) {
            for (const config of this.swapConfig) {
              const srcApplies = source === config.sourceAssetString || config.sourceAssetString === '*'
              const destApplies = dest === config.destAssetString || config.destAssetString === '*'
              if (srcApplies && destApplies) {
                this.weightedSwap[`${source} ${dest}`] = config.weight
                break // stop looping if a match is found
              }
            }
          } else {
            let weight = 100 // default 100
            if (source.includes('ETH.')) {
              // default: we want to limit the number to "expensive" (in terms of gas) eth txs
              weight = 10
            }
            this.weightedSwap[`${source} ${dest}`] = weight
          }
        }
      }
    }
    console.log(JSON.stringify(this.weightedSwap))
  }

  private async setupWeightedAddLps(assetStrings: string[]) {
    for (const asset of assetStrings) {
      if (this.addLpConfig.length > 0) {
        for (const config of this.addLpConfig) {
          const srcApplies = asset === config.assetString || config.assetString === '*'
          if (srcApplies) {
            this.weightedAddLP[asset] = config.weight
            break // stop looping if a match is found
          }
        }
      } else {
        let weight = 100 // default 100
        if (asset.includes('ETH.')) {
          // default: we want to limit the number to "expensive" (in terms of gas) eth txs
          weight = 10
        }
        this.weightedAddLP[asset] = weight
      }
    }
    // console.log(JSON.stringify(this.weightedSwap, null, 2))
  }
  private async setupWeightedWithdrawLps(assetStrings: string[]) {
    for (const asset of assetStrings) {
      if (this.addLpConfig.length > 0) {
        for (const config of this.addLpConfig) {
          const srcApplies = asset === config.assetString || config.assetString === '*'
          if (srcApplies) {
            this.weightedAddLP[asset] = config.weight
            break // stop looping if a match is found
          }
        }
      } else {
        let weight = 100 // default 100
        if (asset.includes('ETH.')) {
          // default: we want to limit the number to "expensive" (in terms of gas) eth txs
          weight = 10
        }
        this.weightedAddLP[asset] = weight
      }
    }
    // console.log(JSON.stringify(this.weightedSwap, null, 2))
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
    const [sourceAsset, destinationAsset] = this.getRandomSwapAssets()
    const destinationAddress = destinationAsset.synth
      ? receiverWallet.clients[Chain.THORChain].getAddress()
      : receiverWallet.clients[destinationAsset.chain].getAddress()
    const swapParams: EstimateSwapParams = {
      input: await this.createCryptoAmount(sourceAsset),
      destinationAsset,
      destinationAddress: destinationAddress,
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
        result.result = `not submitted, Can swap: ${estimate.txEstimate.canSwap} or estimate: ${this.estimateOnly}`
      }
    } catch (e) {
      result.result = e.message
    }
    this.txRecords.push(result)
  }

  private async executeTransfer() {
    const [senderWallet, receiverWallet] = this.getRandomWallets()
    const sourceAsset = this.getRandomTransferAsset()

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
  private getRandomSwapAssets(): [Asset, Asset] {
    const sourceAndDestAssetString = weighted.select(this.weightedSwap) as string
    const assets = sourceAndDestAssetString.split(' ')
    const sourceAsset = assetFromStringEx(assets[0])
    const destinationAsset = assetFromStringEx(assets[1])
    return [sourceAsset, destinationAsset]
  }
  private getRandomTransferAsset(): Asset {
    const randomAssetString = weighted.select(this.weightedTransfer) as string
    return assetFromStringEx(randomAssetString)
  }
  private getRandomAddLpAsset(): Asset {
    const randomAssetString = weighted.select(this.weightedAddLP) as string
    return assetFromStringEx(randomAssetString)
  }
  private getRandomWithdrawLpAsset(): Asset {
    const randomAssetString = weighted.select(this.weightedWithdrawLP) as string
    return assetFromStringEx(randomAssetString)
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
    const sourceAsset = this.getRandomAddLpAsset()
    const sourceAssetAmount = await this.createCryptoAmount(sourceAsset)
    const rune = await this.thorchainQuery.convert(sourceAssetAmount, AssetRuneNative)

    const inboundDetails = await this.thorchainQuery.thorchainCache.getPoolForAsset(sourceAsset)
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
      if (isEven) {
        result.details = `Adding symetrical liquidity position ${rune.formatedAssetString()} and ${sourceAssetAmount.formatedAssetString()} to pool: ${
          estimateSym.assetPool
        } `
        if (estimateSym.canAdd && !this.estimateOnly) {
          result.details = addlpSym
          const txhash = await this.thorchainAmm.addLiquidityPosition(senderWallet, addlpSym)
          result.result = `hash: ${txhash[0].hash}    hash: ${txhash[1].hash}`
        } else {
          result.result = `not submitted, Can add lp position: ${estimateSym.canAdd} or ${this.estimateOnly}`
        }
      } else {
        result.details = `Adding asymetrical liquidity position ${sourceAssetAmount.formatedAssetString()} to ${
          estimateSym.assetPool
        } `
        const estimate = await this.thorchainQuery.estimateAddLP(addlpAsym)
        if (estimate.canAdd && !this.estimateOnly) {
          result.details = addlpAsym
          const txhash = await this.thorchainAmm.addLiquidityPosition(senderWallet, addlpAsym)
          result.result = `hash: ${txhash[0].hash}`
        } else {
          result.result = `not submitted, Can add: ${estimate.canAdd} or ${this.estimateOnly}`
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
    const sourceAsset = this.getRandomWithdrawLpAsset()

    //const runeAddress = senderWallet.clients[Chain.THORChain].getAddress()
    const sourceAddress = senderWallet.clients[sourceAsset.chain].getAddress()
    const percentageWithdraw = Number(this.withdrawLpConfig[2])
    const result: TxDetail = {
      action: 'withdrawLp',
    }
    try {
      result.date = new Date()
      const checkLp = await this.thorchainQuery.checkLiquidityPosition(sourceAsset, sourceAddress)
      const withdrawLParams: WithdrawLiquidityPosition = {
        asset: sourceAsset,
        percentage: percentageWithdraw,
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
