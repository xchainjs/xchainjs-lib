import { Network } from '@thorwallet/xchain-client/lib'
import { CosmosSDKClient } from '@thorwallet/xchain-cosmos/lib'
import { getDefaultClientUrl } from './util'
const addrCache: Record<string, Record<number, string>> = {}

const rootDerivationPaths = {
  mainnet: "44'/931'/0'/0/",
  testnet: "44'/931'/0'/0/",
}

const getFullDerivationPath = (network: Network, index: number): string => {
  return rootDerivationPaths[network] + `${index}`
}

const getPrefix = (network: string) => (network === 'testnet' ? 'tthor' : 'thor')

export const getAddress = async ({
  network,
  phrase,
  index,
}: {
  network: Network
  phrase: string
  index: number
}): Promise<string> => {
  if (addrCache[phrase] && addrCache[phrase][index]) {
    return addrCache[phrase][index]
  }
  const cosmosClient = new CosmosSDKClient({
    server: getDefaultClientUrl()[network].node,
    chainId: 'thorchain',
    prefix: getPrefix(network),
  })

  const address = await cosmosClient.getAddressFromMnemonic(phrase, getFullDerivationPath(network, index))

  if (!address) {
    throw new Error('address not defined')
  }
  if (!addrCache[phrase]) {
    addrCache[phrase] = {}
  }
  addrCache[phrase][index] = address
  return address
}
