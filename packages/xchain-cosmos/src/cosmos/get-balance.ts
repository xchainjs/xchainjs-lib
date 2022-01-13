import { bank } from '@thorwallet/cosmos-client/x/bank'
import { AccAddress, CosmosSDK } from '@thorwallet/cosmos-client'
import { Coin } from '@thorwallet/cosmos-client/api'
import { Address, Balances, Network } from '@thorwallet/xchain-client'
import { Asset, assetToString, baseAmount } from '@thorwallet/xchain-util'
import { DECIMAL, getAsset } from '../util'
import { AssetAtom, AssetMuon } from '../types'

export const getSdkBalance = async ({
  address,
  server,
  chainId,
  prefix,
}: {
  address: string
  server: string
  chainId: string
  prefix: string
}): Promise<Coin[]> => {
  AccAddress.setBech32Prefix(
    prefix,
    prefix + 'pub',
    prefix + 'valoper',
    prefix + 'valoperpub',
    prefix + 'valcons',
    prefix + 'valconspub',
  )

  const accAddress = AccAddress.fromBech32(address)

  const sdk = new CosmosSDK(server, chainId)
  return bank.balancesAddressGet(sdk, accAddress).then((res) => res.data.result)
}

export const getGenericBalance = async ({
  address,
  network,
  server,
  chainId,
  assets,
  prefix,
}: {
  address: Address
  network: Network
  server: string
  chainId: string
  prefix: string
  assets?: Asset[]
}): Promise<Balances> => {
  try {
    const balances = await getSdkBalance({ address, server, chainId, prefix })
    const mainAsset = network === 'testnet' ? AssetMuon : AssetAtom

    let assetBalances = balances.map((balance) => {
      return {
        asset: (balance.denom && getAsset(balance.denom)) || mainAsset,
        amount: baseAmount(balance.amount, DECIMAL),
      }
    })

    // make sure we always have the main asset as balance in the array
    if (assetBalances.length === 0) {
      assetBalances = [
        {
          asset: mainAsset,
          amount: baseAmount(0, DECIMAL),
        },
      ]
    }

    return assetBalances.filter(
      (balance) => !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
    )
  } catch (error) {
    return Promise.reject(error)
  }
}

export const getBalance = ({
  network,
  address,
  assets,
}: {
  address: Address
  network: Network
  assets?: Asset[]
  prefix: string
}) => {
  const server = network === 'mainnet' ? 'https://api.cosmos.network' : 'http://lcd.gaia.bigdipper.live:1317'
  const chainId = network === 'mainnet' ? 'cosmoshub-3' : 'gaia-3a'
  const prefix = 'cosmos'
  return getGenericBalance({
    network,
    chainId,
    server,
    address,
    assets,
    prefix,
  })
}
