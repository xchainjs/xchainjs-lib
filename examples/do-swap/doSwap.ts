import { ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import { CryptoAmount, EstimateSwapParams, ThorchainQuery, TxDetails } from '@xchainjs/xchain-thorchain-query'
import { Chain, assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

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

/**
 * From asset to asset with no Affiliate address on testnet
 */
const doSingleSwap = async (tcAmm: ThorchainAMM, wallet: Wallet) => {
  try {
    const amount = process.argv[4]
    const decimals = Number(process.argv[5])
    const fromAsset = assetFromString(`${process.argv[6]}`)
    const toAsset = assetFromString(`${process.argv[7]}`)

    const toChain = toAsset.synth ? Chain.THORChain : toAsset.chain
    const destinationAddress = wallet.clients[toChain].getAddress()

    console.log(destinationAddress)
    // console.log(await wallet.clients[fromChain].getBalance(fromAddress))

    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(amount, decimals)), fromAsset),
      destinationAsset: toAsset,
      destinationAddress,
      slipLimit: new BigNumber('0.03'), //optional
    }
    const affiliateAddress = process.argv[8]
    if (affiliateAddress) {
      const affiliateFeePercent = Number(process.argv[9])
      swapParams.affiliateAddress = affiliateAddress
      swapParams.affiliateFeePercent = affiliateFeePercent
    }
    const outPutCanSwap = await tcAmm.estimateSwap(swapParams)
    printTx(outPutCanSwap, swapParams.input)
    if (outPutCanSwap.txEstimate.canSwap) {
      const output = await tcAmm.doSwap(wallet, swapParams)
      console.log(`swap ${output}`)
      //console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${output.waitTimeSeconds}`)
    }
  } catch (error) {
    console.error(error)
  }
}

const main = async () => {
  const seed = process.argv[2]
  const thorchainQuery = new ThorchainQuery()
  const thorchainAmm = new ThorchainAMM(thorchainQuery)
  const wallet = new Wallet(seed, thorchainQuery)
  await doSingleSwap(thorchainAmm, wallet)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.error(err))
