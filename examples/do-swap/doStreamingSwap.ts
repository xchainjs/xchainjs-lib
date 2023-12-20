import cosmosclient from '@cosmos-client/core'
import { decryptFromKeystore } from "@xchainjs/xchain-crypto"
import { readFileSync } from 'fs';
import { Network } from '@xchainjs/xchain-client'
import { Midgard, MidgardCache, MidgardQuery } from '@xchainjs/xchain-midgard-query'
import { THORChain } from '@xchainjs/xchain-thorchain'
import { AmmEstimateSwapParams, ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import { CryptoAmount, ThorchainCache, ThorchainQuery, Thornode, TxDetails } from '@xchainjs/xchain-thorchain-query'
import {
  assetAmount,
  assetFromString,
  assetToBase,
  register9Rheader,
} from '@xchainjs/xchain-util'
import axios from 'axios'

register9Rheader(cosmosclient.config.globalAxios)
register9Rheader(axios)

function printTx(txDetails: TxDetails, input: CryptoAmount) {
  const expanded = {
    memo: txDetails.memo,
    expiry: txDetails.expiry,
    toAddressVault: txDetails.toAddress,
    txEstimate: {
      input: input.formatedAssetString(),
      outboundFee: txDetails.txEstimate.totalFees.outboundFee.formatedAssetString(),
      slipBasisPoints: txDetails.txEstimate.slipBasisPoints.toFixed(),
      netOutput: txDetails.txEstimate.netOutput.formatedAssetString(),
      outboundDelaySeconds: txDetails.txEstimate.outboundDelaySeconds,
      canSwap: txDetails.txEstimate.canSwap,
      errors: txDetails.txEstimate.errors,
    },
  }
  console.log(expanded)
}

const doStreamingSwap = async (tcAmm: ThorchainAMM, wallet: Wallet, network: Network) => {
  try {
    const amount = process.argv[4]
    const decimals = Number(process.argv[5])
    const fromAsset = assetFromString(`${process.argv[6]}`)
    const toAsset = assetFromString(`${process.argv[7]}`)
    const toChain = toAsset.synth ? THORChain : toAsset.chain
    const destinationAddress = wallet.clients[toChain].getAddress()

    const swapParams: AmmEstimateSwapParams = {
      fromAsset,
      amount: new CryptoAmount(assetToBase(assetAmount(amount, decimals)), fromAsset),
      destinationAsset: toAsset,
      destinationAddress,
      streamingInterval: 1,
      streamingQuantity: 0,
      wallet,
      walletIndex: 0,
    }
    const outPutCanSwap = await tcAmm.estimateSwap(swapParams)
    printTx(outPutCanSwap, swapParams.amount)
    if (outPutCanSwap.txEstimate.canSwap) {
      const output = await tcAmm.doSwap(wallet, swapParams)
      console.log(
        `Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${outPutCanSwap.txEstimate.outboundDelaySeconds}`,
      )
    }
  } catch (error) {
    console.error(error)
  }
}

const main = async () => {
  const pass = process.argv[2]
  const keyStore = JSON.parse(readFileSync(process.argv[8], 'utf8'))
  const seed = await decryptFromKeystore(keyStore, pass)
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
