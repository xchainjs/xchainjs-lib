import { Network } from '@xchainjs/xchain-client'
import { CheckTx, Midgard, ThorchainCache, Thornode } from '@xchainjs/xchain-thorchain-query'

//function printTx(inboundTxHash: string, source: string) {}

/**
 *
 */
const checkTransaction = async (checkTx: CheckTx, inboundTxHash: string) => {
  try {
    const sourceChainArg = process.argv[4]
    if (sourceChainArg == ``) {
      console.log(`no sourcechain provided: ${sourceChainArg}`)
    }

    const status = await checkTx.checkTx(inboundTxHash)
    console.log(`Outcome of checkTx was : ${status}`)
  } catch (error) {
    console.error(error)
  }
}

const main = async () => {
  const network = process.argv[2] as Network
  const inboundTxHash = process.argv[3]
  const thorchainCache = new ThorchainCache(new Midgard(network), new Thornode(network))
  const checkTx = new CheckTx(thorchainCache)

  console.log(`\ Checking on ${network} :)\n`)
  checkTransaction(checkTx, inboundTxHash)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
