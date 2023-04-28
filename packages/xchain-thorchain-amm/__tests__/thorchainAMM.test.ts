import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import { CryptoAmount, ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Asset, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { ThorchainAMM } from '../src/thorchain-amm'

const thorchainQuery = new ThorchainQuery()
const thorchainAmm = new ThorchainAMM()
thorchainAmm

// function printTx(txDetails: TxDetails, input: CryptoAmount) {
//   const expanded = {
//     memo: txDetails.memo,
//     expiry: txDetails.expiry,
//     toAddress: txDetails.toAddress,
//     txEstimate: {
//       input: input.formatedAssetString(),
//       totalFees: {
//         swapFee: txDetails.txEstimate.totalFees.swapFee.formatedAssetString(),
//         outboundFee: txDetails.txEstimate.totalFees.outboundFee.formatedAssetString(),
//         affiliateFee: txDetails.txEstimate.totalFees.affiliateFee.formatedAssetString(),
//       },
//       slipBasisPoints: txDetails.txEstimate.slipBasisPoints.toFixed(),
//       netOutput: txDetails.txEstimate.netOutput.formatedAssetString(),
//       waitTimeSeconds: txDetails.txEstimate.waitTimeSeconds.toFixed(),
//       canSwap: txDetails.txEstimate.canSwap,
//       errors: txDetails.txEstimate.errors,
//     },
//   }
//   console.log(expanded)
// }
//const ethAddress = '0x690B9A9E9aa1C9dB991C7721a92d351Db4FaC990'

describe('ThorchainAmm Client Test', () => {
  beforeAll(() => {
    mockMidgardApi.init()
    mockThornodeApi.init()
  })
  afterAll(() => {
    mockThornodeApi.restore()
    mockThornodeApi.restore()
  })

  it(`Should convert BTC to ETH `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount('0.5')), AssetBTC)
    const outboundAsset: Asset = AssetETH
    const outboundETHAmount = await thorchainQuery.convert(input, outboundAsset)
    const EthAmount = new CryptoAmount(assetToBase(assetAmount('6.25601439')), AssetETH)
    expect(outboundETHAmount.assetAmount.amount().toFixed()).toEqual(EthAmount.assetAmount.amount().toFixed())
  })

  it(`Should convert BTC to RUNE `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(1)), AssetBTC)
    const outboundAsset: Asset = AssetRuneNative
    const outboundRuneAmount = await thorchainQuery.convert(input, outboundAsset)
    const expectedAmount = new CryptoAmount(assetToBase(assetAmount('10896.63786286')), AssetRuneNative)
    expect(outboundRuneAmount.assetAmount.amount()).toEqual(expectedAmount.assetAmount.amount())
  })

  it(`Should convert RUNE to BTC `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative)
    const outboundAsset: Asset = AssetBTC
    const outboundBTCAmount = await thorchainQuery.convert(input, outboundAsset)
    const expectedAmount = new CryptoAmount(assetToBase(assetAmount('917714')), AssetBTC)
    expect(outboundBTCAmount.baseAmount.amount()).toEqual(expectedAmount.assetAmount.amount())
  })

  // it('Should fail estimate swap because destination chain is halted ', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     fromAsset: AssetETH,
  //     fromAddress: ethAddress,
  //     amount: new CryptoAmount(assetToBase(assetAmount(2, 18)), AssetETH),
  //     destinationAsset: AssetLTC,
  //     destinationAddress: 'xxx',
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toEqual(false)
  // })

  // it('Should fail estimate swap because source chain is halted ', async () => {
  //   const swapParams: QuoteSwapParams = {
  //     fromAsset: AssetLTC,
  //     fromAddress: 'ltc1q6zvz3d5tnaqd6exg4vljvtn8lcg4qfqsu4cc4h',
  //     amount: new CryptoAmount(assetToBase(assetAmount(2)), AssetLTC),
  //     destinationAsset: AssetETH,
  //     destinationAddress: ethAddress,
  //   }
  //   const estimate = await thorchainQuery.quoteSwap(swapParams)
  //   printTx(estimate, swapParams.amount)
  //   expect(estimate.txEstimate.canSwap).toEqual(false)
  // })
})
