import { Network } from '@xchainjs/xchain-client'
import { Midgard } from '@xchainjs/xchain-midgard-query'

const main = async () => {
  const network = process.argv[2] as Network

  const midgard = new Midgard(network)
  console.table(await midgard.getPools())
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
