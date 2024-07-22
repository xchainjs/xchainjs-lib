import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'

const getMAYANamesOwned = async (mayachainAMM: MayachainAMM, address: string) => {
  const mayaNames = await mayachainAMM.getMAYANamesByOwner(address)
  mayaNames.forEach((mayaName) => {
    console.log({
      name: mayaName.name,
      owner: mayaName.owner,
      expire: mayaName.expire,
      entries: mayaName.entries.map((entry) => {
        return {
          address: entry.address,
          chain: entry.chain,
        }
      }),
    })
  })
}

const main = async () => {
  const address = `${process.argv[2]}`
  const mayachainAMM = new MayachainAMM()
  await getMAYANamesOwned(mayachainAMM, address)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
