import { Network } from '@xchainjs/xchain-client'
import {
  CryptoAmount,
  EstimateSwapParams,
  Midgard,
  SwapEstimate,
  ThorchainAMM,
  Wallet,
} from '@xchainjs/xchain-thorchain-amm'
import { AssetBTC, AssetRuneNative, Chain, assetAmount, assetFromString, assetToBase } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

// Instantiate the classes needed
const testnetMidgard = new Midgard(Network.Testnet)
const mainnetMidgard = new Midgard(Network.Mainnet)
const testnetThorchainAmm = new ThorchainAMM(testnetMidgard)
const mainetThorchainAmm = new ThorchainAMM(mainnetMidgard)
const testnetWallet = new Wallet(Network.Testnet, 'insert phrase here')
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
      input: new CryptoAmount(assetToBase(assetAmount(0.001)), AssetBTC),
      destinationAsset: AssetRuneNative,
      // affiliateFeePercent: 0.003, //optional
      slipLimit: new BigNumber('0.03'), //optional
    }
    const estimate = await testnetThorchainAmm.estimateSwap(swapParams)
    print(estimate, swapParams.input)

    // convert fees (by default returned in RUNE) to a different asset (BUSD)
    const estimateInBusd = await testnetThorchainAmm.getFeesIn(estimate.totalFees, AssetBTC)
    estimate.totalFees = estimateInBusd
    print(estimate, swapParams.input)
  } catch (e) {
    console.error(e)
  }
}
/**
 * From RUNE to BTC with no Affiliate address on testnet
 */
const doSingleSwap = async () => {
  const swapParams = {
    input: new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative),
    destinationAsset: AssetBTC,
    slipLimit: new BigNumber('0.03'), //optional
  }
  try {
    const output = await testnetThorchainAmm.doSwap(
      testnetWallet,
      swapParams,
      testnetWallet.clients[Chain.Bitcoin].getAddress(),
    )
    console.log(output)
  } catch (error) {
    console.error(error)
  }
}

// Swap from BUSD to RUNE on mainnet
const doSwapMainnet = async () => {
  // From asset BUSD to RUNE
  const swapParams = {
    input: new CryptoAmount(assetToBase(assetAmount(3)), BUSD),
    destinationAsset: AssetRuneNative,
    slipLimit: new BigNumber(0.03),
  }
  try {
    const outPutCanSwap = await mainetThorchainAmm.estimateSwap(swapParams)
    print(outPutCanSwap, swapParams.input)
    if (outPutCanSwap.canSwap) {
      const output = await mainetThorchainAmm.doSwap(
        mainnetWallet,
        swapParams,
        mainnetWallet.clients[Chain.THORChain].getAddress(),
      )
      console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${output.waitTimeSeconds}`)
    }
  } catch (error: any) {
    console.log(error.message)
  }
}

// Call the function from main()
const main = async () => {
  await estimateSwap()
  await doSingleSwap()
  await doSwapMainnet()
}

main()
