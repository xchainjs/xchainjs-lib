import { Asset, CryptoAmount, assetToString, baseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { CacaoAsset } from './const'

export const isCacaoAsset = (asset: Asset): boolean => assetToString(asset) === assetToString(CacaoAsset)

export const getBaseAmountWithDiffDecimals = (inputAmount: CryptoAmount, outDecimals: number): BigNumber => {
  const inDecimals = inputAmount.baseAmount.decimal
  let baseAmountOut = inputAmount.baseAmount.amount()
  const adjustDecimals = outDecimals - inDecimals
  baseAmountOut = baseAmountOut.times(10 ** adjustDecimals)
  return baseAmount(baseAmountOut, outDecimals).amount()
}
