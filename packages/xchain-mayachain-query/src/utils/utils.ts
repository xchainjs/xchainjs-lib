import { Asset, CryptoAmount, assetFromStringEx, assetToString, baseAmount } from '@xchainjs/xchain-util'
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
export const getCryptoAmountWithNotation = <T extends CompatibleAsset>(
  amount: CryptoAmount<T>,
  notation: number,
): CryptoAmount<CompatibleAsset> => {
  const inputAmountBaseNotation = amount.baseAmount.amount()
  const decimalsDiff = notation - amount.baseAmount.decimal
  return new CryptoAmount<T>(baseAmount(inputAmountBaseNotation.times(10 ** decimalsDiff), notation), amount.asset)
}

export const getAssetFromMemo = (memo: string): CompatibleAsset => {
  const attributes = memo.split(':')
  if (!attributes[0]) throw Error(`Invalid memo: ${memo}`)

  switch (attributes[0]) {
    case 'SWAP':
    case '=':
      if (!attributes[1]) throw Error('Asset not defined')
      return assetFromStringEx(attributes[1]) as CompatibleAsset
    default:
      throw Error(`Get asset from memo unsupported for ${attributes[0]} operation`)
  }
}
