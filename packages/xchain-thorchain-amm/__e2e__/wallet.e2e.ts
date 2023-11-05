import cosmosclient from '@cosmos-client/core'
import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
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

import { ChainConfigs, Wallet } from '../src/wallet'

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

  it(`Transfer thorname`, async () => {
    try {
      const hash = await mainnetWallet.updateThorname({
        thorname: 'hippo',
        chain: ETHChain,
        preferredAsset: AssetETH,
        owner: 'thor1k5at9pzfjsqfys380cgu3v9gz2s4vgsyzl2tue',
      })
      console.log('hash', hash)
    } catch (e) {
      console.error(e)
    }
  })

  it(`Can init wallet with custom config`, async () => {
    try {
      const customConfig: ChainConfigs = {
        [BTCChain]: {
          explorerProviders: {
            [Network.Mainnet]: new ExplorerProvider(
              'https://custom.mainnet.provider',
              'https://custom.mainnet.provider/address/%%ADDRESS%%',
              'https://custom.mainnet.provider/tx/%%TX_ID%%',
            ),
            [Network.Testnet]: new ExplorerProvider(
              'https://custom.testnet.provider',
              'https://custom.testnet.provider/address/%%ADDRESS%%',
              'https://custom.testnet.provider/tx/%%TX_ID%%',
            ),
            [Network.Stagenet]: new ExplorerProvider(
              'https://custom.stagenet.provider',
              'https://custom.stagenet.provider/address/%%ADDRESS%%',
              'https://custom.stagenet.provider/tx/%%TX_ID%%',
            ),
          },
          dataProviders: [],
        },
      }
      const wallet = new Wallet(
        process.env.MAINNETPHRASE || 'you forgot to set the phrase',
        thorchainQueryMainnet,
        customConfig,
      )
      for (const [chain, client] of Object.entries(wallet.clients)) {
        console.log(`${chain} config`)
        console.log(`Network: ${client.getNetwork()}`)
        console.log(`Explorer provider: ${client.getExplorerUrl()}`)
      }
    } catch (e) {
      console.error(e)
    }
  })
})
