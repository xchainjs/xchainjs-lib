import { Client, defaultSolanaParams } from '@xchainjs/xchain-solana'

const main = async () => {
  const phrase = `${process.argv[2]}`
  const index = process.argv[3] ? Number(process.argv[3]) : 0
  const client = new Client({ ...defaultSolanaParams, phrase })

  const address = await client.getAddressAsync(index)

  console.log(`You account at index ${index} is ${address}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
