import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import { CryptoAmount, ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'

/**
 * Add LP
 * Returns tx
 */
const addSavers = async (tcAmm: ThorchainAMM, wallet: Wallet) => {
  try {
    const asset = new CryptoAmount(
      assetToBase(assetAmount(process.argv[4], Number(process.argv[5]))),
      assetFromStringEx(process.argv[6]),
    )
    const addlptx = await tcAmm.addSaver(wallet, asset)
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
  await addSavers(thorchainAmm, wallet)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
