import { Protocol } from '@xchainjs/xchain-client'
import { abi } from '@xchainjs/xchain-evm'
import { THORChain } from '@xchainjs/xchain-thorchain'
import { ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import { Address, CryptoAmount, getContractAddressFromAsset } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
import { ethers } from 'ethers'

import { TxSubmitted } from './types'
import { isProtocolBFTChain, isProtocolERC20Asset, isProtocolEVMChain } from './utils'

export type NonProtocolActionParams = {
  wallet: Wallet
  assetAmount: CryptoAmount
  recipient: Address
  memo: string
}

export type ProtocolActionParams = {
  wallet: Wallet
  assetAmount: CryptoAmount
  memo: string
}

export type ActionParams = ProtocolActionParams | NonProtocolActionParams

export class ThorchainAction {
  public static async makeAction(actionParams: ActionParams): Promise<TxSubmitted> {
    return this.isNonProtocolParams(actionParams)
      ? this.makeNonProtocolAction(actionParams)
      : this.makeProtocolAction(actionParams)
  }

  private static async makeProtocolAction({ wallet, assetAmount, memo }: ProtocolActionParams): Promise<TxSubmitted> {
    const hash = await wallet.deposit({
      chain: THORChain,
      asset: assetAmount.asset,
      amount: assetAmount.baseAmount,
      memo,
    })

    return {
      hash,
      url: await wallet.getExplorerTxUrl(assetAmount.asset.chain, hash),
    }
  }

  private static async makeNonProtocolAction({
    wallet,
    assetAmount,
    recipient,
    memo,
  }: NonProtocolActionParams): Promise<TxSubmitted> {
    // Non ERC20 swaps
    if (!isProtocolERC20Asset(assetAmount.asset)) {
      if (isProtocolBFTChain(assetAmount.asset.chain)) {
        const hash = await wallet.transfer({
          asset: assetAmount.asset,
          amount: assetAmount.baseAmount,
          recipient,
          memo,
        })
        return {
          hash,
          url: await wallet.getExplorerTxUrl(assetAmount.asset.chain, hash),
        }
      }
      const feeRates = await wallet.getFeeRates(assetAmount.asset.chain, Protocol.THORCHAIN)
      const hash = await wallet.transfer(
        isProtocolEVMChain(assetAmount.asset.chain)
          ? {
              asset: assetAmount.asset,
              amount: assetAmount.baseAmount,
              recipient,
              memo,
              gasPrice: feeRates.fast,
            }
          : {
              asset: assetAmount.asset,
              amount: assetAmount.baseAmount,
              recipient,
              memo,
              feeRate: feeRates.fast,
            },
      )
      return {
        hash,
        url: await wallet.getExplorerTxUrl(assetAmount.asset.chain, hash),
      }
    }

    // ERC20 swaps
    const thorchainQuery: ThorchainQuery = new ThorchainQuery(new ThorchainCache(new Thornode(wallet.getNetwork())))

    const inboundDetails = await thorchainQuery.getChainInboundDetails(assetAmount.asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router for ${assetAmount.asset.chain} chain`)
    const contractAddress = getContractAddressFromAsset(assetAmount.asset)
    const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)

    const expiration = Math.floor(new Date(new Date().getTime() + 15 * 60000).getTime() / 1000)
    const depositParams = [
      recipient,
      checkSummedContractAddress,
      assetAmount.baseAmount.amount().toFixed(),
      memo,
      expiration,
    ]

    const routerContract = new ethers.Contract(inboundDetails.router, abi.router)
    const chainWallet = wallet.getChainWallet(assetAmount.asset.chain)

    const gasPrices = await wallet.getFeeRates(assetAmount.asset.chain)

    const unsignedTx = await routerContract.populateTransaction.depositWithExpiry(...depositParams, {
      from: wallet.getAddress(assetAmount.asset.chain),
      value: 0,
      gasPrice: gasPrices.fast.amount().toFixed(),
      gasLimit: '160000',
    })

    const { hash } = await chainWallet.sendTransaction(unsignedTx)
    return {
      hash,
      url: await wallet.getExplorerTxUrl(assetAmount.asset.chain, hash),
    }
  }

  private static isNonProtocolParams(params: ActionParams): params is NonProtocolActionParams {
    if (
      (params.assetAmount.asset.chain === THORChain || params.assetAmount.asset.synth) &&
      'address' in params &&
      !!params.address
    ) {
      throw Error('Inconsistent params. Native actions do not support recipient')
    }
    return params.assetAmount.asset.chain !== THORChain && !params.assetAmount.asset.synth
  }
}
