import { ADAChain } from '@xchainjs/xchain-cardano'
import { Protocol } from '@xchainjs/xchain-client'
import { abi } from '@xchainjs/xchain-evm'
import { MAYAChain } from '@xchainjs/xchain-mayachain'
import { CompatibleAsset, MayachainCache, MayachainQuery, Mayanode } from '@xchainjs/xchain-mayachain-query'
import {
  Address,
  Asset,
  CryptoAmount,
  TokenAsset,
  baseAmount,
  getContractAddressFromAsset,
  isSynthAsset,
  isTradeAsset,
} from '@xchainjs/xchain-util'
import { EvmTxParams, Wallet } from '@xchainjs/xchain-wallet'

import { TxSubmitted } from './types'
import { isFlatFeeChain, isProtocolBFTChain, isProtocolERC20Asset, isProtocolEVMChain } from './utils'
import { Contract, getAddress, ZeroAddress } from 'ethers'

export type NonProtocolActionParams = {
  wallet: Wallet
  assetAmount: CryptoAmount<Asset | TokenAsset>
  recipient: Address
  memo: string
  walletIndex?: number
}

export type ProtocolActionParams = {
  wallet: Wallet
  assetAmount: CryptoAmount<CompatibleAsset>
  memo: string
  walletIndex?: number
}

export type ActionParams = ProtocolActionParams | NonProtocolActionParams

export class MayachainAction {
  public static async makeAction(actionParams: ActionParams): Promise<TxSubmitted> {
    return this.isNonProtocolParams(actionParams)
      ? this.makeNonProtocolAction(actionParams)
      : this.makeProtocolAction(actionParams)
  }

  private static async makeProtocolAction({
    wallet,
    assetAmount,
    memo,
    walletIndex,
  }: ProtocolActionParams): Promise<TxSubmitted> {
    const hash = await wallet.deposit({
      chain: MAYAChain,
      asset: assetAmount.asset,
      amount: assetAmount.baseAmount,
      memo,
      walletIndex,
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
    walletIndex,
  }: NonProtocolActionParams): Promise<TxSubmitted> {
    if (!isProtocolEVMChain(assetAmount.asset.chain)) {
      // BFT, Cardano, and Zcash derive the fee internally. Zcash getFeeRates throws (ZIP 317).
      if (
        isProtocolBFTChain(assetAmount.asset.chain) ||
        isFlatFeeChain(assetAmount.asset.chain) ||
        assetAmount.asset.chain === ADAChain
      ) {
        const hash = await wallet.transfer({
          asset: assetAmount.asset,
          amount: assetAmount.baseAmount,
          recipient,
          memo,
          walletIndex,
        })
        return {
          hash,
          url: await wallet.getExplorerTxUrl(assetAmount.asset.chain, hash),
        }
      }
      const feeRates = await wallet.getFeeRates(assetAmount.asset.chain, Protocol.MAYACHAIN)
      const hash = await wallet.transfer({
        asset: assetAmount.asset,
        amount: assetAmount.baseAmount,
        recipient,
        memo,
        feeRate: feeRates.fast,
        walletIndex,
      })
      return {
        hash,
        url: await wallet.getExplorerTxUrl(assetAmount.asset.chain, hash),
      }
    }

    // EVM actions go through the router
    const mayachainQuery = new MayachainQuery(new MayachainCache(undefined, new Mayanode(wallet.getNetwork())))

    const inboundDetails = await mayachainQuery.getChainInboundDetails(assetAmount.asset.chain)
    if (!inboundDetails.router) throw Error(`Unknown router for ${assetAmount.asset.chain} chain`)

    const isERC20 = isProtocolERC20Asset(assetAmount.asset)

    const checkSummedContractAddress = isERC20
      ? getAddress(getContractAddressFromAsset(assetAmount.asset))
      : ZeroAddress

    const expiration = Math.floor(new Date(new Date().getTime() + 15 * 60000).getTime() / 1000)
    const depositParams = [
      recipient,
      checkSummedContractAddress,
      assetAmount.baseAmount.amount().toFixed(),
      memo,
      expiration,
    ]

    const routerContract = new Contract(inboundDetails.router, abi.router)
    const gasPrices = await wallet.getFeeRates(assetAmount.asset.chain)

    const unsignedTx = await routerContract.getFunction('depositWithExpiry').populateTransaction(...depositParams)

    const nativeAsset = wallet.getAssetInfo(assetAmount.asset.chain)

    const tx: EvmTxParams = {
      asset: nativeAsset.asset,
      amount: isERC20 ? baseAmount(0, nativeAsset.decimal) : assetAmount.baseAmount,
      memo: unsignedTx.data,
      recipient: inboundDetails.router,
      gasPrice: gasPrices.fast,
      isMemoEncoded: true,
    }

    const gasLimit = await wallet.estimateGasLimit(tx)

    const hash = await wallet.transfer({
      ...tx,
      gasLimit,
      walletIndex,
    })

    return {
      hash,
      url: await wallet.getExplorerTxUrl(assetAmount.asset.chain, hash),
    }
  }

  private static isNonProtocolParams(params: ActionParams): params is NonProtocolActionParams {
    if (
      (params.assetAmount.asset.chain === MAYAChain ||
        isSynthAsset(params.assetAmount.asset) ||
        isTradeAsset(params.assetAmount.asset)) &&
      'address' in params &&
      !!params.address
    ) {
      throw Error('Inconsistent params. Native actions do not support recipient')
    }
    return (
      params.assetAmount.asset.chain !== MAYAChain &&
      !isSynthAsset(params.assetAmount.asset) &&
      !isTradeAsset(params.assetAmount.asset)
    )
  }
}
