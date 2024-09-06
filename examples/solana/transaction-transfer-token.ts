import { Client, defaultSolanaParams } from '@xchainjs/xchain-solana'
import { Asset, TokenAsset, assetAmount, assetFromStringEx, assetToBase } from '@xchainjs/xchain-util'

const main = async () => {
  const phrase = `${process.argv[2]}`
  const recipient = `${process.argv[3]}`
  const asset = assetFromStringEx(`${process.argv[4]}`) as Asset | TokenAsset
  const amount = assetAmount(`${process.argv[6]}`, Number(process.argv[5]))

  const client = new Client({
    ...defaultSolanaParams,
    phrase,
  })

  const hash = await client.transfer({
    recipient,
    asset,
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
