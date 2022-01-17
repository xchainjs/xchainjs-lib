import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import { Balances } from '@thorwallet/xchain-client/lib'
import {
  Asset,
  assetAmount,
  AssetBNB,
  assetFromString,
  assetToBase,
  assetToString,
  baseAmount,
  BNBChain,
} from '@thorwallet/xchain-util'
import { Balances as BinanceBalances, Network } from './types'
import { BNB_DECIMAL } from './util'

const getClientUrl = (network: Network): string => {
  return network === 'testnet' ? 'https://testnet-dex.binance.org' : 'https://dex.binance.org'
}

export const getBalance = async ({
  network,
  address,
  assets,
}: {
  network: Network
  address: string
  assets?: Asset[]
}): Promise<Balances> => {
  const client = new BncClient(getClientUrl(network))
  const balances: BinanceBalances = await client.getBalance(address)

  let assetBalances = balances.map((balance) => {
    return {
      asset: assetFromString(`${BNBChain}.${balance.symbol}`) || AssetBNB,
      amount: assetToBase(assetAmount(balance.free, 8)),
    }
  })

  // make sure we always have the bnb asset as balance in the array
  if (assetBalances.length === 0) {
    assetBalances = [
      {
        asset: AssetBNB,
        amount: baseAmount(0, BNB_DECIMAL),
      },
    ]
  }

  return assetBalances.filter(
    (balance) => !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
  )
}
