import fs = require('fs')

import { Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Network } from '@xchainjs/xchain-client'
import { Client as GaiaClient, defaultClientConfig as defaultGaiaParams } from '@xchainjs/xchain-cosmos'
import { decryptFromKeystore } from '@xchainjs/xchain-crypto'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import {
  AssetRuneNative,
  Client as ThorClient,
  THORChain,
  defaultClientConfig as defaultThorParams,
} from '@xchainjs/xchain-thorchain'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import {
  AddliquidityPosition,
  LiquidityPool,
  QuoteSwapParams,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  WithdrawLiquidityPosition,
} from '@xchainjs/xchain-thorchain-query'
import {
  Asset,
  AssetType,
  CryptoAmount,
  SecuredAsset,
  SynthAsset,
  TokenAsset,
  TradeAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
  isSynthAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
import { BigNumber } from 'bignumber.js'
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

  private estimateOnly: boolean
  private minAmount: number
  private maxAmount: number
  private durationSeconds: number
  private pauseTimeMSeconds: number

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
    network: Network,
    estimateOnly: boolean,
    minAmount: number,
    maxAmount: number,
    durationSeconds: number,
    pauseTimeMSeconds: number,
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
    this.pauseTimeMSeconds = pauseTimeMSeconds

    this.keystore1FilePath = keystore1FilePath
    this.keystore1Password = keystore1Password
    this.keystore2FilePath = keystore2FilePath
    this.keystore2Password = keystore2Password
    this.swapConfig = swapConfig
    this.actionConfig = actionConfig
    this.addLpConfig = addLpConfig
    this.transferConfig = transferConfig
    this.withdrawLpConfig = withdrawLpConfig

    this.thorchainCache = new ThorchainCache(
      new Thornode(network),
      new MidgardQuery(new MidgardCache(new Midgard(network))),
    )
    this.thorchainQuery = new ThorchainQuery(this.thorchainCache)
  }
  private async writeToFile() {
    fs.writeFileSync(`./txJammer${new Date().toISOString()}.json`, JSON.stringify(this.txRecords, null, 4), 'utf8')
  }
  private async setup() {
    const keystore1 = JSON.parse(fs.readFileSync(this.keystore1FilePath, 'utf8'))
    const keystore2 = JSON.parse(fs.readFileSync(this.keystore2FilePath, 'utf8'))
    const phrase1 = await decryptFromKeystore(keystore1, this.keystore1Password)
    const phrase2 = await decryptFromKeystore(keystore2, this.keystore2Password)

    const getClients = (phrase: string) => {
      const network = this.thorchainCache.midgardQuery.midgardCache.midgard.network
      return {
        BTC: new BtcClient({ ...defaultBtcParams, network, phrase }),
        BCH: new BchClient({ ...defaultBchParams, network, phrase }),
        LTC: new LtcClient({ ...defaultLtcParams, network, phrase }),
        DOGE: new DogeClient({ ...defaultDogeParams, network, phrase }),
        ETH: new EthClient({ ...defaultEthParams, network, phrase }),
        AVAX: new AvaxClient({ ...defaultAvaxParams, network, phrase }),
        BSC: new BscClient({ ...defaultBscParams, network, phrase }),
        GAIA: new GaiaClient({ ...defaultGaiaParams, network, phrase }),
        THOR: new ThorClient({ ...defaultThorParams, network, phrase }),
      }
    }

    this.wallet1 = new Wallet(getClients(phrase1))
    this.wallet2 = new Wallet(getClients(phrase2))
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
      synth.type = AssetType.SYNTH
      assetsIncludingSynths.push(asset)
      assetsIncludingSynths.push(assetToString(synth))
    }
    assetsIncludingSynths.push('THOR.RUNE') // add rune to the list of assets
    this.setupWeightedSwaps(assetsIncludingSynths)
    this.setupWeightedTransfers(assetsIncludingSynths)
    this.setupWeightedAddLps(assets)
    this.setupWeightedWithdrawLps(assets)
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
    // console.log(JSON.stringify(this.weightedTransfer, null, 2))
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
    // console.log(JSON.stringify(this.weightedSwap))
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
      if (this.withdrawLpConfig.length > 0) {
        for (const config of this.withdrawLpConfig) {
          const srcApplies = asset === config.assetString || config.assetString === '*'
          if (srcApplies) {
            this.weightedWithdrawLP[asset] = config.weight
            break // stop looping if a match is found
          }
        }
      } else {
        let weight = 100 // default 100
        if (asset.includes('ETH.')) {
          // default: we want to limit the number to "expensive" (in terms of gas) eth txs
          weight = 10
        }
        this.weightedWithdrawLP[asset] = weight
      }
    }
    // console.log(JSON.stringify(this.weightedSwap, null, 2))
  }

  async start() {
    console.log('Setting up')
    await this.setup()
    const startTime = new Date()
    let currentTime = new Date()
    console.log('Running txJammer....')
    while (currentTime.getTime() < startTime.getTime() + this.durationSeconds * 1000) {
      // select a random action
      const action = weighted.select(this.weightedActions) as string
      console.log(`executing ${action}..`)
      await this.executeAction(action)
      await delay(this.pauseTimeMSeconds)
      currentTime = new Date()
    }
    await this.writeToFile()
    console.log('Complete')
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
    const destinationAddress = isSynthAsset(destinationAsset)
      ? await receiverWallet.getAddress(THORChain)
      : await receiverWallet.getAddress(destinationAsset.chain)
    const swapParams: QuoteSwapParams = {
      amount: await this.createCryptoAmount(sourceAsset),
      fromAsset: sourceAsset,
      destinationAsset,
      destinationAddress: destinationAddress,
    }

    const result: TxDetail = { action: 'swap' }
    try {
      const thorchainAmm = new ThorchainAMM(this.thorchainQuery, senderWallet)
      const estimate = await thorchainAmm.estimateSwap(swapParams)
      result.date = new Date()
      result.details = `swapping ${swapParams.amount.formatedAssetString()} to ${assetToString(destinationAsset)} `
      if (estimate.txEstimate.canSwap && !this.estimateOnly) {
        const txhash = await thorchainAmm.doSwap(swapParams)
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
      const transferParams = {
        asset: amount.asset,
        amount: amount.baseAmount,
        recipient: await receiverWallet.getAddress(sourceAsset.chain),
      }
      result.date = new Date()
      result.details = `transfering ${amount.formatedAssetString()} to ${transferParams.recipient} `
      if (!this.estimateOnly) {
        result.date = new Date()
        result.details = transferParams
        const txhash = await senderWallet.transfer(transferParams)
        result.result = txhash
      } else {
        result.result = 'not submitted, estimate only mode'
      }
    } catch (e) {
      result.result = e.message
    }
    this.txRecords.push(result)
  }
  private async createCryptoAmount<T extends Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset>(
    asset: T,
  ): Promise<CryptoAmount<T>> {
    const amount = this.getRandomFloat(this.minAmount, this.maxAmount)
    const usdPool = await this.getDeepestUSDPool()
    const usdAmount = new CryptoAmount(assetToBase(assetAmount(amount)), usdPool.asset)
    return await this.thorchainQuery.convert(usdAmount, asset)
  }

  private async getDeepestUSDPool(): Promise<LiquidityPool> {
    const USD_ASSETS: Record<Network, TokenAsset[]> = {
      mainnet: [
        assetFromStringEx('BNB.BUSD-BD1') as TokenAsset,
        assetFromStringEx('ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48') as TokenAsset,
        assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7') as TokenAsset,
      ],
      stagenet: [assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7') as TokenAsset],
      testnet: [
        assetFromStringEx('BNB.BUSD-74E') as TokenAsset,
        assetFromStringEx('ETH.USDT-0XA3910454BF2CB59B8B3A401589A3BACC5CA42306') as TokenAsset,
      ],
    }
    const usdAssets = USD_ASSETS[this.thorchainCache.midgardQuery.midgardCache.midgard.network]
    let deepestRuneDepth = new BigNumber(0)
    let deepestPool: LiquidityPool | null = null
    for (const usdAsset of usdAssets) {
      const usdPool = await this.thorchainCache.getPoolForAsset(usdAsset)
      if (usdPool.runeBalance.amount().gt(deepestRuneDepth)) {
        deepestRuneDepth = usdPool.runeBalance.amount()
        deepestPool = usdPool
      }
    }
    if (!deepestPool) throw Error('now USD Pool found')
    return deepestPool
  }

  private getRandomWallets(): [Wallet, Wallet] {
    const rand = this.getRandomInt(0, 1)
    return rand == 0 ? [this.wallet1, this.wallet2] : [this.wallet2, this.wallet1]
  }
  private getRandomSwapAssets(): [
    Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset,
    Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset,
  ] {
    const sourceAndDestAssetString = weighted.select(this.weightedSwap) as string
    const assets = sourceAndDestAssetString.split(' ')
    const sourceAsset = assetFromStringEx(assets[0])
    const destinationAsset = assetFromStringEx(assets[1])
    return [sourceAsset, destinationAsset]
  }
  private getRandomTransferAsset(): Asset | TokenAsset | SynthAsset {
    const randomAssetString = weighted.select(this.weightedTransfer) as string
    return assetFromStringEx(randomAssetString) as Asset | TokenAsset | SynthAsset
  }
  private getRandomAddLpAsset(): Asset | TokenAsset {
    const randomAssetString = weighted.select(this.weightedAddLP) as string
    return assetFromStringEx(randomAssetString) as Asset | TokenAsset
  }
  private getRandomWithdrawLpAsset(): Asset | TokenAsset {
    const randomAssetString = weighted.select(this.weightedWithdrawLP) as string
    return assetFromStringEx(randomAssetString) as Asset | TokenAsset
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
    const decimals = inboundDetails.thornodeDetails.decimals
    const randomNumber = this.getRandomInt(1, 10)
    // if it is even its a symmetrical add if its odd the its an asymetrical add
    const isEven = randomNumber % 2 === 0
    const addlpSym: AddliquidityPosition = {
      asset: sourceAssetAmount,
      rune: rune,
    }
    const addlpAsym: AddliquidityPosition = {
      asset: new CryptoAmount(baseAmount(0, decimals), sourceAssetAmount.asset), // leave as empty. for asym,
      rune: rune,
    }

    const result: TxDetail = {
      action: 'addLp',
    }
    try {
      const estimateSym = await this.thorchainQuery.estimateAddLP(addlpSym)
      const thorchainAmm = new ThorchainAMM(this.thorchainQuery, senderWallet)
      result.date = new Date()
      if (isEven) {
        result.details = `Adding symetrical liquidity position ${rune.formatedAssetString()} and ${sourceAssetAmount.formatedAssetString()} to pool: ${
          estimateSym.assetPool
        } `
        if (estimateSym.canAdd && !this.estimateOnly) {
          const txhash = await thorchainAmm.addLiquidityPosition(addlpSym)
          result.result = `hash: ${txhash[0].hash}    hash: ${txhash[1].hash}`
        } else {
          result.result = `not submitted, Can add lp position: ${estimateSym.canAdd},  estimateOnly: ${this.estimateOnly}`
        }
      } else {
        result.details = `Adding asymetrical liquidity position ${sourceAssetAmount.formatedAssetString()} to ${
          estimateSym.assetPool
        } `
        const estimate = await this.thorchainQuery.estimateAddLP(addlpAsym)
        if (estimate.canAdd && !this.estimateOnly) {
          const txhash = await thorchainAmm.addLiquidityPosition(addlpAsym)
          result.result = `hash: ${txhash[0].hash}`
        } else {
          result.result = `not submitted, Can add: ${estimate.canAdd} ,  estimateOnly: ${this.estimateOnly}`
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
    const asset = this.getRandomWithdrawLpAsset()
    const runeAddress = await senderWallet.getAddress(THORChain)
    const sourceAddress = await senderWallet.getAddress(asset.chain)
    const percentageWithdraw = this.getRandomInt(1, 100)
    const result: TxDetail = {
      action: 'withdrawLp',
    }
    try {
      result.date = new Date()
      const [hasRunePosition, hasAssetPosition] = await this.getLpPositions(asset, runeAddress, sourceAddress)
      const withdrawLParams: WithdrawLiquidityPosition = {
        asset: asset,
        percentage: percentageWithdraw,
      }
      if (hasRunePosition) {
        withdrawLParams.runeAddress = runeAddress
      }
      if (hasAssetPosition) {
        withdrawLParams.assetAddress = sourceAddress
      }
      result.details = `LP ${assetToString(
        asset,
      )} hasRunePosition: ${hasRunePosition}, hasAssetPosition: ${hasAssetPosition},  withdrawing ${percentageWithdraw}%`
      const estimate = await this.thorchainQuery.estimateWithdrawLP(withdrawLParams)

      if (estimate && !this.estimateOnly) {
        const thorchainAmm = new ThorchainAMM(this.thorchainQuery, senderWallet)
        const txhash = await thorchainAmm.withdrawLiquidityPosition(withdrawLParams)
        result.details = withdrawLParams
        result.result = `hash: ${txhash[0].hash}    hash: ${txhash[1].hash}`
      } else {
        result.result = 'not submitted, estimate only mode'
      }
    } catch (e) {
      result.result = e.message
    }
    this.txRecords.push(result)
  }
  private async getLpPositions(
    asset: Asset | TokenAsset,
    runeAddress: string,
    sourceAddress: string,
  ): Promise<[boolean, boolean]> {
    let runePosition = true
    try {
      await this.thorchainQuery.checkLiquidityPosition(asset, runeAddress)
    } catch (error) {
      runePosition = false
    }
    let assetPosition = true
    try {
      await this.thorchainQuery.checkLiquidityPosition(asset, sourceAddress)
    } catch (error) {
      assetPosition = false
    }
    return [runePosition, assetPosition]
  }
  private executeSymWithdraw() {}
}
