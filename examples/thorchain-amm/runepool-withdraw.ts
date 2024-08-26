import { Client as THORClient, defaultClientConfig as defaultThorParams } from '@xchainjs/xchain-thorchain'
import { ThorchainAMM, WithdrawFromRunePoolParams } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Wallet } from '@xchainjs/xchain-wallet'

const withdrawFromRunePool = async (thorchainAMM: ThorchainAMM, params: WithdrawFromRunePoolParams) => {
  const txSubmitted = await thorchainAMM.withdrawFromRunePool(params)
  console.log(txSubmitted)
}

const main = async () => {
  const seed = process.argv[2]
  const withdrawBps = Number(process.env[3])
  const affiliate = process.env[4]
  const feeBps = Number(process.env[5])

  const wallet = new Wallet({
    THOR: new THORClient({
      ...defaultThorParams,
      phrase: seed,
    }),
  })
  const thorchainAMM = new ThorchainAMM(new ThorchainQuery(), wallet)

  const withdrawParams: WithdrawFromRunePoolParams = {
    withdrawBps,
    affiliate,
    feeBps,
  }

  await withdrawFromRunePool(thorchainAMM, withdrawParams)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
