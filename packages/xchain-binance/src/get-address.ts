import * as crypto from '@binance-chain/javascript-sdk/lib/crypto'
import { bip32, getSeed } from '@thorwallet/xchain-crypto/lib'
import { Network } from './types'
import { getPrefix } from './util'

const addrCache: Record<string, Record<number, string>> = {}

const getPrivateKeyFromMnemonic = async (phrase: string, derive: boolean, index: number): Promise<string> => {
  const HDPATH = "44'/714'/0'/0/"
  const seed = await getSeed(phrase)
  if (derive) {
    const master = await bip32.fromSeed(seed)
    const child = await master.derivePath(HDPATH + index)
    if (!child.privateKey) {
      throw new Error('child does not have a privateKey')
    }

    return child.privateKey.toString('hex')
  }
  return seed.toString('hex')
}

export const getAddress = async ({
  network,
  phrase,
  index,
}: {
  network: Network
  phrase: string
  index: number
}): Promise<string> => {
  if (addrCache[phrase][index]) {
    return addrCache[phrase][index]
  }

  const address = crypto.getAddressFromPrivateKey(
    await getPrivateKeyFromMnemonic(phrase, true, index),
    getPrefix(network),
  )

  addrCache[phrase][index] = address
  return address
}
