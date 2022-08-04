import { Network } from '@xchainjs/xchain-client'
import {
  CryptoAmount,
  EstimateSwapParams,
  Midgard,
  SwapEstimate,
  ThorchainAMM,
  Wallet,
} from '@xchainjs/xchain-thorchain-amm'
import { AssetBNB, AssetLTC, assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

// Instantiate the classes needed
const mainnetMidgard = new Midgard(Network.Mainnet)
const mainetThorchainAmm = new ThorchainAMM(mainnetMidgard)
const mainnetWallet = new Wallet(Network.Mainnet, 'insert phrase here')

// Asset declaration
const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('Asset is incorrect')

// Helper function for printing out the returned object
function print(estimate: SwapEstimate, input: CryptoAmount) {
  const expanded = {
    input: input.formatedAssetString(),
    totalFees: {
      inboundFee: estimate.totalFees.inboundFee.formatedAssetString(),
      swapFee: estimate.totalFees.swapFee.formatedAssetString(),
      outboundFee: estimate.totalFees.outboundFee.formatedAssetString(),
      affiliateFee: estimate.totalFees.affiliateFee.formatedAssetString(),
    },
    slipPercentage: estimate.slipPercentage.toFixed(),
    netOutput: estimate.netOutput.formatedAssetString(),
    waitTimeSeconds: estimate.waitTimeSeconds.toFixed(),
    canSwap: estimate.canSwap,
    errors: estimate.errors,
  }
  console.log(expanded)
}

/**
 * Estimate swap function
 * Returns estimate swap object
 */
const estimateSwap = async () => {
  try {
    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.01)), AssetLTC),
      destinationAsset: AssetBNB,
      // affiliateFeePercent: 0.003, //optional
      slipLimit: new BigNumber('0.03'), //optional
    }
    const estimate = await mainetThorchainAmm.estimateSwap(swapParams)
    print(estimate, swapParams.input)

    // convert fees (by default returned in RUNE) to a different asset (BUSD)
    const estimateInBusd = await mainetThorchainAmm.getFeesIn(estimate.totalFees, AssetBNB)
    estimate.totalFees = estimateInBusd
    print(estimate, swapParams.input)
  } catch (e) {
    console.error(e)
  }
}

/**
 * From LTC to BNB - on mainnet
 */
const doDoubleSwapMainnet = async () => {
  try {
    const swapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(0.01)), AssetLTC),
      destinationAsset: AssetBNB,
      slipLimit: new BigNumber(0.5),
    }
    const output = await mainetThorchainAmm.doSwap(mainnetWallet, swapParams, mainnetWallet.clients['BNB'].getAddress())
    console.log(output)
  } catch (e) {
    console.log(e)
  }
}

// Call the function from main()
const main = async () => {
  await estimateSwap()
  await doDoubleSwapMainnet()
}

main()
