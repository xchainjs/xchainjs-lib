import { AVAXChain, Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient } from '@xchainjs/xchain-bitcoincash'
import { BSCChain, Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Balance, FeeOption, Network, XChainClient } from '@xchainjs/xchain-client'
import { Client as CosmosClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient } from '@xchainjs/xchain-doge'
import { Client as EthClient, ETHChain } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient } from '@xchainjs/xchain-litecoin'
import { Client as ThorClient, THORChain, ThorchainClient } from '@xchainjs/xchain-thorchain'
import { CryptoAmount, ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Address, Chain } from '@xchainjs/xchain-util'

import { AddLiquidity, ExecuteSwap, TxSubmitted, WithdrawLiquidity } from './types'
import { EthHelper } from './utils/eth-helper'
import { EvmHelper } from './utils/evm-helper'

type AllBalances = {
  chain: Chain
  address: string
  balances: Balance[] | string
}
export type NodeUrls = Record<Network, string>

/**
 * Wallet Class for managing all xchain-* wallets with a mnemonic seed.
 */
export class Wallet {
  private thorchainQuery: ThorchainQuery
  clients: Record<string, XChainClient>
  private ethHelper: EthHelper

  /**
   * Contructor to create a Wallet
   *
   * @param phrase - mnemonic phrase
   * @param thorchainCache - an instance of the ThorchainCache (could be pointing to stagenet,testnet,mainnet)
   * @returns Wallet
   */
  constructor(phrase: string, thorchainQuery: ThorchainQuery) {
    this.thorchainQuery = thorchainQuery

    const settings = { network: thorchainQuery.thorchainCache.midgard.network, phrase }
    this.clients = {
      BCH: new BchClient(),
      BTC: new BtcClient(),
      DOGE: new DogeClient(),
      LTC: new LtcClient(),
      ETH: new EthClient(settings),
      THOR: new ThorClient(settings),
      BNB: new BnbClient(settings),
      GAIA: new CosmosClient(settings),
      AVAX: new AvaxClient({ ...defaultAvaxParams, network: settings.network, phrase }),
      BSC: new BscClient({ ...defaultBscParams, network: settings.network, phrase }),
    }
    this.clients.BCH.setNetwork(settings.network)
    this.clients.BCH.setPhrase(settings.phrase, 0)
    this.clients.BTC.setNetwork(settings.network)
    this.clients.BTC.setPhrase(settings.phrase, 0)
    this.clients.DOGE.setNetwork(settings.network)
    this.clients.DOGE.setPhrase(settings.phrase, 0)
    this.clients.LTC.setNetwork(settings.network)
    this.clients.LTC.setPhrase(settings.phrase, 0)

    this.ethHelper = new EthHelper(this.clients.ETH, this.thorchainQuery.thorchainCache)
  }

  /**
   * Fetch balances for all wallets
   *
   * @returns AllBalances[]
   */
  async getAllBalances(): Promise<AllBalances[]> {
    const clientArray = Object.entries(this.clients)
    const allBalances = await Promise.all(
      clientArray.map(async (entry) => {
        const chain = entry[0] as Chain
        const address = entry[1].getAddress(0)
        try {
          const balances = await entry[1].getBalance(address)
          return { chain, address, balances }
        } catch (err) {
          return { chain, address, balances: (err as Error).message }
        }
      }),
    )
    return allBalances
  }

  /**
   * Executes a Swap from THORChainAMM.doSwap()
   *
   * @param swap object with all the required details for a swap.
   * @returns transaction details and explorer url
   * @see ThorchainAMM.doSwap()
   */
  async executeSwap(swap: ExecuteSwap): Promise<TxSubmitted> {
    this.validateSwap(swap)
    if (swap.input.asset.chain === THORChain || swap.input.asset.synth) {
      return await this.swapRuneTo(swap)
    } else {
      return await this.swapNonRune(swap)
    }
  }

  /** Validate swap object
   *
   * @param swap  - swap parameters
   */
  private validateSwap(swap: ExecuteSwap) {
    const errors: string[] = []
    const isThorchainDestinationAsset = swap.destinationAsset.synth || swap.destinationAsset.chain === THORChain
    const chain = isThorchainDestinationAsset ? THORChain : swap.destinationAsset.chain

    if (!this.clients[chain].validateAddress(swap.destinationAddress)) {
      errors.push(`destinationAddress ${swap.destinationAddress} is not a valid address`)
    }
    // Affiliate address should be THORName or THORAddress
    const checkAffiliateAddress = swap.memo.split(':')
    if (checkAffiliateAddress.length > 4) {
      const affiliateAddress = checkAffiliateAddress[4]
      if (affiliateAddress.length > 0) {
        const isValidThorchainAddress = this.clients[THORChain].validateAddress(affiliateAddress)
        const isValidThorname = this.isThorname(affiliateAddress)
        if (!(isValidThorchainAddress || isValidThorname))
          errors.push(`affiliateAddress ${affiliateAddress} is not a valid THOR address`)
      }
    }
    if (errors.length > 0) throw Error(errors.join('\n'))
  }

  private async isThorname(name: string): Promise<boolean> {
    const thornameDetails = await this.thorchainQuery.thorchainCache.midgard.getTHORNameDetails(name)
    return thornameDetails !== undefined
  }

  /** Function handles all swaps from Rune to asset
   *
   * @param swap - swap parameters
   * @returns - tx submitted object
   */
  private async swapRuneTo(swap: ExecuteSwap): Promise<TxSubmitted> {
    const thorClient = (this.clients.THOR as unknown) as ThorchainClient
    const waitTimeSeconds = swap.waitTimeSeconds
    const hash = await thorClient.deposit({
      amount: swap.input.baseAmount,
      asset: swap.input.asset,
      memo: swap.memo,
    })
    return { hash, url: this.clients.THOR.getExplorerTxUrl(hash), waitTimeSeconds }
  }

  /** Function handles all swaps from Non Rune
   *
   * @param swap - swap object
   * @returns - TxSubmitted object
   */
  private async swapNonRune(swap: ExecuteSwap): Promise<TxSubmitted> {
    const client = this.clients[swap.input.asset.chain]
    const waitTimeSeconds = swap.waitTimeSeconds
    const inbound = (await this.thorchainQuery.thorchainCache.getInboundDetails())[swap.input.asset.chain]

    if (!inbound?.address) throw Error(`no asgard address found for ${swap.input.asset.chain}`)
    if (swap.input.asset.chain === ETHChain) {
      const params = {
        walletIndex: 0,
        asset: swap.input.asset,
        amount: swap.input.baseAmount,
        feeOption: swap.feeOption || FeeOption.Fast,
        memo: swap.memo,
      }
      const hash = await this.ethHelper.sendDeposit(params)
      return { hash, url: client.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (swap.input.asset.chain === AVAXChain) {
      const params = {
        walletIndex: 0,
        asset: swap.input.asset,
        amount: swap.input.baseAmount,
        feeOption: swap.feeOption || FeeOption.Fast,
        memo: swap.memo,
      }
      const evmHelper = new EvmHelper(this.clients.AVAX, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(params)
      return { hash, url: client.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (swap.input.asset.chain === BSCChain) {
      const params = {
        walletIndex: 0,
        asset: swap.input.asset,
        amount: swap.input.baseAmount,
        feeOption: swap.feeOption || FeeOption.Fast,
        memo: swap.memo,
      }
      const evmHelper = new EvmHelper(this.clients.BSC, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(params)
      return { hash, url: client.getExplorerTxUrl(hash), waitTimeSeconds }
    } else {
      const params = {
        walletIndex: 0,
        asset: swap.input.asset,
        amount: swap.input.baseAmount,
        recipient: inbound.address,
        memo: swap.memo,
      }
      const hash = await client.transfer(params)
      return { hash, url: client.getExplorerTxUrl(hash), waitTimeSeconds }
    }
  }

  /** Function handles liquidity Add
   * BASED OFF https://dev.thorchain.or›g/thorchain-dev/network/memos
   * @param params input parameters needed to add liquidity
   * @returns transaction details submitted
   */
  async addLiquidity(params: AddLiquidity): Promise<TxSubmitted[]> {
    const assetClient = this.clients[params.asset.asset.chain]
    const inboundAsgard = (await this.thorchainQuery.thorchainCache.getInboundDetails())[params.asset.asset.chain]
      .address
    const thorchainClient = this.clients[params.rune.asset.chain]
    const addressRune = thorchainClient.getAddress()
    const addressAsset = assetClient.getAddress()
    const waitTimeSeconds = params.waitTimeSeconds
    let constructedMemo = ''
    const txSubmitted: TxSubmitted[] = []

    // symmetrical add
    if (params.asset.assetAmount.gt(0) && params.rune.assetAmount.gt(0)) {
      constructedMemo = `+:${params.assetPool}:${addressRune}`
      txSubmitted.push(await this.addAssetLP(params, constructedMemo, assetClient, waitTimeSeconds, inboundAsgard))
      constructedMemo = `+:${params.assetPool}:${addressAsset}`
      txSubmitted.push(await this.addRuneLP(params, constructedMemo, thorchainClient, waitTimeSeconds))
      return txSubmitted
    } else if (params.asset.assetAmount.gt(0) && params.rune.assetAmount.eq(0)) {
      // asymmetrical asset only
      constructedMemo = `+:${params.assetPool}`
      txSubmitted.push(await this.addAssetLP(params, constructedMemo, assetClient, waitTimeSeconds, inboundAsgard))
      return txSubmitted
    } else {
      // asymmetrical rune only
      constructedMemo = `+:${params.assetPool}`
      txSubmitted.push(await this.addRuneLP(params, constructedMemo, thorchainClient, waitTimeSeconds))
      return txSubmitted
    }
  }

  /** Function handles liquidity Withdraw
   *
   * @param params - parameters required for liquidity position
   * @returns object with tx response, url and wait time in seconds
   */
  async withdrawLiquidity(params: WithdrawLiquidity): Promise<TxSubmitted[]> {
    const assetClient = this.clients[params.assetFee.asset.chain]
    const inboundAsgard = (await this.thorchainQuery.thorchainCache.getInboundDetails())[params.assetFee.asset.chain]
      .address
    const waitTimeSeconds = params.waitTimeSeconds
    const thorchainClient = this.clients[params.runeFee.asset.chain]
    const basisPoints = (params.percentage * 100).toFixed() // convert to basis points
    let constructedMemo = ''
    const txSubmitted: TxSubmitted[] = []

    if (params.assetAddress && params.runeAddress) {
      constructedMemo = `-:${params.assetPool}:${basisPoints}`
      txSubmitted.push(await this.withdrawAssetLP(params, constructedMemo, assetClient, waitTimeSeconds, inboundAsgard))
      constructedMemo = `-:${params.assetPool}:${basisPoints}`
      txSubmitted.push(await this.withdrawRuneLP(params, constructedMemo, thorchainClient, waitTimeSeconds))
      return txSubmitted
    } else if (params.assetAddress && !params.runeAddress) {
      // asymmetrical asset only
      constructedMemo = `-:${params.assetPool}:${basisPoints}`
      txSubmitted.push(await this.withdrawAssetLP(params, constructedMemo, assetClient, waitTimeSeconds, inboundAsgard))
      return txSubmitted
    } else {
      // asymmetrical rune only
      constructedMemo = `-:${params.assetPool}:${basisPoints}`
      txSubmitted.push(await this.withdrawRuneLP(params, constructedMemo, thorchainClient, waitTimeSeconds))
      return txSubmitted
    }
  }

  /**
   *
   * @param assetAmount - amount to add
   * @param memo - memo required
   * @param waitTimeSeconds - expected wait for the transaction to be processed
   * @returns
   */
  async addSavers(
    assetAmount: CryptoAmount,
    memo: string,
    toAddress: Address,
    waitTimeSeconds: number,
  ): Promise<TxSubmitted> {
    const assetClient = this.clients[assetAmount.asset.chain]
    if (assetAmount.asset.chain === ETHChain) {
      const addParams = {
        wallIndex: 0,
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        feeOption: FeeOption.Fast,
        memo: memo,
      }
      const hash = await this.ethHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (assetAmount.asset.chain === AVAXChain) {
      const addParams = {
        wallIndex: 0,
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        feeOption: FeeOption.Fast,
        memo: memo,
      }
      const evmHelper = new EvmHelper(this.clients.AVAX, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (assetAmount.asset.chain === BSCChain) {
      const addParams = {
        wallIndex: 0,
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        feeOption: FeeOption.Fast,
        memo: memo,
      }
      const evmHelper = new EvmHelper(this.clients.BSC, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else {
      const addParams = {
        wallIndex: 0,
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        recipient: toAddress,
        memo: memo,
      }
      try {
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(assetClient.getAddress()), waitTimeSeconds }
      }
    }
  }
  /**
   *
   * @param assetAmount - amount to withdraw
   * @param memo - memo required
   * @param waitTimeSeconds - expected wait for the transaction to be processed
   * @returns
   */
  async withdrawSavers(
    dustAssetAmount: CryptoAmount,
    memo: string,
    toAddress: Address,
    waitTimeSeconds: number,
  ): Promise<TxSubmitted> {
    const assetClient = this.clients[dustAssetAmount.asset.chain]
    if (dustAssetAmount.asset.chain === ETHChain) {
      const addParams = {
        wallIndex: 0,
        asset: dustAssetAmount.asset,
        amount: dustAssetAmount.baseAmount,
        feeOption: FeeOption.Fast,
        memo: memo,
      }
      const hash = await this.ethHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (dustAssetAmount.asset.chain === AVAXChain) {
      const addParams = {
        wallIndex: 0,
        asset: dustAssetAmount.asset,
        amount: dustAssetAmount.baseAmount,
        feeOption: FeeOption.Fast,
        memo: memo,
      }
      const evmHelper = new EvmHelper(this.clients.AVAX, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (dustAssetAmount.asset.chain === BSCChain) {
      const addParams = {
        wallIndex: 0,
        asset: dustAssetAmount.asset,
        amount: dustAssetAmount.baseAmount,
        feeOption: FeeOption.Fast,
        memo: memo,
      }
      const evmHelper = new EvmHelper(this.clients.BSC, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else {
      const addParams = {
        wallIndex: 0,
        asset: dustAssetAmount.asset,
        amount: dustAssetAmount.baseAmount,
        recipient: toAddress,
        memo: memo,
      }
      try {
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(assetClient.getAddress()), waitTimeSeconds }
      }
    }
  }

  /** Function handles liquidity add for all non rune assets
   *
   * @param params - parameters for add liquidity
   * @param constructedMemo - memo needed for thorchain
   * @param waitTimeSeconds - wait time for the tx to be confirmed
   * @param assetClient - passing XchainClient
   * @param inboundAsgard - inbound Asgard address for the LP
   * @returns - tx object
   */
  private async addAssetLP(
    params: AddLiquidity,
    constructedMemo: string,
    assetClient: XChainClient,
    waitTimeSeconds: number,
    inboundAsgard: string,
  ): Promise<TxSubmitted> {
    if (params.asset.asset.chain === ETHChain) {
      const addParams = {
        wallIndex: 0,
        asset: params.asset.asset,
        amount: params.asset.baseAmount,
        feeOption: FeeOption.Fast,
        memo: constructedMemo,
      }
      const hash = await this.ethHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (params.asset.asset.chain === AVAXChain) {
      const addParams = {
        wallIndex: 0,
        asset: params.asset.asset,
        amount: params.asset.baseAmount,
        feeOption: FeeOption.Fast,
        memo: constructedMemo,
      }
      const evmHelper = new EvmHelper(this.clients.AVAX, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (params.asset.asset.chain === BSCChain) {
      const addParams = {
        wallIndex: 0,
        asset: params.asset.asset,
        amount: params.asset.baseAmount,
        feeOption: FeeOption.Fast,
        memo: constructedMemo,
      }
      const evmHelper = new EvmHelper(this.clients.BSC, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else {
      const addParams = {
        wallIndex: 0,
        asset: params.asset.asset,
        amount: params.asset.baseAmount,
        recipient: inboundAsgard,
        memo: constructedMemo,
      }
      try {
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(assetClient.getAddress()), waitTimeSeconds }
      }
    }
  }
  /** Function handles liquidity Withdraw for Non rune assets
   *
   * @param params - parameters for withdraw liquidity
   * @param constructedMemo - memo needed for thorchain execution
   * @param assetClient - asset client to call transfer
   * @param waitTimeSeconds - return back estimated wait
   * @param inboundAsgard - destination address
   * @returns - tx object
   */
  private async withdrawAssetLP(
    params: WithdrawLiquidity,
    constructedMemo: string,
    assetClient: XChainClient,
    waitTimeSeconds: number,
    inboundAsgard: string,
  ): Promise<TxSubmitted> {
    if (params.assetFee.asset.chain === ETHChain) {
      const withdrawParams = {
        wallIndex: 0,
        asset: params.assetFee.asset,
        amount: params.assetFee.baseAmount,
        feeOption: FeeOption.Fast,
        memo: constructedMemo,
      }
      // console.log(withdrawParams.amount.amount().toNumber())
      const hash = await this.ethHelper.sendDeposit(withdrawParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (params.assetFee.asset.chain === AVAXChain) {
      const withdrawParams = {
        wallIndex: 0,
        asset: params.assetFee.asset,
        amount: params.assetFee.baseAmount,
        feeOption: FeeOption.Fast,
        memo: constructedMemo,
      }
      const evmHelper = new EvmHelper(this.clients.AVAX, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(withdrawParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (params.assetFee.asset.chain === BSCChain) {
      const withdrawParams = {
        wallIndex: 0,
        asset: params.assetFee.asset,
        amount: params.assetFee.baseAmount,
        feeOption: FeeOption.Fast,
        memo: constructedMemo,
      }
      const evmHelper = new EvmHelper(this.clients.BSC, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(withdrawParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else {
      const withdrawParams = {
        wallIndex: 0,
        asset: params.assetFee.asset,
        amount: params.assetFee.baseAmount,
        recipient: inboundAsgard,
        memo: constructedMemo,
      }
      try {
        const hash = await assetClient.transfer(withdrawParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(assetClient.getAddress()), waitTimeSeconds }
      }
    }
  }

  /** Function handles liquidity Add for Rune only
   *
   * @param params - deposit parameters
   * @param memo - memo needed to withdraw lp
   * @returns - tx object
   */
  private async addRuneLP(
    params: AddLiquidity,
    memo: string,
    thorchainClient: XChainClient,
    waitTimeSeconds: number,
  ): Promise<TxSubmitted> {
    const thorClient = (this.clients.THOR as unknown) as ThorchainClient
    const addParams = {
      asset: params.rune.asset,
      amount: params.rune.baseAmount,
      memo: memo,
    }
    const hash = await thorClient.deposit(addParams)
    return { hash, url: thorchainClient.getExplorerTxUrl(hash), waitTimeSeconds }
  }
  /** Function handles liquidity Withdraw for Rune only
   *
   * @param params - withdraw parameters
   * @param memo - memo needed to withdraw lp
   * @returns - tx object
   */
  private async withdrawRuneLP(
    params: WithdrawLiquidity,
    memo: string,
    thorchainClient: XChainClient,
    waitTimeSeconds: number,
  ): Promise<TxSubmitted> {
    const thorClient = (this.clients.THOR as unknown) as ThorchainClient
    const addParams = {
      asset: params.runeFee.asset,
      amount: params.runeFee.baseAmount,
      memo: memo,
    }
    const hash = await thorClient.deposit(addParams)
    return { hash, url: thorchainClient.getExplorerTxUrl(hash), waitTimeSeconds }
  }
}
