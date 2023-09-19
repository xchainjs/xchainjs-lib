import cosmosclient from '@cosmos-client/core'
import { Network } from '@xchainjs/xchain-client'
import {
  AssetBTC,
  AssetETH,
  BCHChain,
  BTCChain,
  ETHChain,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { baseToAsset, formatAssetAmountCurrency, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

import { Wallet } from '../src/wallet'

require('dotenv').config()

register9Rheader(axios)
register9Rheader(cosmosclient.config.globalAxios)

const thorchainCacheMainnet = new ThorchainCache(new Thornode(Network.Mainnet))
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
  it(`Register thorname`, async () => {
    try {
      await mainnetWallet.registerThorname({
        thorname: 'hippocampus',
        chain: BTCChain,
        preferredAsset: AssetBTC,
        expirity: new Date(2024, 8, 11, 14, 30, 0, 0),
      })
    } catch (e) {
      console.error(e)
    }
  })

  it(`Update thorname`, async () => {
    try {
      await mainnetWallet.updateThorname({
        thorname: 'hippo',
        chain: BCHChain,
        chainAddress: 'qz53fqdfjqwefhff9xf3dmq45g3l7jydyu6d990e76',
      })
    } catch (e) {
      console.error(e)
    }
  })

  it(`Update thorname with expirity`, async () => {
    try {
      await mainnetWallet.updateThorname({
        thorname: 'hippo',
        chain: BCHChain,
        chainAddress: 'qz53fqdfjqwefhff9xf3dmq45g3l7jydyu6d990e76',
        expirity: new Date(2024, 9, 11, 14, 30, 0, 0),
      })
    } catch (e) {
      console.error(e)
    }
  })

  it(`Update thorname prefered asset`, async () => {
    try {
      const hash = await mainnetWallet.updateThorname({
        thorname: 'hippo',
        chain: ETHChain,
        preferredAsset: AssetETH,
      })
      console.log('hash', hash)
    } catch (e) {
      console.error(e)
    }
  })

  it(`Try update thorname is not yours`, async () => {
    try {
      await mainnetWallet.updateThorname({
        thorname: 'dx',
        chain: ETHChain,
        chainAddress: '0xc50531811f3d8161a2b53349974ae4c7c6d3bfba',
      })
    } catch (e) {
      console.error(e)
    }
  })
})
