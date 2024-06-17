import { MayachainAMM } from '@xchainjs/xchain-mayachain-amm'

const getMAYANameDetails = async (mayachainAMM: MayachainAMM, mayaName: string) => {
  const details = await mayachainAMM.getMAYANameDetails(mayaName)
  console.log({
    name: details.name,
    owner: details.owner,
    expire: details.expire,
    entries: details.entries.map((entry) => {
      return {
        address: entry.address,
        chain: entry.chain,
      }
    }),
  })
}

const main = async () => {
  const mayaName = `${process.argv[2]}`
  const mayachainAMM = new MayachainAMM()
  await getMAYANameDetails(mayachainAMM, mayaName)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
