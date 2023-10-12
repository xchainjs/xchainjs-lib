import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import { SaversWithdraw, ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import { assetFromString, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(axios)

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
  const midgardCache = new MidgardCache(new Midgard(network))
  const thorchainCache = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
  const thorchainQuery = new ThorchainQuery(thorchainCache)
  const thorchainAmm = new ThorchainAMM(thorchainQuery)
  const wallet = new Wallet(seed, thorchainQuery)
  await withdrawSavers(thorchainAmm, wallet)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
