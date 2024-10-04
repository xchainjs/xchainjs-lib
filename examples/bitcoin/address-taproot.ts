import { AddressFormat, Client, defaultBTCParams, tapRootDerivationPaths } from '@xchainjs/xchain-bitcoin'

const main = async () => {
  const phrase = `${process.argv[2]}`
  const index = process.argv[3] ? Number(process.argv[3]) : 0

  const client = new Client({
    ...defaultBTCParams,
    phrase,
    rootDerivationPaths: tapRootDerivationPaths,
    addressFormat: AddressFormat.P2TR,
  })

  const address = await client.getAddressAsync(index)

  console.log(`Your Taproot account at index ${index} is ${address}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
