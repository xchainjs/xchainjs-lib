import cosmosclient from '@cosmos-client/core'
import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { THORChain } from '@xchainjs/xchain-thorchain'
import { AmmEstimateSwapParams, ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainCache, ThorchainQuery, Thornode, TxDetails } from '@xchainjs/xchain-thorchain-query'
import {
  CryptoAmount,
  assetAmount,
  assetFromString,
  assetToBase,
  assetToString,
  delay,
  register9Rheader,
} from '@xchainjs/xchain-util'
import axios from 'axios'

import { checkTx } from '../check-tx/check-tx'

register9Rheader(cosmosclient.config.globalAxios)
register9Rheader(axios)

function printTx(txDetails: TxDetails, input: CryptoAmount) {
  const expanded = {
    memo: txDetails.memo,
    expiry: txDetails.expiry,
    toAddress: txDetails.toAddress,
    txEstimate: {
      input: input.formatedAssetString(),
      totalFees: {
        asset: assetToString(txDetails.txEstimate.totalFees.asset),
        outboundFee: txDetails.txEstimate.totalFees.outboundFee.formatedAssetString(),
        affiliateFee: txDetails.txEstimate.totalFees.affiliateFee.formatedAssetString(),
      },
      slipBasisPoints: txDetails.txEstimate.slipBasisPoints.toFixed(),
      netOutput: txDetails.txEstimate.netOutput.formatedAssetString(),
      outboundDelaySeconds: txDetails.txEstimate.outboundDelaySeconds,
      canSwap: txDetails.txEstimate.canSwap,
      errors: txDetails.txEstimate.errors,
    },
  }
  console.log(expanded)
}

const delayedLog = async (message: string, delayMs: number) => {
  const startTime = new Date().getTime()
  const endTime = startTime + delayMs
  let remainingTime = delayMs

  while (remainingTime > 0) {
    const elapsedMs = delayMs - remainingTime
    const remainingSeconds = Math.ceil(remainingTime / 1000)
    const elapsedSeconds = Math.floor(elapsedMs / 1000)
    const progress = Math.floor((elapsedMs / delayMs) * 100)

    console.log(`${message} (${elapsedSeconds}s/${remainingSeconds}s ${progress}%)`)

    await delay(500)
    remainingTime = endTime - new Date().getTime()
  }

  console.log(`${message} (Done!)`)
}

const doStreamingSwap = async (tcAmm: ThorchainAMM, wallet: Wallet, network: Network) => {
  try {
    const amount = process.argv[4]
    const decimals = Number(process.argv[5])
    const fromAsset = assetFromString(`${process.argv[6]}`)
    const toAsset = assetFromString(`${process.argv[7]}`)
    const streamingInterval = Number(process.argv[8])
    const streamingQuantity = Number(process.argv[9])

    const toChain = toAsset.synth ? THORChain : toAsset.chain
    const destinationAddress = wallet.clients[toChain].getAddress()

    const swapParams: AmmEstimateSwapParams = {
      fromAsset,
      amount: new CryptoAmount(assetToBase(assetAmount(amount, decimals)), fromAsset),
      destinationAsset: toAsset,
      destinationAddress,
      streamingInterval,
      streamingQuantity,
      // toleranceBps: 0, // WARNING: No compatible with Streaming Swap
      wallet,
      walletIndex: 0,
    }
    const affiliateAddress = process.argv[10]
    if (affiliateAddress) {
      const affiliateFeeBasisPoints = Number(process.argv[11])
      swapParams.affiliateAddress = affiliateAddress
      swapParams.affiliateBps = affiliateFeeBasisPoints
    }
    const outPutCanSwap = await tcAmm.estimateSwap(swapParams)
    printTx(outPutCanSwap, swapParams.amount)
    if (outPutCanSwap.txEstimate.canSwap) {
      const output = await tcAmm.doSwap(wallet, swapParams)
      console.log(
        `Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${outPutCanSwap.txEstimate.outboundDelaySeconds}`,
      )
      console.log('Waiting for transaction to be confirmed...')
      await delayedLog(
        'hash',
        outPutCanSwap.txEstimate.outboundDelaySeconds <= 6
          ? 20000
          : outPutCanSwap.txEstimate.outboundDelaySeconds * 1000,
      )
      await checkTx(network, output.hash)
    }
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
  const thorchainAmm = new ThorchainAMM(thorchainQuery)
  const wallet = new Wallet(seed, thorchainQuery)
  await doStreamingSwap(thorchainAmm, wallet, network)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
