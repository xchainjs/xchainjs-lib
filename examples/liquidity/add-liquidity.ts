import { Network } from '@xchainjs/xchain-client'
import { ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import {
  AddliquidityPosition,
  CryptoAmount,
  Midgard,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
} from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'
import { isAssetRuneNative } from '@xchainjs/xchain-thorchain' }

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
  const thorchainCache = new ThorchainCache(new Midgard(network), new Thornode(network))
  const thorchainQuery = new ThorchainQuery(thorchainCache)
  const thorchainAmm = new ThorchainAMM(thorchainQuery)
  const wallet = new Wallet(seed, thorchainQuery)
  await addLp(thorchainAmm, wallet)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
