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
import { assetAmount, assetFromStringEx, assetToBase, isAssetRuneNative } from '@xchainjs/xchain-util'

/**
 * Add LP
 * Returns tx
 */
const addLp = async (tcAmm: ThorchainAMM, wallet: Wallet) => {
  try {
    const input1 = new CryptoAmount(assetToBase(assetAmount(process.argv[4])), assetFromStringEx(process.argv[5]))
    const input2 = new CryptoAmount(assetToBase(assetAmount(process.argv[6])), assetFromStringEx(process.argv[7]))

    const rune = isAssetRuneNative(input1.asset) ? input1 : input2
    const asset = isAssetRuneNative(input1.asset) ? input2 : input1

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
