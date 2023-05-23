import { Network } from '@xchainjs/xchain-client'
import { ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import {
  Midgard,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  WithdrawLiquidityPosition,
} from '@xchainjs/xchain-thorchain-query'
import { assetFromString } from '@xchainjs/xchain-util'

/**
 * Withdraw lp function
 * Returns tx
 */
const withdrawLp = async (tcAmm: ThorchainAMM, wallet: Wallet) => {
  try {
    const asset = assetFromString(process.argv[4])
    const percentage = Number(process.argv[5])
    const assetAddress = process.argv[6] || ''
    const runeAddress = process.argv[7] || ''

    const withdrawLpParams: WithdrawLiquidityPosition = {
      asset,
      percentage,
      assetAddress,
      runeAddress,
    }
    const withdraw = await tcAmm.withdrawLiquidityPosition(wallet, withdrawLpParams)
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
  await withdrawLp(thorchainAmm, wallet)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
