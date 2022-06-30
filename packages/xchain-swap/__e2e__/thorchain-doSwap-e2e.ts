import { Network } from '@xchainjs/xchain-client'
import { AssetBNB, AssetBTC, AssetETH, AssetRuneNative, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import BigNumber from 'bignumber.js'

import { ThorchainAMM } from '../src/ThorchainAMM'
import { Wallet } from '../src/Wallet'
import { Midgard } from '../src/utils/midgard'

//const mainnetMidgard = new Midgard(Network.Mainnet)
const testnetMidgard = new Midgard(Network.Testnet)
//const mainetThorchainAmm = new ThorchainAMM(mainnetMidgard)
const testnetThorchainAmm = new ThorchainAMM(testnetMidgard)
const testnetWallet = new Wallet(Network.Testnet, process.env.PHRASE || 'you forgot to set the phrase')

describe('xchain-swap Integration Tests', () => {
  it(`Should swap BTC to RUNE, with no affiliate address  `, async () => {
    const estimateSwapParams = {
      sourceAsset: AssetBTC,
      destinationAsset: AssetRuneNative,
      inputAmount: assetToBase(assetAmount(0.0001)),
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

  it(`Should fail to swap BTC to RUNE, if dest address is not for the correct chain  `, async () => {
    const estimateSwapParams = {
      sourceAsset: AssetBTC,
      destinationAsset: AssetRuneNative,
      inputAmount: assetToBase(assetAmount(0.0001)),
      // affiliateFeePercent: 0.1,
    }
    try {
      await testnetThorchainAmm.doSwap(
        testnetWallet,
        estimateSwapParams,
        testnetWallet.clients['BNB'].getAddress(), // put the wrong chain address here to trigger error
      )
      fail()
    } catch (error: any) {
      expect(error.message).toEqual(`tbnb1kmu0n6s44cz5jxdvkvsvrzgr57ndg6atw5zrys is not a valid address`)
    }
  })
  it(`Should swap from RUNE to BNB`, async () => {
    const estimateSwapParams = {
      sourceAsset: AssetRuneNative,
      destinationAsset: AssetETH,
      inputAmount: assetToBase(assetAmount(100)),
      slipLimit: new BigNumber(0.5),
      // affiliateFeePercent: 0.1,
    }
    const output = await testnetThorchainAmm.doSwap(
      testnetWallet,
      estimateSwapParams,
      testnetWallet.clients['ETH'].getAddress(),
    )
    console.log(output)
    expect(output.hash).toBeTruthy()
  })

  it(`Should perform a double swap from BNB to ETH`, async () => {
    const estimateSwapParams = {
      sourceAsset: AssetBNB,
      destinationAsset: AssetETH,
      inputAmount: assetToBase(assetAmount(0.0001)),
      slipLimit: new BigNumber(0.5),
      // affiliateFeePercent: 0.1,
    }
    const output = await testnetThorchainAmm.doSwap(
      testnetWallet,
      estimateSwapParams,
      testnetWallet.clients['ETH'].getAddress(),
    )
    console.log(output)
    expect(output.hash).toBeTruthy()
  })

  // From synth to asset
  it(`Should perform a swap from syntheticBTC to BTC`, async () => {
    const 
  })

  // from asset to synth
  // from synth to synth


})
