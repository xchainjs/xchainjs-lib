import { TxHash, XChainClient } from '@xchainjs/xchain-client/lib'
import { ApproveParams, ETH_DECIMAL, EthereumClient, MAX_APPROVAL } from '@xchainjs/xchain-ethereum'
import { Asset, AssetETH, BaseAmount, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import routerABI from '../abi/routerABI.json'
import { ThorchainCache } from '../thorchain-cache'
import { DepositParams } from '../types'

import { calcNetworkFee, getContractAddressFromAsset } from './swap'

const APPROVE_GASLIMIT_FALLBACK = '200000'

export class EthHelper {
  private ethClient: EthereumClient
  private client: XChainClient
  private thorchainCache: ThorchainCache

  constructor(client: XChainClient, thorchainCache: ThorchainCache) {
    this.ethClient = (client as unknown) as EthereumClient
    this.client = client
    this.thorchainCache = thorchainCache
  }

  /**
   * Transaction to THORChain inbound address.
   *
   * @param {DepositParams} params The transaction options.
   * @returns {TxHash} The transaction hash.
   *
   * @throws {"halted chain"} Thrown if chain is halted.
   * @throws {"halted trading"} Thrown if trading is halted.
   * @throws {"amount is not approved"} Thrown if the amount is not allowed to spend
   * @throws {"router address is not defined"} Thrown if router address is not defined
   */
  async sendDeposit(params: DepositParams): Promise<TxHash> {
    const inboundAsgard = (await this.thorchainCache.getInboundAddressesItems())[params.asset.chain]

    if (!inboundAsgard?.router) {
      throw new Error('router address is not defined')
    }

    const address = this.client.getAddress(params.walletIndex)
    const gasPrice = await this.ethClient.estimateGasPrices()

    if (eqAsset(params.asset, AssetETH)) {
      //ETH is a simple transfer
      return await this.client.transfer({
        walletIndex: params.walletIndex || 0,
        asset: params.asset,
        amount: params.amount,
        recipient: inboundAsgard.address,
        memo: params.memo,
      })
    } else {
      //erc-20 must be depsited to the router
      const isApprovedResult = await this.isTCRouterApprovedToSpend(params.asset, params.amount, params.walletIndex)
      if (!isApprovedResult) {
        throw new Error('The amount is not allowed to spend')
      }
      const contractAddress = getContractAddressFromAsset(params.asset)
      const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)
      const depositParams = [
        inboundAsgard.address,
        checkSummedContractAddress,
        params.amount.amount().toFixed(),
        params.memo,
      ]

      const routerContract = new ethers.Contract(inboundAsgard.router, routerABI)
      const gasPriceInWei = gasPrice[params.feeOption]
      const gasPriceInGwei = gasPriceInWei.div(10 ** 9).amount()

      // TODO should we change the calcInboundFee() to use gasRate in BaseAmount instead of BIgNumber?
      // currently its hardto know the units to use, GWEI/WEI, etc
      const gasLimitInWei = calcNetworkFee(params.asset, gasPriceInGwei)
      const gasLimitInGWei = gasLimitInWei
        .div(10 ** 9)
        .baseAmount.amount()
        .toFixed()

      const unsignedTx = await routerContract.populateTransaction.deposit(...depositParams, {
        from: address,
        value: 0,
        gasPrice: gasPrice.fast.amount().toFixed(),
        gasLimit: gasLimitInGWei,
      })
      const { hash } = await this.ethClient.getWallet(params.walletIndex).sendTransaction(unsignedTx)
      return hash
    }
  }
  async isTCRouterApprovedToSpend(asset: Asset, amount: BaseAmount, walletIndex = 0): Promise<boolean> {
    const router = await this.thorchainCache.getRouterAddressForChain(asset.chain)
    const contractAddress = getContractAddressFromAsset(asset)
    return await this.ethClient.isApproved({
      amount: amount,
      spenderAddress: router,
      contractAddress,
      walletIndex: walletIndex,
    })
  }
  async approveTCRouterToSpend(
    asset: Asset,
    amount = MAX_APPROVAL,
    walletIndex = 0,
  ): Promise<ethers.providers.TransactionResponse> {
    const contractAddress = getContractAddressFromAsset(asset)
    const router = await this.thorchainCache.getRouterAddressForChain(asset.chain)
    // const gasPrice = await ethClient.estimateGasPrices()
    // const gasLimit = calcInboundFee(asset, gasPrice.fast.amount())
    const approveParams: ApproveParams = {
      contractAddress,
      spenderAddress: router,
      amount: baseAmount(amount.toString(), ETH_DECIMAL),
      walletIndex,
      gasLimitFallback: APPROVE_GASLIMIT_FALLBACK,
    }
    return await this.ethClient.approve(approveParams)
  }
}
