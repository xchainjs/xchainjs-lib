import cosmosclient from '@cosmos-client/core'
import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain'
import { ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import {
  AddliquidityPosition,
  CryptoAmount,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetFromStringEx, assetToBase, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(cosmosclient.config.globalAxios)
register9Rheader(axios)

/**
 * Add LP
 * Returns tx
 */
const addLp = async (tcAmm: ThorchainAMM, wallet: Wallet) => {
  try {
    const rune = new CryptoAmount(assetToBase(assetAmount(process.argv[4])), assetFromStringEx(process.argv[5]))
    if (!isAssetRuneNative(rune.asset)) {
      throw Error('THOR.RUNE  must be the first argument')
    }
    const asset = new CryptoAmount(
      assetToBase(assetAmount(process.argv[6], Number(process.argv[7]))),
      assetFromStringEx(process.argv[8]),
    )

    const addLpParams: AddliquidityPosition = {
      asset,
      rune,
    }
    const addlptx = await tcAmm.addLiquidityPosition(wallet, addLpParams)
    console.log(addlptx)
  } catch (e) {
    console.error(e)
  }
}

// Call the function from main()
const main = async () => {
  const seed = process.argv[2]
  const network = process.argv[3] as Network
  const midgardCache = new MidgardCache(new Midgard(network))
  const thorchainCache = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
  const thorchainQuery = new ThorchainQuery(thorchainCache)
  const thorchainAmm = new ThorchainAMM(thorchainQuery)
  const wallet = new Wallet(seed, thorchainQuery)
  await addLp(thorchainAmm, wallet)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
