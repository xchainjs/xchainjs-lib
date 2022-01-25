import * as Bitcoin from 'bitcoinjs-lib'
import * as Utils from './utils'
import { Address, Network } from '@thorwallet/xchain-client/lib'
import { getSeed } from '@thorwallet/xchain-crypto/lib'
import { bip32 } from '@thorwallet/xchain-crypto'

const addrCache: Record<string, Record<number, string>> = {}

const rootDerivationPaths = {
  mainnet: `84'/0'/0'/0/`, //note this isn't bip44 compliant, but it keeps the wallets generated compatible to pre HD wallets
  testnet: `84'/1'/0'/0/`,
}

const getFullDerivationPath = (network: Network, index: number): string => {
  return rootDerivationPaths[network] + `${index}`
}

const getBtcKeys = async (network: Network, phrase: string, index: number): Promise<Bitcoin.ECPairInterface> => {
  const btcNetwork = Utils.btcNetwork(network)

  const seed = await getSeed(phrase)
  const master = await (await bip32.fromSeed(seed, btcNetwork)).derivePath(getFullDerivationPath(network, index))

  if (!master.privateKey) {
    throw new Error('Could not get private key from phrase')
  }

  return Bitcoin.ECPair.fromPrivateKey(master.privateKey, { network: btcNetwork })
}

export const getAddress = async ({
  network,
  phrase,
  index,
}: {
  network: Network
  phrase: string
  index: number
}): Promise<Address> => {
  if (index < 0) {
    throw new Error('index must be greater than zero')
  }
  if (addrCache[phrase] && addrCache[phrase][index]) {
    return addrCache[phrase][index]
  }
  const btcNetwork = Utils.btcNetwork(network)
  const btcKeys = await getBtcKeys(network, phrase, index)

  const { address } = Bitcoin.payments.p2wpkh({
    pubkey: btcKeys.publicKey,
    network: btcNetwork,
  })
  if (!address) {
    throw new Error('Address not defined')
  }
  if (!addrCache[phrase]) {
    addrCache[phrase] = {}
  }
  addrCache[phrase][index] = address
  return address
}
