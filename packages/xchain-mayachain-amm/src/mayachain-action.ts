import { abi } from '@xchainjs/xchain-evm'
import { MAYAChain } from '@xchainjs/xchain-mayachain'
import { CompatibleAsset, MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { AssetXRD, generateAddressParam, generateBucketParam, generateStringParam } from '@xchainjs/xchain-radix'
import {
  Address,
  Asset,
  CryptoAmount,
  TokenAsset,
  baseAmount,
  eqAsset,
  getContractAddressFromAsset,
  isSynthAsset,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
import { ethers } from 'ethers'

import { TxSubmitted } from './types'
import { isProtocolBFTChain, isProtocolERC20Asset, isProtocolEVMChain, isRadixChain } from './utils'

export type NonProtocolActionParams = {
  wallet: Wallet
  assetAmount: CryptoAmount<Asset | TokenAsset>
  recipient: Address
  memo: string
}

export type ProtocolActionParams = {
  wallet: Wallet
  assetAmount: CryptoAmount<CompatibleAsset>
  memo: string
}

export type ActionParams = ProtocolActionParams | NonProtocolActionParams

export class MayachainAction {
  public static async makeAction(actionParams: ActionParams): Promise<TxSubmitted> {
    return this.isNonProtocolParams(actionParams)
      ? this.makeNonProtocolAction(actionParams)
      : this.makeProtocolAction(actionParams)
  }

  private static async makeProtocolAction({ wallet, assetAmount, memo }: ProtocolActionParams): Promise<TxSubmitted> {
    const hash = await wallet.deposit({
      chain: MAYAChain,
      asset: assetAmount.asset,
      amount: assetAmount.baseAmount,
      memo,
    })

    return {
      hash,
      url: await wallet.getExplorerTxUrl(MAYAChain, hash),
    }
  }

  private static async makeNonProtocolAction({
    wallet,
    assetAmount,
    recipient,
    memo,
  }: NonProtocolActionParams): Promise<TxSubmitted> {
    // Non EVM actions and non Radix action
    if (!isProtocolEVMChain(assetAmount.asset.chain) && !eqAsset(assetAmount.asset, AssetXRD)) {
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
      const feeRates = await wallet.estimateTransferFees({
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        recipient,
        memo,
      })
      const hash = await wallet.transfer({
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        recipient,
        memo,
        feeRate: feeRates.fast,
      })
      return {
        hash,
        url: await wallet.getExplorerTxUrl(assetAmount.asset.chain, hash),
      }
    }

    // EVM actions and Radix go through the router
    const mayachainQuery: MayachainQuery = new MayachainQuery()

    const inboundDetails = await mayachainQuery.getChainInboundDetails(assetAmount.asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router for ${assetAmount.asset.chain} chain`)

    if (isRadixChain(assetAmount.asset.chain)) {
      // Radix
      const hash = await wallet.transfer({
        asset: assetAmount.asset,
        recipient: inboundDetails.router,
        amount: assetAmount.baseAmount,
        methodToCall: {
          address: inboundDetails.router,
          methodName: 'user_deposit',
          params: [
            generateAddressParam(await wallet.getAddress(AssetXRD.chain)),
            generateAddressParam(recipient),
            generateBucketParam(0),
            generateStringParam(memo),
          ],
        },
      })
      return {
        hash,
        url: await wallet.getExplorerTxUrl(assetAmount.asset.chain, hash),
      }
    }
    // Evm
    const isERC20 = isProtocolERC20Asset(assetAmount.asset)

    const checkSummedContractAddress = isERC20
      ? ethers.utils.getAddress(getContractAddressFromAsset(assetAmount.asset))
      : ethers.constants.AddressZero

    const expiration = Math.floor(new Date(new Date().getTime() + 15 * 60000).getTime() / 1000)
    const depositParams = [
      recipient,
      checkSummedContractAddress,
      assetAmount.baseAmount.amount().toFixed(),
      memo,
      expiration,
    ]

    const routerContract = new ethers.Contract(inboundDetails.router, abi.router)
    const gasPrices = await wallet.getFeeRates(assetAmount.asset.chain)

    const unsignedTx = await routerContract.populateTransaction.depositWithExpiry(...depositParams)

    const nativeAsset = wallet.getAssetInfo(assetAmount.asset.chain)

    const hash = await wallet.transfer({
      asset: nativeAsset.asset,
      amount: isERC20 ? baseAmount(0, nativeAsset.decimal) : assetAmount.baseAmount,
      memo: unsignedTx.data,
      recipient: inboundDetails.router,
      gasPrice: gasPrices.fast,
      isMemoEncoded: true,
      gasLimit: ethers.BigNumber.from(160000),
    })

    return {
      hash,
      url: await wallet.getExplorerTxUrl(assetAmount.asset.chain, hash),
    }
  }

  private static isNonProtocolParams(params: ActionParams): params is NonProtocolActionParams {
    if (
      (params.assetAmount.asset.chain === MAYAChain || isSynthAsset(params.assetAmount.asset)) &&
      'address' in params &&
      !!params.address
    ) {
      throw Error('Inconsistent params. Native actions do not support recipient')
    }
    return params.assetAmount.asset.chain !== MAYAChain && !isSynthAsset(params.assetAmount.asset)
  }
}
