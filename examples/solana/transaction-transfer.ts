import { Client, SOL_DECIMALS, defaultSolanaParams } from '@xchainjs/xchain-solana'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'

const main = async () => {
  const phrase = `${process.argv[2]}`
  const recipient = `${process.argv[3]}`
  const amount = assetAmount(`${process.argv[4]}`, SOL_DECIMALS)

  const client = new Client({
    ...defaultSolanaParams,
    phrase,
  })

  const hash = await client.transfer({
    recipient,
    amount: assetToBase(amount),
  })

  console.log({
    hash,
    url: client.getExplorerTxUrl(hash),
  })
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
