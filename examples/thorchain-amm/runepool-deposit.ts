import {
  AssetRuneNative,
  Client as THORClient,
  defaultClientConfig as defaultThorParams,
} from '@xchainjs/xchain-thorchain'
import { ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { AssetCryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

const depositToRunePool = async (thorchainAMM: ThorchainAMM, amount: AssetCryptoAmount) => {
  const txSubmitted = await thorchainAMM.depositToRunePool({
    amount,
  })
  console.log(txSubmitted)
}

const main = async () => {
  const seed = process.argv[2]
  const amount = assetAmount(process.argv[3], 8)

  const wallet = new Wallet({
    THOR: new THORClient({
      ...defaultThorParams,
      phrase: seed,
    }),
  })
  const thorchainAMM = new ThorchainAMM(new ThorchainQuery(), wallet)

  await depositToRunePool(thorchainAMM, new AssetCryptoAmount(assetToBase(amount), AssetRuneNative))
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
