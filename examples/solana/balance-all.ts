import { Client } from '@xchainjs/xchain-solana'
import { assetToString, baseToAsset } from '@xchainjs/xchain-util'

const main = async () => {
  const address = `${process.argv[2]}`
  const client = new Client()

  const balances = await client.getBalance(address)

  console.log('---------------------------------------------------')
  console.log(`${address} balances`)
  console.log('---------------------------------------------------')
  console.table(
    balances.map((balance) => {
      return { Asset: assetToString(balance.asset), Amount: baseToAsset(balance.amount).amount().toString() }
    }),
  )
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
