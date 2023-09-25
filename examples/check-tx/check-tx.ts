import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { ThorchainCache, Thornode, TransactionStage } from '@xchainjs/xchain-thorchain-query'

//function printTx(inboundTxHash: string, source: string) {}

export const checkTx = async (network: Network, inboundHash: string) => {
  const midgardCache = new MidgardCache(new Midgard(network))
  const thorchainCache = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
  const transactionStage = new TransactionStage(thorchainCache)
  const checkTransaction = await transactionStage.checkTxProgress(inboundHash)
  console.log(`\ Checking on ${network} :)\n`)
  console.log(checkTransaction.txType)
  console.log(checkTransaction)
}

const main = async () => {
  const network = process.argv[2] as Network
  const inboundTxHash = process.argv[3]
  await checkTx(network, inboundTxHash)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
