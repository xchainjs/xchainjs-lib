import { Asset, CryptoAmount, assetToString, baseAmount } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { CompatibleAsset } from '../types'

import { CacaoAsset } from './const'

export const isCacaoAsset = (asset: Asset): boolean => assetToString(asset) === assetToString(CacaoAsset)

export const getBaseAmountWithDiffDecimals = (
  inputAmount: CryptoAmount<CompatibleAsset>,
  outDecimals: number,
): BigNumber => {
  const inDecimals = inputAmount.baseAmount.decimal
  let baseAmountOut = inputAmount.baseAmount.amount()
  const adjustDecimals = outDecimals - inDecimals
  baseAmountOut = baseAmountOut.times(10 ** adjustDecimals)
  return baseAmount(baseAmountOut, outDecimals).amount()
}

// TODO: Move this util functions to xchain-util to avoid replication between Thorchain and Mayachain
export const getCryptoAmountWithNotation = <T extends CryptoAmount<CompatibleAsset>>(
  amount: T,
  notation: number,
): CryptoAmount<CompatibleAsset> => {
  const inputAmountBaseNotation = amount.baseAmount.amount()
  const decimalsDiff = notation - amount.baseAmount.decimal
  return new CryptoAmount<typeof amount.asset>(
    baseAmount(inputAmountBaseNotation.times(10 ** decimalsDiff), notation),
    amount.asset,
  ) as T
}
