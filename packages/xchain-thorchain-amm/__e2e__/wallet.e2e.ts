import { Network } from '@xchainjs/xchain-client'
import { baseToAsset, formatAssetAmountCurrency } from '@xchainjs/xchain-util'

import { Wallet } from '../src/Wallet'
import { ThorchainCache } from '../src/thorchain-cache'
import { Midgard } from '../src/utils/midgard'

require('dotenv').config()

const midgard = new Midgard(Network.Stagenet)
const thorchainCache = new ThorchainCache(midgard)
const testnetWallet = new Wallet(process.env.TESTNETPHRASE || 'you forgot to set the phrase', thorchainCache)

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
