import { AVAXChain, Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { BNBChain, Client as BnbClient } from '@xchainjs/xchain-binance'
import { BTCChain, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { BCHChain, Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { BSCChain, Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { FeeOption, Network, Protocol, XChainClient, XChainClientParams } from '@xchainjs/xchain-client'
import { Client as CosmosClient, GAIAChain } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, DOGEChain, defaultDogeParams } from '@xchainjs/xchain-doge'
import { Client as EthClient, ETHChain, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { EVMClientParams } from '@xchainjs/xchain-evm'
import { Client as LtcClient, LTCChain, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { Client as MayaClient, MAYAChain, MayachainClientParams } from '@xchainjs/xchain-mayachain'
import { Client as ThorClient, THORChain, ThorchainClient, ThorchainClientParams } from '@xchainjs/xchain-thorchain'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Address, Asset, CryptoAmount, assetFromString } from '@xchainjs/xchain-util'
import { Client as UTXOClient, UtxoClientParams } from '@xchainjs/xchain-utxo'

import {
  AddLiquidity,
  AllBalances,
  ExecuteSwap,
  LoanCloseParams,
  LoanOpenParams,
  RegisterThornameParams,
  TxSubmitted,
  UpdateThornameParams,
  WithdrawLiquidity,
} from './types'
import { EvmHelper } from './utils/evm-helper'
/**
 * Represents the URLs for different network nodes.
 */
export type NodeUrls = Record<Network, string>
/**
 * Represents configurations for different blockchain chains.
 */
export type ChainConfigs = Partial<{
  [BTCChain]: Omit<UtxoClientParams, 'phrase' | 'network'>
  [BCHChain]: Omit<UtxoClientParams, 'phrase' | 'network'>
  [LTCChain]: Omit<UtxoClientParams, 'phrase' | 'network'>
  [DOGEChain]: Omit<UtxoClientParams, 'phrase' | 'network'>
  [ETHChain]: Omit<EVMClientParams, 'phrase' | 'network'>
  [AVAXChain]: Omit<EVMClientParams, 'phrase' | 'network'>
  [BSCChain]: Omit<EVMClientParams, 'phrase' | 'network'>
  [GAIAChain]: Omit<XChainClientParams, 'phrase' | 'network'>
  [BNBChain]: Omit<XChainClientParams, 'phrase' | 'network'>
  [THORChain]: Omit<XChainClientParams & ThorchainClientParams, 'phrase' | 'network'>
  [MAYAChain]: Omit<XChainClientParams & MayachainClientParams, 'phrase' | 'network'>
}>
/**
 * Wallet Class for managing all xchain-* wallets with a mnemonic seed.
 */
export class Wallet {
  private thorchainQuery: ThorchainQuery
  clients: Record<string, XChainClient>
  evmHelpers: Record<string, EvmHelper>
  /**
   * Contructor to create a Wallet
   *
   * @param phrase - Mnemonic phrase
   * @param thorchainCache - An instance of the ThorchainCache (could be pointing to stagenet,testnet,mainnet)
   * @param chainConfigs - Configuration settings for different blockchain chains
   * @returns Wallet
   */
  constructor(phrase: string, thorchainQuery: ThorchainQuery, chainConfigs: ChainConfigs = {}) {
    this.thorchainQuery = thorchainQuery

    const settings = { network: this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.network, phrase }
    this.clients = {
      BCH: new BchClient({ ...defaultBchParams, ...chainConfigs[BCHChain], ...settings }),
      BTC: new BtcClient({ ...defaultBtcParams, ...chainConfigs[BTCChain], ...settings }),
      DOGE: new DogeClient({ ...defaultDogeParams, ...chainConfigs[DOGEChain], ...settings }),
      LTC: new LtcClient({ ...defaultLtcParams, ...chainConfigs[LTCChain], ...settings }),
      THOR: new ThorClient({ ...chainConfigs[THORChain], ...settings }),
      BNB: new BnbClient({ ...chainConfigs[BNBChain], ...settings }),
      GAIA: new CosmosClient({ ...chainConfigs[GAIAChain], ...settings }),
      MAYA: new MayaClient({ ...chainConfigs[MAYAChain], ...settings }),
      ETH: new EthClient({ ...defaultEthParams, ...chainConfigs[ETHChain], ...settings }),
      AVAX: new AvaxClient({ ...defaultAvaxParams, ...chainConfigs[AVAXChain], ...settings }),
      BSC: new BscClient({ ...defaultBscParams, ...chainConfigs[BSCChain], ...settings }),
    }

    this.evmHelpers = {
      ETH: new EvmHelper(this.clients.ETH, this.thorchainQuery.thorchainCache),
      BSC: new EvmHelper(this.clients.BSC, this.thorchainQuery.thorchainCache),
      AVAX: new EvmHelper(this.clients.AVAX, this.thorchainQuery.thorchainCache),
    }
  }

  /**
   * Fetch the balance of all the chains.
   * @returns An array of AllBalances objects containing balance information for all chains
   */
  async getAllBalances(): Promise<AllBalances[]> {
    const allBalances: AllBalances[] = []
    // Loop through each chain's client and fetch the balance
    for (const [chain, client] of Object.entries(this.clients)) {
      // Get the wallet address for the current chain
      const address = await client.getAddressAsync(0)
      try {
        // Fetch the balance for the wallet address
        const balances = await client.getBalance(address)
        // Push the balance information to the allBalances array
        allBalances.push({ chain, address, balances })
      } catch (err) {
        // If an error occurs, push an error message to the allBalances array
        allBalances.push({ chain, address, balances: (err as Error).message })
      }
    }
    return allBalances
  }

  /**
   * Executes a swap using the provided swap details.
   * @param swap Object containing details required for the swap
   * @returns Object containing transaction details and explorer URL
   * @see ThorchainAMM.doSwap()
   */
  async executeSwap(swap: ExecuteSwap): Promise<TxSubmitted> {
    // Validate the swap details
    await this.validateSwap(swap)
    // Determine whether the destination asset is THORChain or a synthetic asset
    if (swap.input.asset.chain === THORChain || swap.input.asset.synth) {
      return await this.swapRuneTo(swap)
    } else {
      return await this.swapNonRune(swap)
    }
  }

  /** Validates the swap object details.
   * @param swap - Object containing swap parameters
   * @returns An array of validation errors
   */
  async validateSwap(swap: ExecuteSwap): Promise<string[]> {
    const errors: string[] = []
    const isThorchainDestinationAsset = swap.destinationAsset.synth || swap.destinationAsset.chain === THORChain
    const chain = isThorchainDestinationAsset ? THORChain : swap.destinationAsset.chain

    // Check if the destination address is valid
    if (swap.destinationAddress && !this.clients[chain].validateAddress(swap.destinationAddress)) {
      errors.push(`destinationAddress ${swap.destinationAddress} is not a valid address`)
    }

    // Affiliate address should be a valid THOR address or THORName
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
    // If input asset is synthetic, return errors
    if (swap.input.asset.synth) return errors
    // Check if the input asset is an ERC20 asset and whether the router has been approved to spend this amount
    if (this.isERC20Asset(swap.input.asset)) {
      const isApprovedResult = await this.evmHelpers[swap.input.asset.chain].isTCRouterApprovedToSpend(
        swap.input.asset,
        swap.input.baseAmount,
        swap.walletIndex,
      )

      if (!isApprovedResult) {
        errors.push('TC router has not been approved to spend this amount')
      }
    }

    return errors
  }
  /**
   * Checks if a given string is a valid THORName.
   * @param name - Name to check
   * @returns Boolean indicating whether the name is a valid THORName
   */
  private async isThorname(name: string): Promise<boolean> {
    const thornameDetails =
      await this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.getTHORNameDetails(name) // Update when thorchainCache expose getTHORNameDetails method
    return thornameDetails !== undefined
  }

  /** Swaps assets from RUNE to another asset.
   *
   * @param swap - Swap details parameter
   * @returns - Object containing transaction details and explorer URL
   */
  private async swapRuneTo(swap: ExecuteSwap): Promise<TxSubmitted> {
    const thorClient = this.clients.THOR as unknown as ThorchainClient
    const hash = await thorClient.deposit({
      amount: swap.input.baseAmount,
      asset: swap.input.asset,
      memo: swap.memo,
    })
    return { hash, url: this.clients.THOR.getExplorerTxUrl(hash) }
  }

  /** Swaps assets that are not RUNE.
   * @param swap - swap details object
   * @returns - Object containing transaction details and explorer URL
   */
  private async swapNonRune(swap: ExecuteSwap): Promise<TxSubmitted> {
    const client = this.clients[swap.input.asset.chain]
    // Retrieve inbound details for the asset's chain
    const inbound = (await this.thorchainQuery.thorchainCache.getInboundDetails())[swap.input.asset.chain]

    // Check if there is an inbound address for the asset's chain
    if (!inbound?.address) throw Error(`no asgard address found for ${swap.input.asset.chain}`)

    // Handle swaps for EVM chains
    if (this.isEVMChain(swap.input.asset)) {
      const params = {
        walletIndex: 0,
        asset: swap.input.asset,
        amount: swap.input.baseAmount,
        feeOption: swap.feeOption || FeeOption.Fast,
        memo: swap.memo,
      }
      const hash = await this.evmHelpers[swap.input.asset.chain].sendDeposit(params)
      return { hash, url: client.getExplorerTxUrl(hash) }
    } else {
      // Handle swaps for non-EVM chains
      const params = {
        walletIndex: 0,
        asset: swap.input.asset,
        amount: swap.input.baseAmount,
        recipient: inbound.address,
        memo: swap.memo,
      }
      const hash = await client.transfer(params)
      return { hash, url: client.getExplorerTxUrl(hash) }
    }
  }

  /** Handles adding liquidity to the pool.
   * BASED OFF https://dev.thorchain.or›g/thorchain-dev/network/memos
   * @param params Input parameters for adding liquidity
   * @returns An array of transaction details submitted
   */
  async addLiquidity(params: AddLiquidity): Promise<TxSubmitted[]> {
    const assetClient = this.clients[params.asset.asset.chain]
    const inboundAsgard = (await this.thorchainQuery.thorchainCache.getInboundDetails())[params.asset.asset.chain]
      .address
    const thorchainClient = this.clients[params.rune.asset.chain]
    const addressRune = await thorchainClient.getAddressAsync()
    const addressAsset = await assetClient.getAddressAsync()
    // const waitTimeSeconds = params.waitTimeSeconds
    let constructedMemo = ''
    const txSubmitted: TxSubmitted[] = []

    // Symmetrical add
    if (params.asset.assetAmount.gt(0) && params.rune.assetAmount.gt(0)) {
      constructedMemo = `+:${params.assetPool}:${addressRune}`
      txSubmitted.push(await this.addAssetLP(params, constructedMemo, assetClient, inboundAsgard))
      constructedMemo = `+:${params.assetPool}:${addressAsset}`
      txSubmitted.push(await this.addRuneLP(params, constructedMemo, thorchainClient))
      return txSubmitted
    } else if (params.asset.assetAmount.gt(0) && params.rune.assetAmount.eq(0)) {
      // Asymmetrical asset only
      constructedMemo = `+:${params.assetPool}`
      txSubmitted.push(await this.addAssetLP(params, constructedMemo, assetClient, inboundAsgard))
      return txSubmitted
    } else {
      // Asymmetrical rune only
      constructedMemo = `+:${params.assetPool}`
      txSubmitted.push(await this.addRuneLP(params, constructedMemo, thorchainClient))
      return txSubmitted
    }
  }

  /** Handles withdrawing liquidity from the pool.
   * @param params - Parameters required for liquidity position
   * @returns Object with transaction response, URL, and wait time in seconds
   */
  async withdrawLiquidity(params: WithdrawLiquidity): Promise<TxSubmitted[]> {
    const assetClient = this.clients[params.assetFee.asset.chain]
    const inboundAsgard = (await this.thorchainQuery.thorchainCache.getInboundDetails())[params.assetFee.asset.chain]
      .address
    // const waitTimeSeconds = params.waitTimeSeconds
    const thorchainClient = this.clients[params.runeFee.asset.chain]
    const basisPoints = (params.percentage * 100).toFixed() // convert to basis points
    let constructedMemo = ''
    const txSubmitted: TxSubmitted[] = []

    if (params.assetAddress && params.runeAddress) {
      constructedMemo = `-:${params.assetPool}:${basisPoints}`
      txSubmitted.push(await this.withdrawAssetLP(params, constructedMemo, assetClient, inboundAsgard))
      constructedMemo = `-:${params.assetPool}:${basisPoints}`
      txSubmitted.push(await this.withdrawRuneLP(params, constructedMemo, thorchainClient))
      return txSubmitted
    } else if (params.assetAddress && !params.runeAddress) {
      // Asymmetrical asset only
      constructedMemo = `-:${params.assetPool}:${basisPoints}`
      txSubmitted.push(await this.withdrawAssetLP(params, constructedMemo, assetClient, inboundAsgard))
      return txSubmitted
    } else {
      // Asymmetrical rune only
      constructedMemo = `-:${params.assetPool}:${basisPoints}`
      txSubmitted.push(await this.withdrawRuneLP(params, constructedMemo, thorchainClient))
      return txSubmitted
    }
  }

  /**
   * Adds funds to a savers account.
   * @param assetAmount - The amount of assets to add.
   * @param memo - The memo required for the transaction.
   * @param waitTimeSeconds - expected wait for the transaction to be processed
   * @returns An object containing transaction details and explorer URL.
   */
  async addSavers(assetAmount: CryptoAmount, memo: string, toAddress: Address): Promise<TxSubmitted> {
    const assetClient = this.clients[assetAmount.asset.chain]
    // Handle EVM chains
    if (this.isEVMChain(assetAmount.asset)) {
      const addParams = {
        wallIndex: 0,
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        feeOption: FeeOption.Fast,
        memo: memo,
      }
      const evmHelper = new EvmHelper(assetClient, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash) }
    } else if (this.isUTXOChain(assetAmount.asset)) {
      const feeRates = await (assetClient as UTXOClient).getFeeRates(Protocol.THORCHAIN)
      const addParams = {
        wallIndex: 0,
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        recipient: toAddress,
        memo: memo,
        feeRate: feeRates.fast,
      }
      try {
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(assetClient.getAddress()) }
      }
    } else {
      // Handle other chains
      const addParams = {
        wallIndex: 0,
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        recipient: toAddress,
        memo: memo,
      }
      try {
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(assetClient.getAddress()) }
      }
    }
  }
  /**
   * Withdraws funds from a savers account.
   * @param assetAmount - The amount of assets to withdraw.
   * @param memo - The memo required for the transaction.
   * @param waitTimeSeconds - expected wait for the transaction to be processed
   * @returns An object containing transaction details and explorer URL.
   */
  async withdrawSavers(assetAmount: CryptoAmount, memo: string, toAddress: Address): Promise<TxSubmitted> {
    const assetClient = this.clients[assetAmount.asset.chain]
    // Handle EVM chains
    if (this.isEVMChain(assetAmount.asset)) {
      const addParams = {
        wallIndex: 0,
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        feeOption: FeeOption.Fast,
        memo: memo,
      }
      const evmHelper = new EvmHelper(assetClient, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash) }
    } else if (this.isUTXOChain(assetAmount.asset)) {
      const feeRates = await (assetClient as UTXOClient).getFeeRates(Protocol.THORCHAIN)
      const addParams = {
        wallIndex: 0,
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        recipient: toAddress,
        memo: memo,
        feeRate: feeRates.fast,
      }
      try {
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: await assetClient.getExplorerAddressUrl(await assetClient.getAddressAsync()) }
      }
    } else {
      // Handle other chains
      const addParams = {
        wallIndex: 0,
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        recipient: toAddress,
        memo: memo,
      }
      try {
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: await assetClient.getExplorerAddressUrl(await assetClient.getAddressAsync()) }
      }
    }
  }

  /**
   * Opens a new loan.
   * @param params - Parameters required to open a loan.
   * @returns An object containing transaction details and explorer URL.
   */
  async loanOpen(params: LoanOpenParams): Promise<TxSubmitted> {
    const assetClient = this.clients[params.amount.asset.chain]
    // Handle EVM chains
    if (this.isEVMChain(params.amount.asset)) {
      const addParams = {
        wallIndex: 0,
        asset: params.amount.asset,
        amount: params.amount.baseAmount,
        feeOption: FeeOption.Fast,
        memo: params.memo,
      }
      const evmHelper = new EvmHelper(assetClient, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash) }
    } else if (this.isUTXOChain(params.amount.asset)) {
      const feeRates = await (assetClient as UTXOClient).getFeeRates(Protocol.THORCHAIN)
      const addParams = {
        wallIndex: 0,
        asset: params.amount.asset,
        amount: params.amount.baseAmount,
        recipient: params.toAddress,
        memo: params.memo,
        feeRate: feeRates.fast,
      }
      try {
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(await assetClient.getAddressAsync()) }
      }
    } else {
      // Handle other chains
      const addParams = {
        wallIndex: 0,
        asset: params.amount.asset,
        amount: params.amount.baseAmount,
        recipient: params.toAddress,
        memo: params.memo,
      }
      try {
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(await assetClient.getAddressAsync()) }
      }
    }
  }
  /**
   * Closes an existing loan.
   * @param params - Parameters required to close a loan.
   * @returns An object containing transaction details and explorer URL.
   */
  async loanClose(params: LoanCloseParams): Promise<TxSubmitted> {
    const assetClient = this.clients[params.amount.asset.chain]
    // Handle EVM chains
    if (this.isEVMChain(params.amount.asset)) {
      const addParams = {
        wallIndex: 0,
        asset: params.amount.asset,
        amount: params.amount.baseAmount,
        feeOption: FeeOption.Fast,
        memo: params.memo,
      }
      const evmHelper = new EvmHelper(assetClient, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash) }
    } else if (this.isUTXOChain(params.amount.asset)) {
      const feeRates = await (assetClient as UTXOClient).getFeeRates(Protocol.THORCHAIN)
      const addParams = {
        wallIndex: 0,
        asset: params.amount.asset,
        amount: params.amount.baseAmount,
        recipient: params.toAddress,
        memo: params.memo,
        feeRate: feeRates.average,
      }
      try {
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(await assetClient.getAddressAsync()) }
      }
    } else {
      // Handle other chains
      const addParams = {
        wallIndex: 0,
        asset: params.amount.asset,
        amount: params.amount.baseAmount,
        recipient: params.toAddress,
        memo: params.memo,
      }
      try {
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(await assetClient.getAddressAsync()) }
      }
    }
  }

  /**Registers a THORName with default parameters.
   * Register a THORName with a default expirity of one year. By default chain and chainAddress is getting from wallet instance and is BTC.
   * By default owner is getting from wallet
   * @param thorname - Name to register
   * @param chain - Chain to add alias
   * @param chainAddress - Address to add to chain alias
   * @param owner - Owner address (rune address)
   * @param preferredAsset - referred asset
   * @param expirity - expirity of the domain in MILLISECONDS
   * @param isUpdate - true only if the domain is already register and you want to update its data
   * @returns memo and value of deposit
   */
  async registerThorname(params: RegisterThornameParams) {
    // Obtain the client corresponding to the specified chain or default to BTCChain
    const chainClient = this.clients[params.chain || BTCChain]
    const thorClient = this.clients.THOR
    // Check if both chainClient and thorClient exist
    if (!chainClient || !thorClient) {
      throw Error('Can not find a wallet client')
    }
    // Estimate the THORName registration fee
    const thornameEstimation = await this.thorchainQuery.estimateThorname({
      ...params,
      chain: params.chain || BTCChain,
      chainAddress: params.chainAddress || (await chainClient.getAddressAsync()),
      owner: params.owner || (await thorClient.getAddressAsync()),
    })
    // Cast thorClient to ThorchainClient
    const castedThorClient = thorClient as unknown as ThorchainClient
    // Deposit the registration fee for the THORName
    const result = await castedThorClient.deposit({
      asset: thornameEstimation.value.asset,
      amount: thornameEstimation.value.baseAmount,
      memo: thornameEstimation.memo,
    })

    return result
  }

  /**Updates an existing THORName with default parameters.
   * Register a THORName with a default expirity of one year. By default chain and chainAddress is getting from wallet instance and is BTC.
   * By default owner is getting from wallet
   * @param thorname - Name to register
   * @param chain - Chain to add alias
   * @param chainAddress - Address to add to chain alias
   * @param owner - Owner address (rune address)
   * @param preferredAsset - referred asset
   * @param expirity - expirity of the domain in MILLISECONDS
   * @returns memo and value of deposit
   */
  async updateThorname(params: UpdateThornameParams) {
    // Obtain the client corresponding to the specified chain or default to BTCChain
    const chainClient = this.clients[params.chain || BTCChain]
    const thorClient = this.clients.THOR
    // Check if both chainClient and thorClient exist
    if (!chainClient || !thorClient) {
      throw Error('Can not find a wallet client')
    }
    // Retrieve details of the existing THORName
    const thornameDetail = await this.thorchainQuery.getThornameDetails(params.thorname)
    // Verify ownership of the THORName
    if (thornameDetail?.owner !== (await thorClient.getAddressAsync())) {
      throw Error('You cannot update a domain that is not yours')
    }
    // Estimate the updated THORName registration fee
    const thornameEstimation = await this.thorchainQuery.estimateThorname({
      ...params,
      chain: params.chain || BTCChain,
      isUpdate: true,
      preferredAsset: params.preferredAsset || assetFromString(thornameDetail.preferredAsset),
      chainAddress: params.chainAddress || (await chainClient.getAddressAsync()),
    })
    // Cast thorClient to ThorchainClient
    const castedThorClient = thorClient as unknown as ThorchainClient
    // Deposit the updated registration fee for the THORName
    const result = await castedThorClient.deposit({
      asset: thornameEstimation.value.asset,
      amount: thornameEstimation.value.baseAmount,
      memo: thornameEstimation.memo,
    })

    return result
  }

  /** Handles liquidity addition for non-RUNE assets.
   * @param params - Parameters for add liquidity
   * @param constructedMemo - Memo needed for thorchain
   * @param waitTimeSeconds - Wait time for the tx to be confirmed
   * @param assetClient - XChainClient for the asset.
   * @param inboundAsgard - Inbound Asgard address for the LP.
   * @returns - Transaction object.
   */
  private async addAssetLP(
    params: AddLiquidity,
    constructedMemo: string,
    assetClient: XChainClient,
    inboundAsgard: string,
  ): Promise<TxSubmitted> {
    // Handle EVM chains
    if (this.isEVMChain(params.asset.asset)) {
      // Prepare parameters for sending a deposit on EVM chains
      const addParams = {
        wallIndex: 0,
        asset: params.asset.asset,
        amount: params.asset.baseAmount,
        feeOption: FeeOption.Fast,
        memo: constructedMemo,
      }
      const evmHelper = new EvmHelper(assetClient, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash) }
    } else if (this.isUTXOChain(params.asset.asset)) {
      // Handle UTXO chains
      // Get fee rates for UTXO chains
      const feeRates = await (assetClient as UTXOClient).getFeeRates(Protocol.THORCHAIN)
      // Prepare parameters for transferring assets on UTXO chains
      const addParams = {
        wallIndex: 0,
        asset: params.asset.asset,
        amount: params.asset.baseAmount,
        recipient: inboundAsgard,
        memo: constructedMemo,
        feeRate: feeRates.fast,
      }
      try {
        // Transfer assets with the provided parameters
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        // If an error occurs during the transfer, handle it and return the error message along with the explorer URL of the asset client's address
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(await assetClient.getAddressAsync()) }
      }
    } else {
      // Handle other chains
      // Prepare parameters for transferring assets on other chains
      const addParams = {
        wallIndex: 0,
        asset: params.asset.asset,
        amount: params.asset.baseAmount,
        recipient: inboundAsgard,
        memo: constructedMemo,
      }
      try {
        // Transfer assets with the provided parameters
        const hash = await assetClient.transfer(addParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        // If an error occurs during the transfer, handle it and return the error message along with the explorer URL of the asset client's address
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(await assetClient.getAddressAsync()) }
      }
    }
  }
  /** Handles liquidity withdrawal for non-RUNE assets.
   * @param params - Parameters for withdrawing liquidity.
   * @param constructedMemo - Memo needed for Thorchain execution.
   * @param assetClient - Asset client to call transfer.
   * @param waitTimeSeconds - Return back estimated wait
   * @param inboundAsgard - Destination address.
   * @returns - Transaction object.
   */
  private async withdrawAssetLP(
    params: WithdrawLiquidity,
    constructedMemo: string,
    assetClient: XChainClient,
    inboundAsgard: string,
  ): Promise<TxSubmitted> {
    // Handle EVM chains
    if (this.isEVMChain(params.assetFee.asset)) {
      // Prepare parameters for sending a deposit on EVM chains
      const withdrawParams = {
        wallIndex: 0,
        asset: params.assetFee.asset,
        amount: params.assetFee.baseAmount,
        feeOption: FeeOption.Fast,
        memo: constructedMemo,
      }
      const evmHelper = new EvmHelper(assetClient, this.thorchainQuery.thorchainCache)
      const hash = await evmHelper.sendDeposit(withdrawParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash) }
    } else if (this.isUTXOChain(params.assetFee.asset)) {
      // Handle UTXO chains
      const feeRates = await (assetClient as UTXOClient).getFeeRates(Protocol.THORCHAIN)
      // Prepare parameters for transferring assets on UTXO chains
      const withdrawParams = {
        wallIndex: 0,
        asset: params.assetFee.asset,
        amount: params.assetFee.baseAmount,
        recipient: inboundAsgard,
        memo: constructedMemo,
        feeRate: feeRates.fast,
      }
      try {
        // Transfer assets with the provided parameters
        const hash = await assetClient.transfer(withdrawParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        // If an error occurs during the transfer, handle it and return the error message along with the explorer URL of the asset client's address
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(await assetClient.getAddressAsync()) }
      }
    } else {
      // Handle other chains
      const withdrawParams = {
        wallIndex: 0,
        asset: params.assetFee.asset,
        amount: params.assetFee.baseAmount,
        recipient: inboundAsgard,
        memo: constructedMemo,
      }
      try {
        // Transfer assets with the provided parameters
        const hash = await assetClient.transfer(withdrawParams)
        return { hash, url: assetClient.getExplorerTxUrl(hash) }
      } catch (err) {
        // If an error occurs during the transfer, handle it and return the error message along with the explorer URL of the asset client's address
        const hash = JSON.stringify(err)
        return { hash, url: assetClient.getExplorerAddressUrl(await assetClient.getAddressAsync()) }
      }
    }
  }

  /** Handles liquidity addition for Rune only.
   * @param params - Deposit parameters
   * @param memo - Memo needed to withdraw lp
   * @returns - Transaction object.
   */
  private async addRuneLP(params: AddLiquidity, memo: string, thorchainClient: XChainClient): Promise<TxSubmitted> {
    const thorClient = this.clients.THOR as unknown as ThorchainClient
    const addParams = {
      asset: params.rune.asset,
      amount: params.rune.baseAmount,
      memo: memo,
    }
    const hash = await thorClient.deposit(addParams)
    return { hash, url: thorchainClient.getExplorerTxUrl(hash) }
  }
  /** Handles liquidity withdrawal for Rune only.
   * @param params - Withdraw parameters
   * @param memo - Memo needed to withdraw lp
   * @returns - Transaction object.
   */
  private async withdrawRuneLP(
    params: WithdrawLiquidity,
    memo: string,
    thorchainClient: XChainClient,
  ): Promise<TxSubmitted> {
    const thorClient = this.clients.THOR as unknown as ThorchainClient
    const addParams = {
      asset: params.runeFee.asset,
      amount: params.runeFee.baseAmount,
      memo: memo,
    }
    const hash = await thorClient.deposit(addParams)
    return { hash, url: thorchainClient.getExplorerTxUrl(hash) }
  }
  /**
   * Checks if an asset is an ERC20 asset.
   * @param asset - Asset to check.
   * @returns - Boolean indicating whether the asset is an ERC20 asset.
   */
  private isERC20Asset(asset: Asset): boolean {
    const isGasAsset = ['ETH', 'BSC', 'AVAX'].includes(asset.symbol)
    return this.isEVMChain(asset) && !isGasAsset
  }
  /**
   * Checks if an asset belongs to an EVM chain.
   * @param asset - Asset to check.
   * @returns - Boolean indicating whether the asset belongs to an EVM chain.
   */
  private isEVMChain(asset: Asset): boolean {
    const isEvmChain = ['ETH', 'BSC', 'AVAX'].includes(asset.chain)
    return isEvmChain
  }
  /**
   * Checks if an asset belongs to a UTXO chain.
   * @param asset - Asset to check.
   * @returns - Boolean indicating whether the asset belongs to a UTXO chain.
   */
  private isUTXOChain(asset: Asset): boolean {
    return ['BTC', 'BCH', 'DOGE'].includes(asset.chain)
  }
}
