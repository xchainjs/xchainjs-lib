import { Network } from '@xchainjs/xchain-client'
import {
  CryptoAmount,
  EstimateSwapParams,
  Midgard,
  SwapEstimate,
  ThorchainAMM,
  Wallet,
} from '@xchainjs/xchain-thorchain-amm'
import { AssetBTC, AssetRuneNative, assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

const testnetMidgard = new Midgard(Network.Testnet)
//const mainnetMidgard = new Midgard(Network.Mainnet)
const testnetThorchainAmm = new ThorchainAMM(testnetMidgard)
//const mainetThorchainAmm = new ThorchainAMM(mainnetMidgard)
const testnetWallet = new Wallet(Network.Testnet, 'Insert testnet phrase here' || 'you forgot to set the phrase')
//const mainnetWallet = new Wallet(Network.Mainnet, 'insert mainnet phrase here' || 'you forgot to set the phrase')

// Asset declaration
const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('Asset is incorrect')

const sBTC = assetFromString('BTC/BTC')
console.log('sBTC?.chain=' + sBTC?.chain)
if (!sBTC) throw Error('Synthetic asset is incorrect')

// Instantiate the classes needed
const midgard = new Midgard(Network.Mainnet)
const thorchainAmm = new ThorchainAMM(midgard)

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
      input: new CryptoAmount(assetToBase(assetAmount(0.0001)), AssetBTC),
      destinationAsset: AssetRuneNative,
      // affiliateFeePercent: 0.003, //optional
      slipLimit: new BigNumber('0.03'), //optional
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    print(estimate, swapParams.input)

    // convert fees (by default returned in RUNE) to a different asset (BUSD)
    const estimateInBusd = await thorchainAmm.getFeesIn(estimate.totalFees, AssetBTC)
    estimate.totalFees = estimateInBusd
    print(estimate, swapParams.input)
  } catch (e) {
    console.error(e)
  }
}
// From BTC to RUNE with no Affiliate address - passes
const doSingleSwap = async () => {
  const swapParams = {
    input: new CryptoAmount(assetToBase(assetAmount(0.0001)), AssetBTC),
    destinationAsset: AssetRuneNative,
    // affiliateFeePercent: 0.1,
  }
  const output = await testnetThorchainAmm.doSwap(testnetWallet, swapParams, testnetWallet.clients['THOR'].getAddress())
  console.log(output)
  expect(output.hash).toBeTruthy()
}

// Call the function from main()
const main = async () => {
  await estimateSwap()
  await doSingleSwap()
}

main()
