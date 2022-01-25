import * as Utils from './utils'
import * as Litecoin from 'bitcoinjs-lib' // https://github.com/bitcoinjs/bitcoinjs-lib

import { Address } from '@thorwallet/xchain-client/lib'
import { Network } from './client'
import { bip32, getSeed } from '@thorwallet/xchain-crypto/lib'

const addrCache: Record<string, Record<number, string>> = {}

const rootDerivationPaths = {
  mainnet: `m/84'/2'/0'/0/`,
  testnet: `m/84'/1'/0'/0/`,
}

const getFullDerivationPath = (network: Network, index: number): string => {
  return rootDerivationPaths[network] + `${index}`
}

const getLtcKeys = async ({
  network,
  phrase,
  index,
}: {
  network: Network
  phrase: string
  index: number
}): Promise<Litecoin.ECPairInterface> => {
  const ltcNetwork = Utils.ltcNetwork(network)

  const seed = await getSeed(phrase)
  const master = await (await bip32.fromSeed(seed, ltcNetwork)).derivePath(getFullDerivationPath(network, index))

  if (!master.privateKey) {
    throw new Error('Could not get private key from phrase')
  }

  return Litecoin.ECPair.fromPrivateKey(master.privateKey, { network: ltcNetwork })
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
  const ltcNetwork = Utils.ltcNetwork(network)
  const ltcKeys = await getLtcKeys({ network, phrase, index })

  const { address } = Litecoin.payments.p2wpkh({
    pubkey: ltcKeys.publicKey,
    network: ltcNetwork,
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
