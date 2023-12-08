import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { AssetETH } from '@xchainjs/xchain-ethereum'
import { AssetCacao } from '@xchainjs/xchain-mayachain'
import { MayachainQuery, QuoteSwap } from '@xchainjs/xchain-mayachain-query'
import { AssetRuneNative } from '@xchainjs/xchain-thorchain'
import {
  Asset,
  CryptoAmount,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { MayachainAMM, Wallet } from '../src'

function printQuoteSwap(quoteSwap: QuoteSwap) {
  console.log({
    toAddress: quoteSwap.toAddress,
    memo: quoteSwap.memo,
    expectedAmount: {
      asset: assetToString(quoteSwap.expectedAmount.asset),
      amount: quoteSwap.expectedAmount.baseAmount.amount().toString(),
      decimals: quoteSwap.expectedAmount.baseAmount.decimal,
    },
    dustThreshold: {
      asset: assetToString(quoteSwap.dustThreshold.asset),
      amount: quoteSwap.dustThreshold.baseAmount.amount().toString(),
      decimals: quoteSwap.dustThreshold.baseAmount.decimal,
    },
    totalFees: {
      asset: assetToString(quoteSwap.fees.asset),
      affiliateFee: {
        asset: assetToString(quoteSwap.fees.affiliateFee.asset),
        amount: quoteSwap.fees.affiliateFee.baseAmount.amount().toString(),
        decimals: quoteSwap.fees.affiliateFee.baseAmount.decimal,
      },
      outboundFee: {
        asset: assetToString(quoteSwap.fees.outboundFee.asset),
        amount: quoteSwap.fees.outboundFee.baseAmount.amount().toString(),
        decimals: quoteSwap.fees.outboundFee.baseAmount.decimal,
      },
    },
    inboundConfirmationSeconds: quoteSwap.inboundConfirmationSeconds,
    inboundConfirmationBlocks: quoteSwap.inboundConfirmationBlocks,
    outboundDelaySeconds: quoteSwap.outboundDelaySeconds,
    outboundDelayBlocks: quoteSwap.outboundDelayBlocks,
    totalSwapSeconds: quoteSwap.totalSwapSeconds,
    slipBasisPoints: quoteSwap.slipBasisPoints,
    canSwap: quoteSwap.canSwap,
    errors: quoteSwap.errors,
    warning: quoteSwap.warning,
  })
}

const ETH_USDT: Asset = assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7')

const ETH_MAINNET_ETHERS_PROVIDER = new ethers.providers.EtherscanProvider('homestead', process.env.ETHERSCAN_API_KEY)
const network = ethers.providers.getNetwork('sepolia')
const ETH_TESTNET_ETHERS_PROVIDER = new ethers.providers.EtherscanProvider(network, process.env.ETHERSCAN_API_KEY)

const ethersJSProviders = {
  [Network.Mainnet]: ETH_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: ETH_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: ETH_MAINNET_ETHERS_PROVIDER,
}

describe('MayachainAmm e2e tests', () => {
  let mayachainAmm: MayachainAMM
  let wallet: Wallet

  beforeAll(() => {
    const mayaChainQuery = new MayachainQuery()
    wallet = new Wallet(process.env.MAINNET_PHRASE || '', Network.Mainnet, {
      ETH: {
        providers: ethersJSProviders,
      },
    })
    mayachainAmm = new MayachainAMM(mayaChainQuery, wallet)
  })

  it(`Should validate swap from Rune to BTC without errors`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
    })

    console.log(errors)
  })

  it(`Should validate swap from Rune to BTC with MAYAName error`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'randomAffiliateAddress',
    })

    console.log(errors)
  })

  it(`Should validate swap from Rune to BTC with affiliateBps error`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateBps: -1,
    })

    console.log(errors)
  })

  it(`Should validate swap from Rune to BTC with destination address error`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      destinationAddress: 'randomDestinationAddress',
    })

    console.log(errors)
  })

  it(`Should estimate swap from Rune to BTC`, async () => {
    const quoteSwap = await mayachainAmm.estimateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
    })

    printQuoteSwap(quoteSwap)
  })

  it(`Should estimate swap from USDT to ETH`, async () => {
    const fromAsset = assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7')
    const quoteSwap = await mayachainAmm.estimateSwap({
      fromAsset,
      destinationAsset: assetFromStringEx('ETH.ETH'),
      amount: new CryptoAmount(assetToBase(assetAmount(10, 6)), fromAsset),
    })

    printQuoteSwap(quoteSwap)
  })

  it('Should validate swap from ERC20 to BTC without errors', async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: ETH_USDT,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), ETH_USDT),
      fromAddress: '0x7f7b5ae886b3c194125277d1875998ff7fb8ba04',
      affiliateAddress: 'eld',
      destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
    })
    console.log(errors)
  })

  it(`Should quote swap from Rune to BTC without errors`, async () => {
    const quoteSwap = await mayachainAmm.estimateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
      affiliateBps: 300,
      destinationAddress: 'bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj',
    })

    printQuoteSwap(quoteSwap)
  })

  it('Should do non protocol asset swap. Rune -> Cacao', async () => {
    const txSubmitted = await mayachainAmm.doSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetCacao,
      amount: new CryptoAmount(assetToBase(assetAmount(0.5)), AssetRuneNative),
      destinationAddress: await wallet.getAddress(AssetCacao.chain),
    })

    console.log(txSubmitted)
  })

  it('Should do protocol asset swap. Cacao -> Rune', async () => {
    const txSubmitted = await mayachainAmm.doSwap({
      fromAsset: AssetCacao,
      destinationAsset: AssetRuneNative,
      amount: new CryptoAmount(assetToBase(assetAmount(1.5, 10)), AssetCacao),
      destinationAddress: await wallet.getAddress(AssetRuneNative.chain),
    })

    console.log(txSubmitted)
  })

  it('Should do ERC20 asset swap. USDT -> ETH', async () => {
    const fromAsset = assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7')

    const txSubmitted = await mayachainAmm.doSwap({
      fromAddress: await wallet.getAddress(fromAsset.chain),
      destinationAddress: await wallet.getAddress(AssetETH.chain),
      fromAsset,
      destinationAsset: AssetETH,
      amount: new CryptoAmount(assetToBase(assetAmount(10, 6)), fromAsset),
    })

    console.log(txSubmitted)
  })
})
