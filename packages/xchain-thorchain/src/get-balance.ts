import { Balance, Network } from '@thorwallet/xchain-client/lib'
import { getGenericBalance as getCosmosBalance } from '@thorwallet/xchain-cosmos/lib'
import { Asset, AssetRuneNative, assetToString, baseAmount } from '@thorwallet/xchain-util/lib'
import { DECIMAL, getDefaultClientUrl } from './util'

const getPrefix = (network: string) => (network === 'testnet' ? 'tthor' : 'thor')

export const getBalance = async ({
  address,
  assets,
  network,
}: {
  address: string
  assets?: Asset[]
  network: Network
}): Promise<Balance[]> => {
  const balances = await getCosmosBalance({
    address,
    network,
    chainId: 'thorchain',
    prefix: getPrefix(network),
    server: getDefaultClientUrl()[network].node,
  })
  let newBalances = balances.filter(
    (balance) => !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
  )

  // make sure we always have the bnb asset as balance in the array
  if (newBalances.length === 0) {
    newBalances = [
      {
        asset: AssetRuneNative,
        amount: baseAmount(0, DECIMAL),
      },
    ]
  }

  return newBalances
}
