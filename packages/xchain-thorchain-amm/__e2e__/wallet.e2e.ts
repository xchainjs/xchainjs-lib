import { globalAxios } from '@cosmos-client/core/cjs/rest/config'
import { Network } from '@xchainjs/xchain-client'
import { Midgard, ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import { baseToAsset, formatAssetAmountCurrency, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

import { Wallet } from '../src/Wallet'

require('dotenv').config()

register9Rheader(axios)
register9Rheader(globalAxios)

const thorchainCacheMainnet = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))
const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)
const mainnetWallet = new Wallet(process.env.MAINNETPHRASE || 'you forgot to set the phrase', thorchainQueryMainnet)

// const printHeaders = (request:any) => {
//   console.log(` Request ${request.url} ${JSON.stringify(request.headers)}`)
//   return request
// }
// axios.interceptors.request.use(printHeaders)
// globalAxios.interceptors.request.use(printHeaders)

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
