import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { THORChain } from '@xchainjs/xchain-thorchain'
import { Wallet } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainCache, ThorchainQuery, Thornode } from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetFromString, assetToBase, register9Rheader } from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(axios)

/**
 * send an asset from your wallet to another address
 */
const doSend = async (wallet: Wallet) => {
  try {
    const decimals = Number(process.argv[5])
    const amount = assetAmount(process.argv[4], decimals)
    const asset = assetFromString(`${process.argv[6]}`)
    const destinationAddress = process.argv[7]
    const memo = process.argv[8]

    const toChain = asset.synth ? THORChain : asset.chain
    const client = wallet.clients[toChain]
    console.log(`sending ${amount.amount().toFixed()} ${asset.chain} to ${destinationAddress}`)
    const tx = await client.transfer({ recipient: destinationAddress, amount: assetToBase(amount), memo: memo })
    console.log(tx)
  } catch (error) {
    console.error(error)
  }
}

const main = async () => {
  const seed = process.argv[2]
  const network = process.argv[3] as Network
  const midgardCache = new MidgardCache(new Midgard(network))
  const thorchainCache = new ThorchainCache(new Thornode(network), new MidgardQuery(midgardCache))
  const thorchainQuery = new ThorchainQuery(thorchainCache)
  const wallet = new Wallet(seed, thorchainQuery)
  console.log(`\ Send on ${network} :)\n`)
  await doSend(wallet)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
