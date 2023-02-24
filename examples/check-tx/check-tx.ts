import { Network } from '@xchainjs/xchain-client'
import { Midgard, ThorchainCache, Thornode, TransactionStage } from '@xchainjs/xchain-thorchain-query'

//function printTx(inboundTxHash: string, source: string) {}

const main = async () => {
  const network = process.argv[2] as Network
  const inboundTxHash = process.argv[3]
  const thorchainCache = new ThorchainCache(new Midgard(network), new Thornode(network))
  const transactionStage = new TransactionStage(thorchainCache)
  const checkTransaction = await transactionStage.checkTxProgress(inboundTxHash)

  console.log(`\ Checking on ${network} :)\n`)
  console.log(checkTransaction.txType)
  console.log(checkTransaction)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
