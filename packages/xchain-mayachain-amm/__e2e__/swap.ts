import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { Client as ArbClient, defaultArbParams } from '@xchainjs/xchain-arbitrum'
import { AssetBTC, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { AssetDASH, ClientKeystore, ClientLedger, DASHChain, defaultDashParams } from '@xchainjs/xchain-dash'
import { AssetETH, Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { AssetUSK, Client as KujiraClient, defaultKujiParams } from '@xchainjs/xchain-kujira'
import { AssetCacao, Client as MayaClient } from '@xchainjs/xchain-mayachain'
import { MayachainQuery, QuoteSwap } from '@xchainjs/xchain-mayachain-query'
import { AssetXRD, Client as RadixClient } from '@xchainjs/xchain-radix'
import { AssetRuneNative, Client as ThorClient, THORChain } from '@xchainjs/xchain-thorchain'
import {
  Asset,
  CryptoAmount,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { MayachainAMM } from '../src'
import { EtherscanProvider, Network as EthersNetwork } from 'ethers'

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
      liquidityFee: {
        asset: assetToString(quoteSwap.fees.liquidityFee.asset),
        amount: quoteSwap.fees.liquidityFee.baseAmount.amount().toString(),
        decimals: quoteSwap.fees.liquidityFee.baseAmount.decimal,
      },
      totalFee: {
        asset: assetToString(quoteSwap.fees.totalFee.asset),
        amount: quoteSwap.fees.totalFee.baseAmount.amount().toString(),
        decimals: quoteSwap.fees.totalFee.baseAmount.decimal,
      },
    },
    inboundConfirmationSeconds: quoteSwap.inboundConfirmationSeconds,
    inboundConfirmationBlocks: quoteSwap.inboundConfirmationBlocks,
    outboundDelaySeconds: quoteSwap.outboundDelaySeconds,
    outboundDelayBlocks: quoteSwap.outboundDelayBlocks,
    totalSwapSeconds: quoteSwap.totalSwapSeconds,
    slipBasisPoints: quoteSwap.slipBasisPoints,
    router: quoteSwap.router,
    expiry: quoteSwap.expiry,
    streamingSwapBlocks: quoteSwap.streamingSwapBlocks,
    streamingSwapSeconds: quoteSwap.streamingSwapSeconds,
    maxStreamingQuantity: quoteSwap.maxStreamingQuantity,
    recommendedMinAmountIn: quoteSwap.recommendedMinAmountIn
      ? {
          asset: assetToString(quoteSwap.recommendedMinAmountIn.asset),
          amount: quoteSwap.recommendedMinAmountIn.baseAmount.amount().toString(),
          decimals: quoteSwap.recommendedMinAmountIn.baseAmount.decimal,
        }
      : undefined,
    recommendedGasRate: quoteSwap.recommendedGasRate,
    gasRateUnits: quoteSwap.gasRateUnits,
    canSwap: quoteSwap.canSwap,
    errors: quoteSwap.errors,
    warning: quoteSwap.warning,
  })
}

const ETH_USDT: TokenAsset = assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7') as TokenAsset

const ETH_MAINNET_ETHERS_PROVIDER = new EtherscanProvider('homestead', process.env.ETHERSCAN_API_KEY)
const network = EthersNetwork.from('sepolia')
const ETH_TESTNET_ETHERS_PROVIDER = new EtherscanProvider(network, process.env.ETHERSCAN_API_KEY)

const ethersJSProviders = {
  [Network.Mainnet]: ETH_MAINNET_ETHERS_PROVIDER,
  [Network.Testnet]: ETH_TESTNET_ETHERS_PROVIDER,
  [Network.Stagenet]: ETH_MAINNET_ETHERS_PROVIDER,
}

describe('MayachainAmm e2e tests', () => {
  describe('Swap', () => {
    let mayachainAmm: MayachainAMM
    let wallet: Wallet

    beforeAll(() => {
      const mayaChainQuery = new MayachainQuery()
      const phrase = process.env.MAINNET_PHRASE
      wallet = new Wallet({
        BTC: new BtcClient({ ...defaultBtcParams, phrase, network: Network.Mainnet }),
        ETH: new EthClient({
          ...defaultEthParams,
          providers: ethersJSProviders,
          phrase,
          network: Network.Mainnet,
        }),
        DASH: new ClientKeystore({ ...defaultDashParams, phrase, network: Network.Mainnet }),
        KUJI: new KujiraClient({ ...defaultKujiParams, phrase, network: Network.Mainnet }),
        THOR: new ThorClient({ phrase, network: Network.Mainnet }),
        MAYA: new MayaClient({ phrase, network: Network.Mainnet }),
        ARB: new ArbClient({ ...defaultArbParams, phrase, network: Network.Mainnet }),
        XRD: new RadixClient({ phrase, network: Network.Mainnet }),
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
      const fromAsset = assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7') as TokenAsset
      const quoteSwap = await mayachainAmm.estimateSwap({
        fromAsset,
        destinationAsset: assetFromStringEx('ETH.ETH') as Asset,
        amount: new CryptoAmount(assetToBase(assetAmount(10, 6)), fromAsset),
      })

      printQuoteSwap(quoteSwap)
    })

    it(`Should estimate swap from USK to Rune`, async () => {
      const quoteSwap = await mayachainAmm.estimateSwap({
        fromAsset: AssetUSK,
        fromAddress: await wallet.getAddress('KUJI'),
        destinationAsset: AssetRuneNative,
        destinationAddress: await wallet.getAddress('THOR'),
        amount: new CryptoAmount(assetToBase(assetAmount(1, 6)), AssetUSK),
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

    it('Should do non protocol asset swap. USK -> Rune', async () => {
      const txSubmitted = await mayachainAmm.doSwap({
        fromAsset: AssetUSK,
        fromAddress: await wallet.getAddress('KUJI'),
        destinationAsset: AssetRuneNative,
        destinationAddress: await wallet.getAddress('THOR'),
        amount: new CryptoAmount(assetToBase(assetAmount(1, 6)), AssetUSK),
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

    it('Should approve Mayachain router to spend', async () => {
      const asset = assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7') as TokenAsset

      const txSubmitted = await mayachainAmm.approveRouterToSpend({
        asset,
        amount: new CryptoAmount(assetToBase(assetAmount(10, 6)), asset),
      })

      console.log(txSubmitted)
    })

    it('Should check if Mayachain router is allowed to spend', async () => {
      const asset = assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7') as TokenAsset

      const isApprovedToSpend = await mayachainAmm.isRouterApprovedToSpend({
        asset,
        amount: new CryptoAmount(assetToBase(assetAmount(10, 6)), asset),
        address: '0x6e08C7bBC09D68c6b9be0613ae32D4B5EAA63247',
      })

      console.log(!!isApprovedToSpend.length)
    })

    it('Should do ERC20 asset swap. USDT -> ETH', async () => {
      const fromAsset = assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7') as TokenAsset

      const txSubmitted = await mayachainAmm.doSwap({
        fromAddress: await wallet.getAddress(fromAsset.chain),
        destinationAddress: await wallet.getAddress(AssetETH.chain),
        fromAsset,
        destinationAsset: AssetETH,
        amount: new CryptoAmount(assetToBase(assetAmount(10, 6)), fromAsset),
      })

      console.log(txSubmitted)
    })

    it('Should do swap from Ledger client to Keystore client', async () => {
      const mayaChainQuery = new MayachainQuery()
      const phrase = process.env.MAINNET_PHRASE
      const wallet = new Wallet({
        DASH: new ClientLedger({
          ...defaultDashParams,
          network: Network.Mainnet,
          transport: await TransportNodeHid.create(),
        }),
        THOR: new ThorClient({ phrase, network: Network.Mainnet }),
      })
      const mayachainAmm = new MayachainAMM(mayaChainQuery, wallet)

      const txSubmitted = await mayachainAmm.doSwap({
        fromAddress: await wallet.getAddress(DASHChain),
        destinationAddress: await wallet.getAddress(THORChain),
        fromAsset: AssetDASH,
        destinationAsset: AssetRuneNative,
        amount: new CryptoAmount(assetToBase(assetAmount('1', 8)), AssetDASH),
      })

      console.log(txSubmitted)
    })

    it('Should estimate streaming swap', async () => {
      const quoteSwap = await mayachainAmm.estimateSwap({
        fromAsset: AssetETH,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(assetToBase(assetAmount(10, 18)), AssetETH),
        destinationAddress: await wallet.getAddress(AssetBTC.chain),
        streamingInterval: 1000,
        streamingQuantity: 14,
      })

      printQuoteSwap(quoteSwap)
    })

    it('Should estimate swap from Rune to Radix', async () => {
      const quoteSwap = await mayachainAmm.estimateSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetXRD,
        amount: new CryptoAmount(assetToBase(assetAmount(2, 8)), AssetRuneNative),
        destinationAddress: await wallet.getAddress(AssetXRD.chain),
      })

      printQuoteSwap(quoteSwap)
    })

    it('Should do swap from Rune to Radix', async () => {
      const txSubmitted = await mayachainAmm.doSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: AssetXRD,
        amount: new CryptoAmount(assetToBase(assetAmount(2, 8)), AssetRuneNative),
        destinationAddress: await wallet.getAddress(AssetXRD.chain),
      })

      console.log(txSubmitted)
    })

    it('Should estimate swap from Radix to Rune', async () => {
      const quoteSwap = await mayachainAmm.estimateSwap({
        fromAsset: AssetXRD,
        destinationAsset: AssetRuneNative,
        amount: new CryptoAmount(assetToBase(assetAmount(200, 18)), AssetXRD),
        destinationAddress: await wallet.getAddress(AssetRuneNative.chain),
      })

      printQuoteSwap(quoteSwap)
    })

    it('Should do swap from Radix to Rune', async () => {
      const txSubmitted = await mayachainAmm.doSwap({
        fromAsset: AssetXRD,
        destinationAsset: AssetRuneNative,
        amount: new CryptoAmount(assetToBase(assetAmount(200, 18)), AssetXRD),
        destinationAddress: await wallet.getAddress(AssetRuneNative.chain),
      })
      console.log(txSubmitted)
    })
  })
})
