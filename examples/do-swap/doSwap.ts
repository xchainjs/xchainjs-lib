import { Network } from '@xchainjs/xchain-client'
import { THORChain } from '@xchainjs/xchain-thorchain'
import { AmmEstimateSwapParams, ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import {
  CryptoAmount,
  Midgard,
  ThorchainCache,
  ThorchainQuery,
  Thornode,
  TxDetails,
} from '@xchainjs/xchain-thorchain-query'
import { assetAmount, assetFromString, assetToBase, delay } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { checkTx } from '../check-tx/check-tx'

function printTx(txDetails: TxDetails, input: CryptoAmount) {
  const expanded = {
    memo: txDetails.memo,
    expiry: txDetails.expiry,
    toAddress: txDetails.toAddress,
    txEstimate: {
      input: input.formatedAssetString(),
      totalFees: {
        inboundFee: txDetails.txEstimate.totalFees.inboundFee.formatedAssetString(),
        swapFee: txDetails.txEstimate.totalFees.swapFee.formatedAssetString(),
        outboundFee: txDetails.txEstimate.totalFees.outboundFee.formatedAssetString(),
        affiliateFee: txDetails.txEstimate.totalFees.affiliateFee.formatedAssetString(),
      },
      slipPercentage: txDetails.txEstimate.slipPercentage.toFixed(),
      netOutput: txDetails.txEstimate.netOutput.formatedAssetString(),
      waitTimeSeconds: txDetails.txEstimate.waitTimeSeconds.toFixed(),
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

/**
 * From asset to asset with no Affiliate address on testnet
 */
const doSingleSwap = async (tcAmm: ThorchainAMM, wallet: Wallet, network: Network) => {
  try {
    const amount = process.argv[4]
    const decimals = Number(process.argv[5])
    const fromAsset = assetFromString(`${process.argv[6]}`)
    const toAsset = assetFromString(`${process.argv[7]}`)

    const toChain = toAsset.synth ? THORChain : toAsset.chain
    const destinationAddress = wallet.clients[toChain].getAddress()

    // console.log(await wallet.clients[fromChain].getBalance(fromAddress))

    const swapParams: AmmEstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(amount, decimals)), fromAsset),
      destinationAsset: toAsset,
      destinationAddress,
      slipLimit: new BigNumber('0.05'), //optional
      wallet,
      walletIndex: 0,
    }
    const affiliateAddress = process.argv[8]
    if (affiliateAddress) {
      const affiliateFeeBasisPoints = Number(process.argv[9])
      swapParams.affiliateAddress = affiliateAddress
      swapParams.affiliateFeeBasisPoints = affiliateFeeBasisPoints
    }
    const outPutCanSwap = await tcAmm.estimateSwap(swapParams)
    printTx(outPutCanSwap, swapParams.input)
    if (outPutCanSwap.txEstimate.canSwap) {
      const output = await tcAmm.doSwap(wallet, swapParams)
      console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${output.waitTimeSeconds}`)
      console.log('Waiting for transaction to be confirmed...')
      await delayedLog('hash', output.waitTimeSeconds * 1000)
      await checkTx(network, output.hash)
    }
  } catch (error) {
    console.error(error)
  }
}

const main = async () => {
  const seed = process.argv[2]
  const network = process.argv[3] as Network
  const thorchainCache = new ThorchainCache(new Midgard(network), new Thornode(network))
  const thorchainQuery = new ThorchainQuery(thorchainCache)
  const thorchainAmm = new ThorchainAMM(thorchainQuery)
  const wallet = new Wallet(seed, thorchainQuery)
  await doSingleSwap(thorchainAmm, wallet, network)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
