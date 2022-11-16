import { Network } from '@xchainjs/xchain-client'
import { ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import { Midgard, SaversWithdraw, ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import { assetFromString } from '@xchainjs/xchain-util'

/**
 * Withdraw lp function
 * Returns tx
 */
const withdrawSavers = async (tcAmm: ThorchainAMM, wallet: Wallet) => {
  try {
    const asset = assetFromString(process.argv[4])
    const address = process.argv[5] || ''
    const withdrawBps = Number(process.argv[6])

    const saversWithdraw: SaversWithdraw = {
      asset,
      address,
      withdrawBps,
    }
    const withdraw = await tcAmm.withdrawSaver(wallet, saversWithdraw)
    console.log(withdraw)
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
  await withdrawSavers(thorchainAmm, wallet)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
