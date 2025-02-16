import { QuoteSwap, CompatibleAsset } from '@xchainjs/xchain-mayachain-query'
import { assetToString, Chain, TokenAsset, eqAsset, isSynthAsset } from '@xchainjs/xchain-util'
import { AssetAETH } from '@xchainjs/xchain-arbitrum'
import { AssetETH } from '@xchainjs/xchain-ethereum'

export const printQuoteSwap = (quoteSwap: QuoteSwap) => {
  console.log({
    toAddress: quoteSwap.toAddress,
    memo: quoteSwap.memo,
    expectedAmount: {
      asset: assetToString(quoteSwap.expectedAmount.asset),
      amount: quoteSwap.expectedAmount.baseAmount.amount().toString(),
      decimals: quoteSwap.expectedAmount.baseAmount.decimal,
    },
    dustThreshold: {
      asset: assetToString(quoteSwap.dustThreshold.asset),
      amount: quoteSwap.dustThreshold.baseAmount.amount().toString(),
      decimals: quoteSwap.dustThreshold.baseAmount.decimal,
    },
    totalFees: {
      asset: assetToString(quoteSwap.fees.asset),
      affiliateFee: {
        asset: assetToString(quoteSwap.fees.affiliateFee.asset),
        amount: quoteSwap.fees.affiliateFee.baseAmount.amount().toString(),
        decimals: quoteSwap.fees.affiliateFee.baseAmount.decimal,
      },
      outboundFee: {
        asset: assetToString(quoteSwap.fees.outboundFee.asset),
        amount: quoteSwap.fees.outboundFee.baseAmount.amount().toString(),
        decimals: quoteSwap.fees.outboundFee.baseAmount.decimal,
      },
    },
    inboundConfirmationSeconds: quoteSwap.inboundConfirmationSeconds,
    inboundConfirmationBlocks: quoteSwap.inboundConfirmationBlocks,
    outboundDelaySeconds: quoteSwap.outboundDelaySeconds,
    outboundDelayBlocks: quoteSwap.outboundDelayBlocks,
    totalSwapSeconds: quoteSwap.totalSwapSeconds,
    slipBasisPoints: quoteSwap.slipBasisPoints,
    canSwap: quoteSwap.canSwap,
    errors: quoteSwap.errors,
    warning: quoteSwap.warning,
  })
}

/**
 * Check if a chain is EVM and supported by the protocol
 * @param {Chain} chain to check
 * @returns true if chain is EVM, otherwise, false
 */
export const isProtocolEVMChain = (chain: Chain): boolean => {
  return [AssetETH.chain, AssetAETH.chain].includes(chain)
}

/**
 * Check if asset is ERC20
 * @param {Asset} asset to check
 * @returns true if asset is ERC20, otherwise, false
 */
export const isProtocolERC20Asset = (asset: CompatibleAsset): asset is TokenAsset => {
  return isProtocolEVMChain(asset.chain)
    ? [AssetETH, AssetAETH].findIndex((nativeEVMAsset) => eqAsset(nativeEVMAsset, asset)) === -1 && !isSynthAsset(asset)
    : false
}
