import { Network } from '@xchainjs/xchain-client'
import { Midgard, ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import { baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'

import { Wallet } from '../src/Wallet'

require('dotenv').config()
const thorchainCacheTestnet = new ThorchainCache(new Midgard(Network.Testnet), new Thornode(Network.Testnet))
const thorchainQueryTestnet = new ThorchainQuery(thorchainCacheTestnet)
const testnetWallet = new Wallet(process.env.TESTNETPHRASE || 'you forgot to set the phrase', thorchainQueryTestnet)

describe('xchain-swap wallet Tests', () => {
  it(`Should show balances `, async () => {
    try {
      const allBalances = await testnetWallet.getAllBalances()

      console.log(JSON.stringify(allBalances, null, 2))
      for (const allBalance of allBalances) {
        console.log(`chain:${allBalance.chain} address: ${allBalance.address}`)
        if (typeof allBalance.balances === 'string') {
          console.log(`error:${allBalance.balances}`)
        } else {
          for (let index = 0; index < allBalance.balances.length; index++) {
            const balance = allBalance.balances[index]
            console.log(
              `${formatAssetAmountCurrency({
                amount: baseToAsset(balance.amount),
                asset: balance.asset,
                trimZeros: true,
              })}`,
            )
          }
        }
      }
    } catch (e) {
      console.error(e)
    }
  })
})
