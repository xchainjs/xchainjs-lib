import { AssetAVAX, Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { AssetBSC, Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Network, Protocol } from '@xchainjs/xchain-client'
import { Client as GaiaClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { AssetETH, Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { abi } from '@xchainjs/xchain-evm'
import { Client as LtcClient, defaultLtcParams } from '@xchainjs/xchain-litecoin'
import { Client as ThorClient, THORChain, defaultClientConfig as defaultThorParams } from '@xchainjs/xchain-thorchain'
import {
  AddliquidityPosition,
  EstimateAddLP,
  EstimateAddSaver,
  EstimateWithdrawLP,
  EstimateWithdrawSaver,
  LoanCloseParams,
  LoanCloseQuote,
  LoanOpenParams,
  LoanOpenQuote,
  QuoteSwapParams,
  SaversPosition,
  SaversWithdraw,
  ThorchainQuery,
  TxDetails,
  WithdrawLiquidityPosition,
  getSaver,
} from '@xchainjs/xchain-thorchain-query'
import { Asset, Chain, CryptoAmount, getContractAddressFromAsset } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
import { ethers } from 'ethers'

import { AddLiquidity, IsApprovedParams, TxSubmitted, WithdrawLiquidity } from './types'

/**
 * THORChain Class for interacting with THORChain.
 * Recommended main class to use for swapping with THORChain
 * Has access to Midgard and THORNode data
 */
export class ThorchainAMM {
  private thorchainQuery: ThorchainQuery
  private wallet: Wallet

  /**
   * Constructor to create a ThorchainAMM
   *
   * @param thorchainQuery - an instance of the ThorchainQuery
   * @returns ThorchainAMM
   */
  constructor(
    thorchainQuery = new ThorchainQuery(),
    wallet = new Wallet({
      BTC: new BtcClient({ ...defaultBtcParams, network: Network.Mainnet }),
      BCH: new BchClient({ ...defaultBchParams, network: Network.Mainnet }),
      LTC: new LtcClient({ ...defaultLtcParams, network: Network.Mainnet }),
      DOGE: new DogeClient({ ...defaultDogeParams, network: Network.Mainnet }),
      ETH: new EthClient({ ...defaultEthParams, network: Network.Mainnet }),
      AVAX: new AvaxClient({ ...defaultAvaxParams, network: Network.Mainnet }),
      BSC: new BscClient({ ...defaultBscParams, network: Network.Mainnet }),
      GAIA: new GaiaClient({ network: Network.Mainnet }),
      BNB: new BnbClient({ network: Network.Mainnet }),
      THOR: new ThorClient({ ...defaultThorParams, network: Network.Mainnet }),
    }),
  ) {
    this.thorchainQuery = thorchainQuery
    this.wallet = wallet
  }

  /**
   * Provides a swap estimate for the given swap detail. Will check the params for errors before trying to get the estimate.
   * Uses current pool data, works out inbound and outboud fee, affiliate fees and works out the expected wait time for the swap (in and out)
   *
   * @param params - amount to swap

   * @returns The SwapEstimate
   */
  public async estimateSwap({
    fromAddress,
    fromAsset,
    amount,
    destinationAsset,
    destinationAddress,
    affiliateAddress = '',
    affiliateBps = 0,
    toleranceBps,
  }: QuoteSwapParams): Promise<TxDetails> {
    const errors: string[] = await this.validateSwap({
      fromAddress,
      fromAsset,
      amount,
      destinationAsset,
      destinationAddress,
    })
    const estimate = await this.thorchainQuery.quoteSwap({
      fromAsset,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      toleranceBps,
    })
    estimate.txEstimate.errors.push(...errors)
    estimate.txEstimate.canSwap = errors.length == 0
    return estimate
  }

  /**
   * Validate swap params
   * @param {QuoteSwapParams} quoteSwapParams Swap params
   * @returns {string[]} the reasons the swap can not be done. If it is empty there are no reason to avoid the swap
   */
  public async validateSwap({
    fromAsset,
    fromAddress,
    destinationAsset,
    destinationAddress,
    amount,
    affiliateAddress,
    affiliateBps,
  }: QuoteSwapParams): Promise<string[]> {
    const errors: string[] = []

    if (destinationAddress && !this.wallet.validateAddress(destinationAsset.chain, destinationAddress)) {
      errors.push(`destinationAddress ${destinationAddress} is not a valid address`)
    }

    if (affiliateAddress) {
      const isMayaAddress = this.wallet.validateAddress(THORChain, affiliateAddress)
      const isMayaName = await this.isTHORName(affiliateAddress)
      if (!(isMayaAddress || isMayaName))
        errors.push(`affiliateAddress ${affiliateAddress} is not a valid MAYA address`)
    }

    if (affiliateBps && (affiliateBps < 0 || affiliateBps > 10000)) {
      errors.push(`affiliateBps ${affiliateBps} out of range [0 - 10000]`)
    }

    if (this.isERC20Asset(fromAsset) && fromAddress) {
      const approveErrors = await this.isRouterApprovedToSpend({
        asset: fromAsset,
        address: fromAddress,
        amount,
      })
      errors.push(...approveErrors)
    }

    return errors
  }

  /**
   * Conducts a swap with the given inputs. Should be called after estimateSwap() to ensure the swap is valid
   *
   * @param wallet - wallet to use
   * @param params - swap params
   * @returns {SwapSubmitted} - Tx Hash, URL of BlockExplorer and expected wait time.
   */
  public async doSwap({
    fromAsset,
    fromAddress,
    amount,
    destinationAsset,
    destinationAddress,
    affiliateAddress,
    affiliateBps,
    toleranceBps,
  }: QuoteSwapParams): Promise<TxSubmitted> {
    // Thorchain-query call satisfies the data needed for executeSwap to be called.
    const txDetails = await this.thorchainQuery.quoteSwap({
      fromAsset,
      fromAddress,
      amount,
      destinationAsset,
      destinationAddress,
      affiliateAddress,
      affiliateBps,
      toleranceBps,
    })
    if (!txDetails.txEstimate.canSwap) {
      throw Error(txDetails.txEstimate.errors.join('\n'))
    }

    return fromAsset.chain === THORChain || fromAsset.synth
      ? this.doProtocolAssetSwap(amount, txDetails.memo)
      : this.doNonProtocolAssetSwap(amount, txDetails.toAddress, txDetails.memo)
  }

  /**
   * Validate if the asset router is allowed to spend the asset amount in name of the address
   * @param {IsApprovedParams} isApprovedParams contains the asset and the amount the router is supposed to spend
   * int name of address
   * @returns {string[]} the reasons the router of the asset is not allowed to spend the amount. If it is empty, the asset router is allowed to spend the amount
   */
  public async isRouterApprovedToSpend({ asset, amount, address }: IsApprovedParams): Promise<string[]> {
    const errors: string[] = []

    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router address for ${asset.chain}`)

    const isApprovedResult = await this.wallet.isApproved(asset, amount.baseAmount, address, inboundDetails.router)

    if (!isApprovedResult) errors.push('Thorchain router has not been approved to spend this amount')

    return errors
  }

  /**
   * Wraps estimate from thorchain query
   * @param params - estimate add liquidity
   * @returns - Estimate add lp object
   */
  public async estimateAddLiquidity(params: AddliquidityPosition): Promise<EstimateAddLP> {
    return await this.thorchainQuery.estimateAddLP(params)
  }

  /**
   * Wraps estimate withdraw from thorchain query
   * @param params - estimate withdraw liquidity
   * @returns - Estimate withdraw lp object
   */
  public async estimateWithdrawLiquidity(params: WithdrawLiquidityPosition): Promise<EstimateWithdrawLP> {
    return await this.thorchainQuery.estimateWithdrawLP(params)
  }

  /**
   *
   * @param params - liquidity parameters
   * @returns
   */
  public async addLiquidityPosition(params: AddliquidityPosition): Promise<TxSubmitted[]> {
    // Check amounts are greater than fees and use return estimated wait
    const checkLPAdd = await this.thorchainQuery.estimateAddLP(params)
    if (!checkLPAdd.canAdd) throw Error(`${checkLPAdd.errors}`)

    const inboundAsgard = (await this.thorchainQuery.thorchainCache.getInboundDetails())[params.asset.asset.chain]
      .address

    const addressRune = await this.wallet.getAddress(THORChain)
    const addressAsset = await this.wallet.getAddress(params.asset.asset.chain)
    // const waitTimeSeconds = params.waitTimeSeconds
    let constructedMemo = ''
    const txSubmitted: TxSubmitted[] = []

    const addLiquidity: AddLiquidity = {
      asset: params.asset,
      rune: params.rune,
      waitTimeSeconds: checkLPAdd.estimatedWaitSeconds,
      assetPool: checkLPAdd.assetPool,
    }
    // symmetrical add
    if (params.asset.assetAmount.gt(0) && params.rune.assetAmount.gt(0)) {
      constructedMemo = `+:${checkLPAdd.assetPool}:${addressRune}`
      txSubmitted.push(
        await this.addNonProtocolAssetLP(addLiquidity, constructedMemo, params.asset.asset.chain, inboundAsgard),
      )
      constructedMemo = `+:${checkLPAdd.assetPool}:${addressAsset}`
      txSubmitted.push(await this.addProtocolAssetLP(addLiquidity, constructedMemo))
      return txSubmitted
    } else if (params.asset.assetAmount.gt(0) && params.rune.assetAmount.eq(0)) {
      // asymmetrical asset only
      constructedMemo = `+:${checkLPAdd.assetPool}`
      txSubmitted.push(
        await this.addNonProtocolAssetLP(addLiquidity, constructedMemo, params.asset.asset.chain, inboundAsgard),
      )
      return txSubmitted
    } else {
      // asymmetrical rune only
      constructedMemo = `+:${checkLPAdd.assetPool}`
      txSubmitted.push(await this.addProtocolAssetLP(addLiquidity, constructedMemo))
      return txSubmitted
    }
  }

  /**
   *
   * @param wallet - wallet needed to perform tx
   * @return
   */
  public async withdrawLiquidityPosition(params: WithdrawLiquidityPosition): Promise<TxSubmitted[]> {
    // Caution Dust Limits: BTC,BCH,LTC chains 10k sats; DOGE 1m Sats; ETH 0 wei; THOR 0 RUNE.
    const withdrawParams = await this.thorchainQuery.estimateWithdrawLP(params)

    const withdrawLiquidity: WithdrawLiquidity = {
      assetFee: withdrawParams.inbound.fees.asset,
      runeFee: withdrawParams.inbound.fees.rune,
      waitTimeSeconds: withdrawParams.estimatedWaitSeconds,
      percentage: params.percentage,
      assetPool: withdrawParams.assetPool,
      assetAddress: withdrawParams.assetAddress,
      runeAddress: withdrawParams.runeAddress,
    }

    const inboundAsgard = (await this.thorchainQuery.thorchainCache.getInboundDetails())[
      withdrawLiquidity.assetFee.asset.chain
    ].address

    // const waitTimeSeconds = params.waitTimeSeconds
    const basisPoints = (withdrawLiquidity.percentage * 100).toFixed() // convert to basis points
    let constructedMemo = ''
    const txSubmitted: TxSubmitted[] = []

    if (withdrawLiquidity.assetAddress && withdrawLiquidity.runeAddress) {
      constructedMemo = `-:${withdrawLiquidity.assetPool}:${basisPoints}`
      txSubmitted.push(
        await this.withdrawNonProtocolAssetLP(
          withdrawLiquidity,
          constructedMemo,
          withdrawLiquidity.assetFee.asset.chain,
          inboundAsgard,
        ),
      )
      constructedMemo = `-:${withdrawLiquidity.assetPool}:${basisPoints}`
      txSubmitted.push(await this.withdrawProtocolLP(withdrawLiquidity, constructedMemo))
      return txSubmitted
    } else if (withdrawLiquidity.assetAddress && !withdrawLiquidity.runeAddress) {
      // asymmetrical asset only
      constructedMemo = `-:${withdrawLiquidity.assetPool}:${basisPoints}`
      txSubmitted.push(
        await this.withdrawNonProtocolAssetLP(
          withdrawLiquidity,
          constructedMemo,
          withdrawLiquidity.assetFee.asset.chain,
          inboundAsgard,
        ),
      )
      return txSubmitted
    } else {
      // asymmetrical rune only
      constructedMemo = `-:${withdrawLiquidity.assetPool}:${basisPoints}`
      txSubmitted.push(await this.withdrawProtocolLP(withdrawLiquidity, constructedMemo))
      return txSubmitted
    }
  }

  /**
   *
   * @param addAssetAmount
   * @returns
   */
  public async estimateAddSaver(addAssetAmount: CryptoAmount): Promise<EstimateAddSaver> {
    return await this.thorchainQuery.estimateAddSaver(addAssetAmount)
  }
  /**
   *
   * @param withdrawParams
   * @returns
   */
  public async estimateWithdrawSaver(withdrawParams: SaversWithdraw): Promise<EstimateWithdrawSaver> {
    return await this.thorchainQuery.estimateWithdrawSaver(withdrawParams)
  }

  /**
   *
   * @param getsaver
   * @returns
   */
  public async getSaverPosition(getsaver: getSaver): Promise<SaversPosition> {
    return await this.thorchainQuery.getSaverPosition(getsaver)
  }

  /**
   *
   * @param wallet - wallet needed to execute tx
   * @param addAssetAmount - asset amount being added to savers
   * @returns - submitted tx
   */
  public async addSaver(addAssetAmount: CryptoAmount): Promise<TxSubmitted> {
    const addEstimate = await this.thorchainQuery.estimateAddSaver(addAssetAmount)
    if (!addEstimate.canAddSaver) throw Error(`Cannot add to savers`)

    const feeRates = await this.wallet.getFeeRates(addAssetAmount.asset.chain, Protocol.THORCHAIN)

    if (!this.isERC20Asset(addAssetAmount.asset)) {
      const hash = await this.wallet.transfer({
        asset: addAssetAmount.asset,
        recipient: addEstimate.toAddress,
        memo: addEstimate.memo,
        feeRate: feeRates.fast,
        amount: addAssetAmount.baseAmount,
      })
      return { hash, url: await this.wallet.getExplorerTxUrl(addAssetAmount.asset.chain, hash) }
    }

    // ERC-20 transfer
    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(addAssetAmount.asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router for ${addAssetAmount.asset.chain} chain`)

    const address = await this.wallet.getAddress(addAssetAmount.asset.chain)

    const isApprovedResult = await this.isRouterApprovedToSpend({
      asset: addAssetAmount.asset,
      amount: addAssetAmount,
      address,
    })
    if (!isApprovedResult) {
      throw new Error('The amount is not allowed to spend')
    }
    const inboundAsgard = (await this.thorchainQuery.thorchainCache.getInboundDetails())[addAssetAmount.asset.chain]
      .address
    const contractAddress = getContractAddressFromAsset(addAssetAmount.asset)
    const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)
    const expiration = Math.floor(new Date(new Date().getTime() + 15 * 60000).getTime() / 1000)
    const depositParams = [
      inboundAsgard,
      checkSummedContractAddress,
      addAssetAmount.baseAmount.amount().toFixed(),
      addEstimate.memo,
      expiration,
    ]

    const routerContract = new ethers.Contract(inboundDetails.router, abi.router)
    const wallet = this.wallet.getChainWallet(addAssetAmount.asset.chain)
    const gasLimit = '160000'

    const unsignedTx = await routerContract.populateTransaction.depositWithExpiry(...depositParams, {
      from: address,
      value: 0,
      gasPrice: feeRates.fast.amount().toFixed(),
      gasLimit: gasLimit,
    })
    const { hash } = await wallet.sendTransaction(unsignedTx)
    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(addAssetAmount.asset.chain, hash),
    }
  }

  /**
   *
   * @param loanOpenParams
   * @returns
   */
  public async getLoanQuoteOpen(loanOpenParams: LoanOpenParams): Promise<LoanOpenQuote> {
    return await this.thorchainQuery.getLoanQuoteOpen(loanOpenParams)
  }

  /**
   *
   * @param loanCloseParams
   * @returns
   */
  public async getLoanQuoteClose(loanCloseParams: LoanCloseParams): Promise<LoanCloseQuote> {
    return await this.thorchainQuery.getLoanQuoteClose(loanCloseParams)
  }

  /**
   *
   * @param wallet - wallet to execute the transaction
   * @param withdrawParams - params needed for withdraw
   * @returns
   */
  public async withdrawSaver(withdrawParams: SaversWithdraw): Promise<TxSubmitted> {
    const withdrawEstimate = await this.thorchainQuery.estimateWithdrawSaver(withdrawParams)
    if (withdrawEstimate.errors.length > 0) throw Error(`${withdrawEstimate.errors}`)

    const feeRates = await this.wallet.getFeeRates(withdrawEstimate.dustAmount.asset.chain, Protocol.THORCHAIN)

    if (!this.isERC20Asset(withdrawEstimate.dustAmount.asset)) {
      const hash = await this.wallet.transfer({
        asset: withdrawEstimate.dustAmount.asset,
        recipient: withdrawEstimate.toAddress,
        memo: withdrawEstimate.memo,
        feeRate: feeRates.fast,
        amount: withdrawEstimate.dustAmount.baseAmount,
      })
      return { hash, url: await this.wallet.getExplorerTxUrl(withdrawEstimate.dustAmount.asset.chain, hash) }
    }

    // ERC-20 transfer
    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(withdrawEstimate.dustAmount.asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router for ${withdrawEstimate.dustAmount.asset.chain} chain`)

    const address = await this.wallet.getAddress(withdrawEstimate.dustAmount.asset.chain)

    const isApprovedResult = await this.isRouterApprovedToSpend({
      asset: withdrawEstimate.dustAmount.asset,
      amount: withdrawEstimate.dustAmount,
      address,
    })
    if (!isApprovedResult) {
      throw new Error('The amount is not allowed to spend')
    }
    const inboundAsgard = (await this.thorchainQuery.thorchainCache.getInboundDetails())[
      withdrawEstimate.dustAmount.asset.chain
    ].address
    const contractAddress = getContractAddressFromAsset(withdrawEstimate.dustAmount.asset)
    const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)
    const expiration = Math.floor(new Date(new Date().getTime() + 15 * 60000).getTime() / 1000)
    const depositParams = [
      inboundAsgard,
      checkSummedContractAddress,
      withdrawEstimate.dustAmount.baseAmount.amount().toFixed(),
      withdrawEstimate.memo,
      expiration,
    ]

    const routerContract = new ethers.Contract(inboundDetails.router, abi.router)
    const wallet = this.wallet.getChainWallet(withdrawEstimate.dustAmount.asset.chain)
    const gasLimit = '160000'

    const unsignedTx = await routerContract.populateTransaction.depositWithExpiry(...depositParams, {
      from: address,
      value: 0,
      gasPrice: feeRates.fast.amount().toFixed(),
      gasLimit: gasLimit,
    })
    const { hash } = await wallet.sendTransaction(unsignedTx)
    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(withdrawEstimate.dustAmount.asset.chain, hash),
    }
  }

  /**
   *
   * @param wallet - wallet needed to execute transaction
   * @param loanOpenParams - params needed to open the loan
   * @returns - submitted tx
   */
  public async addLoan(loanOpenParams: LoanOpenParams): Promise<TxSubmitted> {
    const loanOpen: LoanOpenQuote = await this.thorchainQuery.getLoanQuoteOpen(loanOpenParams)
    if (loanOpen.errors.length > 0) throw Error(`${loanOpen.errors}`)

    // Non ERC20 swaps
    if (!this.isERC20Asset(loanOpenParams.amount.asset)) {
      const hash = await this.wallet.transfer({
        asset: loanOpenParams.amount.asset,
        amount: loanOpenParams.amount.baseAmount,
        recipient: loanOpen.inboundAddress as string,
        memo: loanOpen.memo,
      })
      return {
        hash,
        url: await this.wallet.getExplorerTxUrl(loanOpenParams.amount.asset.chain, hash),
      }
    }

    // ERC20 swaps
    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(loanOpenParams.amount.asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router for ${loanOpenParams.amount.asset.chain} chain`)
    const contractAddress = getContractAddressFromAsset(loanOpenParams.amount.asset)
    const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)

    const expiration = Math.floor(new Date(new Date().getTime() + 15 * 60000).getTime() / 1000)
    const depositParams = [
      loanOpen.inboundAddress as string,
      checkSummedContractAddress,
      loanOpenParams.amount.baseAmount.amount().toFixed(),
      loanOpen.memo,
      expiration,
    ]

    const routerContract = new ethers.Contract(inboundDetails.router, abi.router)
    const wallet = this.wallet.getChainWallet(loanOpenParams.amount.asset.chain)

    const gasPrices = await this.wallet.getGasFeeRates(loanOpenParams.amount.asset.chain)

    const unsignedTx = await routerContract.populateTransaction.depositWithExpiry(...depositParams, {
      from: this.wallet.getAddress(loanOpenParams.amount.asset.chain),
      value: 0,
      gasPrice: gasPrices.fast.amount().toFixed(),
      gasLimit: '160000',
    })

    const { hash } = await wallet.sendTransaction(unsignedTx)
    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(loanOpenParams.amount.asset.chain, hash),
    }
  }

  /**
   *
   * @param wallet - wallet to execute the transaction
   * @param loanCloseParams - params needed for withdrawing the loan
   * @returns
   */
  public async withdrawLoan(loanCloseParams: LoanCloseParams): Promise<TxSubmitted> {
    const withdrawLoan = await this.thorchainQuery.getLoanQuoteClose(loanCloseParams)
    if (withdrawLoan.errors.length > 0) throw Error(`${withdrawLoan.errors}`)
    // return await wallet.loanClose({
    //   memo: `${withdrawLoan.memo}`,
    //   amount: loanCloseParams.amount,
    //   toAddress: `${withdrawLoan.inboundAddress}`,
    // })
    // Non ERC20 swaps
    if (!this.isERC20Asset(loanCloseParams.amount.asset)) {
      const hash = await this.wallet.transfer({
        asset: loanCloseParams.amount.asset,
        amount: loanCloseParams.amount.baseAmount,
        recipient: withdrawLoan.inboundAddress as string,
        memo: withdrawLoan.memo,
      })
      return {
        hash,
        url: await this.wallet.getExplorerTxUrl(loanCloseParams.amount.asset.chain, hash),
      }
    }

    // ERC20 swaps
    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(loanCloseParams.amount.asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router for ${loanCloseParams.amount.asset.chain} chain`)
    const contractAddress = getContractAddressFromAsset(loanCloseParams.amount.asset)
    const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)

    const expiration = Math.floor(new Date(new Date().getTime() + 15 * 60000).getTime() / 1000)
    const depositParams = [
      withdrawLoan.inboundAddress as string,
      checkSummedContractAddress,
      loanCloseParams.amount.baseAmount.amount().toFixed(),
      withdrawLoan.memo,
      expiration,
    ]

    const routerContract = new ethers.Contract(inboundDetails.router, abi.router)
    const wallet = this.wallet.getChainWallet(loanCloseParams.amount.asset.chain)

    const gasPrices = await this.wallet.getGasFeeRates(loanCloseParams.amount.asset.chain)

    const unsignedTx = await routerContract.populateTransaction.depositWithExpiry(...depositParams, {
      from: this.wallet.getAddress(loanCloseParams.amount.asset.chain),
      value: 0,
      gasPrice: gasPrices.fast.amount().toFixed(),
      gasLimit: '160000',
    })

    const { hash } = await wallet.sendTransaction(unsignedTx)
    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(loanCloseParams.amount.asset.chain, hash),
    }
  }

  /**
   * Get all Thornames and its data associated owned by an address
   * @param address - address
   * @returns thornames data
   */
  public async getThornamesByAddress(address: string) {
    return this.thorchainQuery.thorchainCache.midgardQuery.midgardCache.midgard.getTHORNameReverseLookup(address)
  }

  /**
   * Do swap from native protocol asset to any other asset
   * @param {CryptoAmount} amount Amount to swap
   * @param {string} memo Memo to add to the transaction to successfully make the swap
   * @returns {TxSubmitted} the swap transaction hash and url
   */
  private async doProtocolAssetSwap(amount: CryptoAmount, memo: string): Promise<TxSubmitted> {
    const hash = await this.wallet.deposit({ asset: amount.asset, amount: amount.baseAmount, memo })

    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(amount.asset.chain, hash),
    }
  }

  /**
   * Do swap between assets
   * @param {CryptoAmount} amount Amount to swap
   * @param {string} memo Memo to add to the transaction to successfully make the swap
   * @param {string} recipient inbound address to make swap transaction to
   * @returns {TxSubmitted} the swap transaction hash and url
   */
  private async doNonProtocolAssetSwap(amount: CryptoAmount, recipient: string, memo: string): Promise<TxSubmitted> {
    // Non ERC20 swaps
    if (!this.isERC20Asset(amount.asset)) {
      const hash = await this.wallet.transfer({
        asset: amount.asset,
        amount: amount.baseAmount,
        recipient,
        memo,
      })
      return {
        hash,
        url: await this.wallet.getExplorerTxUrl(amount.asset.chain, hash),
      }
    }

    // ERC20 swaps
    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(amount.asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router for ${amount.asset.chain} chain`)
    const contractAddress = getContractAddressFromAsset(amount.asset)
    const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)

    const expiration = Math.floor(new Date(new Date().getTime() + 15 * 60000).getTime() / 1000)
    const depositParams = [
      recipient,
      checkSummedContractAddress,
      amount.baseAmount.amount().toFixed(),
      memo,
      expiration,
    ]

    const routerContract = new ethers.Contract(inboundDetails.router, abi.router)
    const wallet = this.wallet.getChainWallet(amount.asset.chain)

    const gasPrices = await this.wallet.getGasFeeRates(amount.asset.chain)

    const unsignedTx = await routerContract.populateTransaction.depositWithExpiry(...depositParams, {
      from: this.wallet.getAddress(amount.asset.chain),
      value: 0,
      gasPrice: gasPrices.fast.amount().toFixed(),
      gasLimit: '160000',
    })

    const { hash } = await wallet.sendTransaction(unsignedTx)
    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(amount.asset.chain, hash),
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
  private async addNonProtocolAssetLP(
    params: AddLiquidity,
    constructedMemo: string,
    chain: Chain,
    inboundAsgard: string,
  ): Promise<TxSubmitted> {
    const feeRates = await this.wallet.getFeeRates(chain, Protocol.THORCHAIN)

    if (!this.isERC20Asset(params.asset.asset)) {
      const hash = await this.wallet.transfer({
        asset: params.asset.asset,
        recipient: inboundAsgard,
        memo: constructedMemo,
        feeRate: feeRates.fast,
        amount: params.asset.baseAmount,
      })
      return { hash, url: await this.wallet.getExplorerTxUrl(chain, hash) }
    }

    // ERC-20 transfer
    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(params.asset.asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router for ${params.asset.asset.chain} chain`)

    const address = await this.wallet.getAddress(params.asset.asset.chain)

    const isApprovedResult = await this.isRouterApprovedToSpend({
      asset: params.asset.asset,
      amount: params.asset,
      address,
    })
    if (!isApprovedResult) {
      throw new Error('The amount is not allowed to spend')
    }
    const contractAddress = getContractAddressFromAsset(params.asset.asset)
    const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)
    const expiration = Math.floor(new Date(new Date().getTime() + 15 * 60000).getTime() / 1000)
    const depositParams = [
      inboundAsgard,
      checkSummedContractAddress,
      params.asset.baseAmount.amount().toFixed(),
      constructedMemo,
      expiration,
    ]

    const routerContract = new ethers.Contract(inboundDetails.router, abi.router)
    const wallet = this.wallet.getChainWallet(params.asset.asset.chain)
    const gasLimit = '160000'

    const unsignedTx = await routerContract.populateTransaction.depositWithExpiry(...depositParams, {
      from: address,
      value: 0,
      gasPrice: feeRates.fast.amount().toFixed(),
      gasLimit: gasLimit,
    })
    const { hash } = await wallet.sendTransaction(unsignedTx)
    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(params.asset.asset.chain, hash),
    }
  }

  /** Function handles liquidity Add for Rune only
   *
   * @param params - deposit parameters
   * @param memo - memo needed to withdraw lp
   * @returns - tx object
   */
  private async addProtocolAssetLP(params: AddLiquidity, memo: string): Promise<TxSubmitted> {
    const hash = await this.wallet.deposit({
      asset: params.rune.asset,
      amount: params.rune.baseAmount,
      memo: memo,
    })
    return { hash, url: await this.wallet.getExplorerTxUrl(params.rune.asset.chain, hash) }
  }

  private async withdrawNonProtocolAssetLP(
    params: WithdrawLiquidity,
    constructedMemo: string,
    chain: Chain,
    inboundAsgard: string,
  ): Promise<TxSubmitted> {
    const feeRates = await this.wallet.getFeeRates(chain, Protocol.THORCHAIN)

    if (!this.isERC20Asset(params.assetFee.asset)) {
      const hash = await this.wallet.transfer({
        asset: params.assetFee.asset,
        recipient: inboundAsgard,
        memo: constructedMemo,
        feeRate: feeRates.fast,
        amount: params.assetFee.baseAmount,
      })
      return { hash, url: await this.wallet.getExplorerTxUrl(chain, hash) }
    }

    // ERC-20 transfer
    const inboundDetails = await this.thorchainQuery.getChainInboundDetails(params.assetFee.asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router for ${params.assetFee.asset.chain} chain`)

    const address = await this.wallet.getAddress(params.assetFee.asset.chain)

    const isApprovedResult = await this.isRouterApprovedToSpend({
      asset: params.assetFee.asset,
      amount: params.assetFee,
      address,
    })
    if (!isApprovedResult) {
      throw new Error('The amount is not allowed to spend')
    }
    const contractAddress = getContractAddressFromAsset(params.assetFee.asset)
    const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)
    const expiration = Math.floor(new Date(new Date().getTime() + 15 * 60000).getTime() / 1000)
    const depositParams = [
      inboundAsgard,
      checkSummedContractAddress,
      params.assetFee.baseAmount.amount().toFixed(),
      constructedMemo,
      expiration,
    ]

    const routerContract = new ethers.Contract(inboundDetails.router, abi.router)
    const wallet = this.wallet.getChainWallet(params.assetFee.asset.chain)
    const gasLimit = '160000'

    const unsignedTx = await routerContract.populateTransaction.depositWithExpiry(...depositParams, {
      from: address,
      value: 0,
      gasPrice: feeRates.fast.amount().toFixed(),
      gasLimit: gasLimit,
    })
    const { hash } = await wallet.sendTransaction(unsignedTx)
    return {
      hash,
      url: await this.wallet.getExplorerTxUrl(params.assetFee.asset.chain, hash),
    }
  }

  /** Function handles liquidity Withdraw for Rune only
   *
   * @param params - withdraw parameters
   * @param memo - memo needed to withdraw lp
   * @returns - tx object
   */
  private async withdrawProtocolLP(params: WithdrawLiquidity, memo: string): Promise<TxSubmitted> {
    const hash = await this.wallet.deposit({
      asset: params.runeFee.asset,
      amount: params.runeFee.baseAmount,
      memo: memo,
    })
    return { hash, url: await this.wallet.getExplorerTxUrl(THORChain, hash) }
  }
  /**
   * Check if a name is a valid MAYAName
   * @param {string} name MAYAName
   * @returns {boolean} true if is a registered MAYAName, otherwise, false
   */
  private async isTHORName(name: string): Promise<boolean> {
    return !!(await this.thorchainQuery.getThornameDetails(name))
  }

  /**
   * Check if asset is ERC20
   * @param {Asset} asset to check
   * @returns true if asset is ERC20, otherwise, false
   */
  private isERC20Asset(asset: Asset): boolean {
    return this.isEVMChain(asset.chain)
      ? [AssetETH.symbol, AssetAVAX.symbol, AssetBSC.symbol].includes(asset.symbol)
      : false
  }

  /**
   * Check if asset chain is EVM
   * @param {Chain} chain to check
   * @returns true if chain is EVM, otherwise, false
   */
  private isEVMChain(chain: Chain): boolean {
    return [AssetETH.chain, AssetBSC.chain, AssetAVAX.chain].includes(chain)
  }
}
