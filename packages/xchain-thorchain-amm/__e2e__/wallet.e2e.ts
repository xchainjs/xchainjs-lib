import cosmosclient from '@cosmos-client/core'
import { Network } from '@xchainjs/xchain-client'
import { Midgard, ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import { baseToAsset, formatAssetAmountCurrency, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

import { Wallet } from '../src/Wallet'

require('dotenv').config()

register9Rheader(axios)
register9Rheader(cosmosclient.config.globalAxios)

const thorchainCacheMainnet = new ThorchainCache(new Midgard(Network.Mainnet), new Thornode(Network.Mainnet))
const thorchainQueryMainnet = new ThorchainQuery(thorchainCacheMainnet)
const testnetWallet = new Wallet(process.env.TESTNETPHRASE || 'you forgot to set the phrase', thorchainQueryMainnet)

describe('xchain-swap wallet Tests', () => {
  it(`Should show balances `, async () => {
    try {
      const allBalances = await mainnetWallet.getAllBalances()
      const table: Record<string, string>[] = []
      for (const allBalance of allBalances) {
        if (typeof allBalance.balances === 'string') {
        } else {
          for (let index = 0; index < allBalance.balances.length; index++) {
            const balance = allBalance.balances[index]
            const balanceString = `${formatAssetAmountCurrency({
              amount: baseToAsset(balance.amount),
              asset: balance.asset,
              trimZeros: true,
            })}`
            const row: Record<string, string> = {}

            row['chain'] = allBalance.chain
            row['address'] = allBalance.address
            row['balance'] = balanceString
            table.push(row)
          }
        }
      }
      console.table(table)
    } catch (e) {
      console.error(e)
    }
  })
})
