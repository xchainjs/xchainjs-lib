import { Network } from '@xchainjs/xchain-client'
import { Midgard, ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import { baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'

import { Wallet } from '../src/Wallet'

require('dotenv').config()
const thorchainCacheMainnet = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))
const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)
const mainnetWallet = new Wallet(process.env.MAINNETPHRASE || 'you forgot to set the phrase', thorchainQueryMainnet)

describe('xchain-swap wallet Tests', () => {
  it(`Should show balances `, async () => {
    try {
      const allBalances = await mainnetWallet.getAllBalances()

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
