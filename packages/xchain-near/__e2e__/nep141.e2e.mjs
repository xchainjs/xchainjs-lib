/**
 * Mainnet view smoke checks for NEP-141 balances.
 * Run via `yarn e2e` after build (Jest cannot load near-api-js ESM deps).
 */
import { assetFromStringEx, assetToString } from '@xchainjs/xchain-util'
import { Client } from '../lib/index.js'

const WRAP_NEAR = assetFromStringEx('NEAR.wNEAR-wrap.near')
const CIRCLE_USDC = assetFromStringEx(
  'NEAR.USDC-17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
)

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const client = new Client()

const auroraBalances = await client.getBalance('aurora', [WRAP_NEAR, CIRCLE_USDC])
assert(auroraBalances.length === 3, `expected 3 balances, got ${auroraBalances.length}`)
assert(assetToString(auroraBalances[0].asset) === 'NEAR.NEAR', 'native asset mismatch')
assert(assetToString(auroraBalances[1].asset) === assetToString(WRAP_NEAR), 'wNEAR asset mismatch')
assert(auroraBalances[1].amount.decimal === 24, 'wNEAR decimals mismatch')
assert(auroraBalances[1].amount.amount().gt(0), 'expected aurora wrap.near balance > 0')
assert(assetToString(auroraBalances[2].asset) === assetToString(CIRCLE_USDC), 'USDC asset mismatch')
assert(auroraBalances[2].amount.decimal === 6, 'USDC decimals mismatch')
assert(auroraBalances[2].amount.amount().gt(0), 'expected aurora USDC balance > 0')

const empty = 'a'.repeat(64)
const emptyBalances = await client.getBalance(empty, [CIRCLE_USDC])
assert(emptyBalances.length === 2, `expected 2 balances, got ${emptyBalances.length}`)
assert(emptyBalances[0].amount.amount().toNumber() === 0, 'expected zero native for empty account')
assert(emptyBalances[1].amount.amount().toFixed(0) === '0', 'expected zero USDC for empty account')

console.log('NEP-141 mainnet view checks passed')
console.log(
  JSON.stringify(
    {
      auroraNear: auroraBalances[0].amount.amount().toFixed(0),
      auroraWnear: auroraBalances[1].amount.amount().toFixed(0),
      auroraUsdc: auroraBalances[2].amount.amount().toFixed(0),
    },
    null,
    2,
  ),
)
