import { BaseAmount, AssetAmount, baseAmount } from '@xchainjs/xchain-util/lib'

/**
 * Check Subscan API response
 */
export const isSuccess = (response: { code: number }): boolean => !response.code

/**
 * convert asset to base values (decimal = 10)
 */
export const assetToBase10 = (v: AssetAmount): BaseAmount => {
  const value = v.amount().multipliedBy(Math.pow(10, v.decimal)).integerValue()

  return baseAmount(value, 10)
}
