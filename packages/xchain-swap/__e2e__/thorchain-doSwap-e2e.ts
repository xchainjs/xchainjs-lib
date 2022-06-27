import { Network } from '@xchainjs/xchain-client'
import {
  AssetBTC,
  AssetRuneNative,
  assetAmount,
  assetToBase,
  Asset,
  AssetETH
} from '@xchainjs/xchain-util'

import { ThorchainAMM } from '../src/ThorchainAMM'
import { Midgard } from '../src/utils/midgard'

const midgard = new Midgard(Network.Mainnet)
const thorchainAmm = new ThorchainAMM(midgard)


describe('xchain-swap Integration Tests', () => {

    it(`Should convert BTC to ETH `, async () => {
    const inputAsset: Asset = AssetBTC
    const outboundAsset: Asset = AssetETH
    const inputAmount = assetToBase(assetAmount(0.5))
    const outboundETHAmount = await thorchainAmm.convertAssetToAsset(inputAsset, inputAmount, outboundAsset)
    console.log(`${inputAmount.amount()} ${inputAsset.chain} to ${outboundAsset.chain} is: ${outboundETHAmount.amount().toFixed()} ${outboundAsset.chain}`)
    expect(outboundETHAmount.amount()).toBeTruthy()
    })

    it(`Should convert BTC to RUNE `, async () => {
      const inputAsset = AssetBTC
      const outboundAsset = AssetRuneNative
      const inputAmount = assetToBase(assetAmount(0.5))
      const outboundRuneAmount = await thorchainAmm.convertAssetToAsset(inputAsset, inputAmount, outboundAsset)
      expect(outboundRuneAmount.amount().toNumber() > 1000)
    })

    
})
