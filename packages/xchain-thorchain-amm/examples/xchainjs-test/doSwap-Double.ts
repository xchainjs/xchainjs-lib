import { Network } from '@xchainjs/xchain-client'
import { CryptoAmount, Midgard, SwapEstimate, ThorchainAMM, Wallet } from '@xchainjs/xchain-thorchain-amm'
import {
  Asset,
  AssetBCH,
  AssetBNB,
  AssetBTC,
  AssetDOGE,
  AssetETH,
  AssetLTC,
  AssetRuneNative,
  assetAmount,
  assetFromString,
  assetToBase,
} from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

// Instantiate the classes needed
const mainnetMidgard = new Midgard(Network.Mainnet)
const mainetThorchainAmm = new ThorchainAMM(mainnetMidgard)
const mainnetWallet = new Wallet(Network.Mainnet, process.argv[2])

// Asset declaration
const BUSD = assetFromString('BNB.BUSD-BD1')
if (!BUSD) throw Error('Asset is incorrect')

// Asset amount captured from cmd args
const amount = process.argv[4]

// Captured from args
// Captured from args

const getAsset = (asset: string): Asset => {
  switch (asset) {
    case 'BNB':
      return AssetBNB
    case 'BTC':
      return AssetBTC
    case 'ETH':
      return AssetETH
    case 'RUNE':
      return AssetRuneNative
    case 'BCH':
      return AssetBCH
    case 'LTC':
      return AssetLTC
    case 'DOGE':
      return AssetDOGE
    case 'BUSD':
      return BUSD
    default:
      throw Error('Unknown chain')
  }
}

const fromAsset = getAsset(process.argv[5])
const toAsset = getAsset(process.argv[6])

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
 * From asset to asset - on testnet
 */
const doDoubleSwap = async () => {
  try {
    console.log('Double Swap on testnet :)')
    const swapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(amount)), fromAsset),
      destinationAsset: toAsset,
      slipLimit: new BigNumber(0.5),
    }
    const outPutCanSwap = await mainetThorchainAmm.estimateSwap(swapParams)
    print(outPutCanSwap, swapParams.input)
    const output = await mainetThorchainAmm.doSwap(
      mainnetWallet,
      swapParams,
      mainnetWallet.clients[toAsset.chain].getAddress(),
    )
    console.log(output)
  } catch (e) {
    console.log(e)
  }
}

/**
 * From asset to asset - on mainnet
 */
const doDoubleSwapMainnet = async () => {
  try {
    console.log('Double Swap on mainnet :)')
    const swapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(amount)), fromAsset),
      destinationAsset: toAsset,
      slipLimit: new BigNumber(0.5),
    }
    const outPutCanSwap = await mainetThorchainAmm.estimateSwap(swapParams)
    print(outPutCanSwap, swapParams.input)
    const output = await mainetThorchainAmm.doSwap(
      mainnetWallet,
      swapParams,
      mainnetWallet.clients[toAsset.chain].getAddress(),
    )
    console.log(output)
  } catch (e) {
    console.log(e)
  }
}

// Call the function from main()
const main = async () => {
  if (process.argv[3] === 'testnet') {
    await doDoubleSwap()
  }
  if (process.argv[3] === 'mainnet') {
    await doDoubleSwapMainnet()
  }
}

main()
