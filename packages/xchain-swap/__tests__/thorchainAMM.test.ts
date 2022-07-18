import { Network } from '@xchainjs/xchain-client'
import {
  Asset,
  AssetBNB,
  AssetBTC,
  AssetETH,
  AssetRuneNative,
  assetAmount,
  assetToBase,
  baseAmount,
} from '@xchainjs/xchain-util'

import { ThorchainAMM } from '../src/ThorchainAMM'
import { CryptoAmount } from '../src/crypto-amount'
import { Midgard } from '../src/utils/midgard'

// eslint-disable-next-line ordered-imports/ordered-imports
import mockMidgardApi from '../__mocks__/midgard-api'

const midgardts = new Midgard(Network.Mainnet)
const thorchainAmm = new ThorchainAMM(midgardts)

describe('ThorchainAmm Client Test', () => {
  beforeAll(() => {
    mockMidgardApi.init()
  })

  // ThorchainAMM unit tests with mock data
  it(`Should get the correct outbound Delay`, async () => {
    const outboundAmount = new CryptoAmount(assetToBase(assetAmount(1)), AssetBNB)

    const outBoundValue = await thorchainAmm.outboundDelay(outboundAmount)
    const expectedOutput = 1500
    expect(outBoundValue).toEqual(expectedOutput)
  })

  it(`Should convert BTC to ETH `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(0.5)), AssetBTC)
    const outboundAsset: Asset = AssetETH
    const outboundETHAmount = await thorchainAmm.convert(input, outboundAsset)
    const EthAmount = assetToBase(assetAmount(9.1362964))
    expect(outboundETHAmount.baseAmount.amount()).toEqual(EthAmount.amount())
  })

  it(`Should convert BTC to RUNE `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(0.5)), AssetBTC)
    const outboundAsset: Asset = AssetRuneNative
    const outboundRuneAmount = await thorchainAmm.convert(input, outboundAsset)
    const expectedAmount = assetToBase(assetAmount(4760.13797319))
    expect(outboundRuneAmount.baseAmount.amount()).toEqual(expectedAmount.amount())
  })

  it(`Should convert RUNE to BTC `, async () => {
    const input = new CryptoAmount(assetToBase(assetAmount(100)), AssetRuneNative)
    const outboundAsset: Asset = AssetBTC
    const outboundBTCAmount = await thorchainAmm.convert(input, outboundAsset)
    const expectedAmount = baseAmount('1050400')
    expect(outboundBTCAmount.baseAmount.amount()).toEqual(expectedAmount.amount())
  })
})
