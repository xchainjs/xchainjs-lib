import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, AssetBTC, AssetRuneNative,  Asset, Chain } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'
require('dotenv').config();
import { ThorchainAMM } from '../src/ThorchainAMM'
import { Wallet } from '../src/Wallet'
import { Midgard } from '../src/utils/midgard'


//const mainnetMidgard = new Midgard(Network.Mainnet)
const testnetMidgard = new Midgard(Network.Testnet)
//const mainetThorchainAmm = new ThorchainAMM(mainnetMidgard)
const testnetThorchainAmm = new ThorchainAMM(testnetMidgard)
const testnetWallet = new Wallet(Network.Testnet, process.env.TESTNETPHRASE || 'you forgot to set the phrase')
//const mainnetWallet = new Wallet(Network.Mainnet, process.env.MAINNETPHRASE || 'you forgot to set the phrase')
// const sBTC: Asset = {
//   chain: Chain.THORChain,
//   symbol: "BTC",
//   ticker: "BTC",
//   synth: true
// }
// const sBNB: Asset = {
//   chain: Chain.THORChain,
//   symbol: "BNB",
//   ticker: "BNB",
//   synth: true
// }
const USDT: Asset = {
  chain: Chain.Ethereum,
  symbol: "USDT",
  ticker: "USDT",
  synth: false
}
// const USDC: Asset = {
//   chain: Chain.Ethereum,
//   symbol: "USDC",
//   ticker: "USDC",
//   synth: false
// }

describe('xchain-swap Integration Tests', () => {
  // From BTC to RUNE with no Affiliate address
  // it(`Should swap BTC to RUNE, with no affiliate address  `, async () => {
  //   const estimateSwapParams = {
  //     sourceAsset: AssetBTC,
  //     destinationAsset: AssetRuneNative,
  //     inputAmount: assetToBase(assetAmount(0.0001)),
  //     // affiliateFeePercent: 0.1,
  //   }
  //   const output = await testnetThorchainAmm.doSwap(
  //     testnetWallet,
  //     estimateSwapParams,
  //     testnetWallet.clients['THOR'].getAddress(),
  //   )
  //   console.log(output)
  //   expect(output.hash).toBeTruthy()
  // })
  // From BTC to Rune but fail on destination address
  it(`Should fail to swap BTC to RUNE, if dest address is not for the correct chain  `, async () => {
    const estimateSwapParams = {
      sourceAsset: AssetBTC,
      destinationAsset: AssetRuneNative,
      inputAmount: assetToBase(assetAmount(0.0001)),
      // affiliateFeePercent: 0.1,
    }
    try {
      const output = await testnetThorchainAmm.doSwap(
        testnetWallet,
        estimateSwapParams,
        await testnetWallet.clients['BNB'].getAddress(), // put the wrong chain address here to trigger error
      )
      console.log(output.hash)
      // fail()
    } catch (error: any) {
      expect(error.message).toEqual(`tbnb1kmu0n6s44cz5jxdvkvsvrzgr57ndg6atw5zrys is not a valid address`)
    }
  })
  //From Rune to ETH
  // it(`Should swap from RUNE to ETH`, async () => {
  //   const estimateSwapParams = {
  //     sourceAsset: AssetRuneNative,
  //     destinationAsset: AssetETH,
  //     inputAmount: assetToBase(assetAmount(100)),
  //     slipLimit: new BigNumber(0.5),
  //     // affiliateFeePercent: 0.1,
  //   }
  //   const output = await testnetThorchainAmm.doSwap(
  //     testnetWallet,
  //     estimateSwapParams,
  //     testnetWallet.clients['ETH'].getAddress(),
  //   )
  //   console.log(output)
  //   expect(output.hash).toBeTruthy()
  // })
  // From BNB to ETH
  // it(`Should perform a double swap from BNB to ETH`, async () => {
  //   const estimateSwapParams = {
  //     sourceAsset: AssetBNB,
  //     destinationAsset: AssetETH,
  //     inputAmount: assetToBase(assetAmount(0.0001)),
  //     slipLimit: new BigNumber(0.5),
  //     // affiliateFeePercent: 0.1,
  //   }
  //   const output = await testnetThorchainAmm.doSwap(
  //     testnetWallet,
  //     estimateSwapParams,
  //     testnetWallet.clients['ETH'].getAddress(),
  //   )
  //   console.log(output)
  //   expect(output.hash).toBeTruthy()
  // })

  // From asset to synth .. doesn't work at this stage
  // it(`Should perform a swap from BNB to synthBTC`, async () => {

  //   const estimateSwapParams = {
  //     sourceAsset: AssetBNB,
  //     destinationAsset: sBTC,
  //     inputAmount: assetToBase(assetAmount(0.02)),
  //     slipLimit: new BigNumber(0.5),
  //     affiliateFeePercent: 0.1,
  //   }
  //   try {
  //     const output = await mainetThorchainAmm.doSwap(
  //       mainnetWallet,
  //       estimateSwapParams,
  //       mainnetWallet.clients['THOR'].getAddress(),
  //     )
  //     console.log(`tx hash: ${output.hash}, \n Tx url: ${output.url} \n WaitTime:${output.waitTime}`)
  //     expect(output).toBeTruthy()

  //   }catch(error: any){
  //     console.log(error.message)
  //   }
  // })

  // // From synth to Asset
  // it(`Should perform a swap from synthBTC to BNB`, async () => {
  //   const estimateSwapParams = {
  //     sourceAsset: sBTC,
  //     destinationAsset: AssetBNB,
  //     inputAmount: assetToBase(assetAmount(0.01)),
  //   }
  //   try {
  //     const output = await mainetThorchainAmm.doSwap(
  //       mainnetWallet,
  //       estimateSwapParams,
  //       mainnetWallet.clients['BNB'].getAddress(),
  //     )
  //     console.log(`tx hash: ${output.hash}, \n Tx url: ${output.url} \n WaitTime:${output.waitTime}`)
  //     expect(output).toBeTruthy()

  //   }catch(error: any){
  //     console.log(error.message)
  //   }
  // })

  // From synth to synth
  // it(`Should perform a swap from synthBTC to synthBNB`, async () => {
  //   const estimateSwapParams = {
  //     sourceAsset: sBTC,
  //     destinationAsset: sBNB,
  //     inputAmount: assetToBase(assetAmount(0.0001)),
  //     slipLimit: new BigNumber(0.5),
  //     affiliateFeePercent: 0.1,
  //   }
  //   try {
  //     const output = await mainetThorchainAmm.doSwap(
  //       mainnetWallet,
  //       estimateSwapParams,
  //       mainnetWallet.clients['THOR'].getAddress(),

  //     )
  //     console.log(`Tx hash: ${output.hash},\n Tx url: ${output.url}\n WaitTime: ${output.waitTime}`)
  //     expect(output).toBeTruthy()

  //   }catch(error: any){
  //     console.log(error.message)
  //   }
  // })

  // // From ETH to Asset -- passes
  // it(`Should perform a double swap from ETH to BNB`, async () => {
  //   const estimateSwapParams = {
  //     sourceAsset: AssetETH,
  //     destinationAsset: AssetBNB,
  //     inputAmount: assetToBase(assetAmount(1)),
  //     slipLimit: new BigNumber(0.5),
  //     // affiliateFeePercent: 0.1,
  //   }
  //   const output = await testnetThorchainAmm.doSwap(
  //     testnetWallet,
  //     estimateSwapParams,
  //     testnetWallet.clients['BNB'].getAddress(),
  //   )
  //   console.log(output)
  //   expect(output.hash).toBeTruthy()

  // })

  // // From Rune to ERC -- Passes
  // it(`Should perform a single swap from Rune to ERC`, async () => {
  //   const estimateSwapParams = {
  //     sourceAsset: AssetRuneNative,
  //     destinationAsset: USDT,
  //     inputAmount: assetToBase(assetAmount(50)),
  //     slipLimit: new BigNumber(0.5),
  //     // affiliateFeePercent: 0.1,
  //   }
  //   const output = await testnetThorchainAmm.doSwap(
  //     testnetWallet,
  //     estimateSwapParams,
  //     testnetWallet.clients['ETH'].getAddress(),
  //   )
  //   console.log(output)
  //   expect(output.hash).toBeTruthy()
  // })
  // From ERC to Rune
  it(`Should perform a single swap from ERC to Rune`, async () => {
    const estimateSwapParams = {
      sourceAsset: USDT,
      destinationAsset: AssetRuneNative,
      inputAmount: assetToBase(assetAmount(0.05)),
      slipLimit: new BigNumber(0.5),
      // affiliateFeePercent: 0.1,
    }
    const output = await testnetThorchainAmm.doSwap(
      testnetWallet,
      estimateSwapParams,
      testnetWallet.clients['THOR'].getAddress(),
    )
    console.log(output)
    expect(output.hash).toBeTruthy()
  })
  // From ERC to ERC
  // it(`Should perform a double swap from ERC to ERC`, async () => {
  //   const estimateSwapParams = {
  //     sourceAsset: USDT,
  //     destinationAsset: USDC,
  //     inputAmount: assetToBase(assetAmount(0.0001)),
  //     slipLimit: new BigNumber(0.5),
  //     // affiliateFeePercent: 0.1,
  //   }
  //   const output = await testnetThorchainAmm.doSwap(
  //     testnetWallet,
  //     estimateSwapParams,
  //     testnetWallet.clients['ETH'].getAddress(),
  //   )
  //   console.log(output)
  //   expect(output.hash).toBeTruthy()
  // })
})
