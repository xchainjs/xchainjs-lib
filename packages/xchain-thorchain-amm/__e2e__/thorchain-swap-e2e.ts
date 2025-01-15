import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import {
  AVAXChain,
  AssetAVAX,
  ClientKeystore as AvaxClientKeystore,
  ClientLedger as AvaxClientLedger,
  defaultAvaxParams,
} from '@xchainjs/xchain-avax'
import { AssetBETH, Client as BaseClient, defaultBaseParams } from '@xchainjs/xchain-base'
import { AssetBNB, BNBChain, Client as BnbClient } from '@xchainjs/xchain-binance'
import {
  AssetBTC,
  BTCChain,
  BTC_DECIMAL,
  Client as BtcClient,
  defaultBTCParams as defaultBtcParams,
} from '@xchainjs/xchain-bitcoin'
import { Client as BchClient, defaultBchParams } from '@xchainjs/xchain-bitcoincash'
import { Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import { Network } from '@xchainjs/xchain-client'
import { AssetATOM, Client as GaiaClient, GAIAChain } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient, defaultDogeParams } from '@xchainjs/xchain-doge'
import { AssetETH, Client as EthClient, ETHChain, defaultEthParams } from '@xchainjs/xchain-ethereum'
import {
  AssetLTC,
  Client as LtcKeystoreClient,
  ClientLedger as LtcClientLedger,
  LTCChain,
  defaultLtcParams,
} from '@xchainjs/xchain-litecoin'
import {
  AssetRuneNative,
  ClientKeystore as THORKeystoreClient,
  ClientLedger as THORLedgerClient,
  THORChain,
  defaultClientConfig as defaultThorParams,
} from '@xchainjs/xchain-thorchain'
import { ThorchainQuery, TxDetails } from '@xchainjs/xchain-thorchain-query'
import {
  CryptoAmount,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { ThorchainAMM } from '../src/thorchain-amm'

function printQuoteSwap(txDetails: TxDetails) {
  console.log({
    toAddress: txDetails.toAddress,
    memo: txDetails.memo,
    expectedAmount: {
      asset: assetToString(txDetails.txEstimate.netOutput.asset),
      amount: txDetails.txEstimate.netOutput.baseAmount.amount().toString(),
      decimals: txDetails.txEstimate.netOutput.baseAmount.decimal,
    },
    dustThreshold: {
      asset: assetToString(txDetails.dustThreshold.asset),
      amount: txDetails.dustThreshold.baseAmount.amount().toString(),
      decimals: txDetails.dustThreshold.baseAmount.decimal,
    },
    totalFees: {
      asset: assetToString(txDetails.txEstimate.totalFees.asset),
      affiliateFee: {
        asset: assetToString(txDetails.txEstimate.totalFees.affiliateFee.asset),
        amount: txDetails.txEstimate.totalFees.affiliateFee.baseAmount.amount().toString(),
        decimals: txDetails.txEstimate.totalFees.affiliateFee.baseAmount.decimal,
      },
      outboundFee: {
        asset: assetToString(txDetails.txEstimate.totalFees.outboundFee.asset),
        amount: txDetails.txEstimate.totalFees.outboundFee.baseAmount.amount().toString(),
        decimals: txDetails.txEstimate.totalFees.outboundFee.baseAmount.decimal,
      },
    },
    inboundConfirmationSeconds: txDetails.txEstimate.inboundConfirmationSeconds,
    // inboundConfirmationBlocks: txDetails.txEstimate.inboundConfirmationBlocks,
    outboundDelaySeconds: txDetails.txEstimate.outboundDelaySeconds,
    outboundDelayBlocks: txDetails.txEstimate.outboundDelayBlocks,
    recommendedMinAmountIn: txDetails.txEstimate.recommendedMinAmountIn,
    slipBasisPoints: txDetails.txEstimate.slipBasisPoints,
    streamingSlipBasisPoints: txDetails.txEstimate.streamingSlipBasisPoints,
    streamingSwapBlocks: txDetails.txEstimate.streamingSwapBlocks,
    streamingSwapSeconds: txDetails.txEstimate.streamingSwapSeconds,
    totalSwapSeconds: txDetails.txEstimate.totalSwapSeconds,
    canSwap: txDetails.txEstimate.canSwap,
    errors: txDetails.txEstimate.errors,
    warning: txDetails.txEstimate.warning,
  })
}

describe('ThorchainAmm e2e tests', () => {
  describe('Swap', () => {
    let wallet: Wallet
    let thorchainAmm: ThorchainAMM
    beforeAll(() => {
      const phrase = process.env.PHRASE_MAINNET
      wallet = new Wallet({
        BTC: new BtcClient({ ...defaultBtcParams, phrase, network: Network.Mainnet }),
        BCH: new BchClient({ ...defaultBchParams, phrase, network: Network.Mainnet }),
        LTC: new LtcKeystoreClient({ ...defaultLtcParams, phrase, network: Network.Mainnet }),
        DOGE: new DogeClient({ ...defaultDogeParams, phrase, network: Network.Mainnet }),
        ETH: new EthClient({ ...defaultEthParams, phrase, network: Network.Mainnet }),
        AVAX: new AvaxClientKeystore({ ...defaultAvaxParams, phrase, network: Network.Mainnet }),
        BSC: new BscClient({ ...defaultBscParams, phrase, network: Network.Mainnet }),
        GAIA: new GaiaClient({ phrase, network: Network.Mainnet }),
        BNB: new BnbClient({ phrase, network: Network.Mainnet }),
        THOR: new THORKeystoreClient({ ...defaultThorParams, phrase, network: Network.Mainnet }),
        BASE: new BaseClient({ ...defaultBaseParams, phrase, network: Network.Mainnet }),
      })
      thorchainAmm = new ThorchainAMM(new ThorchainQuery(), wallet)
    })

    it(`Should validate swap from BTC to ETH without errors`, async () => {
      const errors = await thorchainAmm.validateSwap({
        fromAsset: AssetBTC,
        destinationAsset: AssetETH,
        amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetBTC),
      })

      console.log(errors)
    })

    it(`Should validate swap from BTC to ETH with THORName error`, async () => {
      const errors = await thorchainAmm.validateSwap({
        fromAsset: AssetBTC,
        destinationAsset: AssetETH,
        amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetBTC),
        affiliateAddress: 'randomAffiliateAddress',
      })

      console.log(errors)
    })

    it(`Should validate swap from BTC to ETH with affiliateBps error`, async () => {
      const errors = await thorchainAmm.validateSwap({
        fromAsset: AssetBTC,
        destinationAsset: AssetETH,
        amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetBTC),
        affiliateBps: -1,
      })

      console.log(errors)
    })

    it(`Should validate swap from BTC to ETH with destination address error`, async () => {
      const errors = await thorchainAmm.validateSwap({
        fromAsset: AssetBTC,
        destinationAsset: AssetETH,
        amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetBTC),
        destinationAddress: 'randomDestinationAddress',
      })

      console.log(errors)
    })

    it(`Should validate swap from ATOM to synth ATOM without errors`, async () => {
      const errors = await thorchainAmm.validateSwap({
        fromAsset: AssetATOM,
        amount: new CryptoAmount(assetToBase(assetAmount('10')), AssetATOM),
        destinationAddress: await wallet.getAddress(THORChain),
        destinationAsset: assetFromStringEx('GAIA/ATOM'),
      })

      console.log(errors)
    })

    it(`Should validate swap from synth BNB to BNB without errors`, async () => {
      const errors = await thorchainAmm.validateSwap({
        fromAsset: assetFromStringEx('BNB/BNB'),
        amount: new CryptoAmount(assetToBase(assetAmount('1')), assetFromStringEx('BNB/BNB')),
        destinationAddress: await wallet.getAddress(BNBChain),
        destinationAsset: assetFromStringEx('BNB.BNB'),
      })

      console.log(errors)
    })

    it(`Should validate swap from ATOM to synth ATOM with destination address error`, async () => {
      const errors = await thorchainAmm.validateSwap({
        fromAsset: AssetATOM,
        amount: new CryptoAmount(assetToBase(assetAmount('10')), AssetATOM),
        destinationAddress: await wallet.getAddress(GAIAChain),
        destinationAsset: assetFromStringEx('GAIA/ATOM'),
      })

      console.log(errors)
    })

    it(`Should validate swap from AVAX.USDC to synth ATOM`, async () => {
      const asset = assetFromStringEx('AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E')

      const errors = await thorchainAmm.validateSwap({
        fromAsset: asset,
        fromAddress: await wallet.getAddress(asset.chain),
        amount: new CryptoAmount(assetToBase(assetAmount('10')), asset),
        destinationAddress: await wallet.getAddress(AssetATOM.chain),
        destinationAsset: AssetATOM,
      })

      console.log(errors)
    })

    it(`Should estimate swap from BTC to BETH`, async () => {
      const quoteSwap = await thorchainAmm.estimateSwap({
        fromAsset: AssetBTC,
        destinationAsset: AssetBETH,
        amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetBTC),
      })

      printQuoteSwap(quoteSwap)
    })

    it(`Should estimate streaming swap from BTC to ETH`, async () => {
      const quoteSwap = await thorchainAmm.estimateSwap({
        fromAsset: AssetBTC,
        destinationAsset: AssetETH,
        amount: new CryptoAmount(assetToBase(assetAmount(10, BTC_DECIMAL)), AssetBTC),
        streamingInterval: 10,
        streamingQuantity: 5,
        fromAddress: await wallet.getAddress(BTCChain),
        destinationAddress: await wallet.getAddress(ETHChain),
      })

      printQuoteSwap(quoteSwap)
    })

    it(`Should estimate swap from ETH.USDT to ETH`, async () => {
      const fromAsset = assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7')
      const quoteSwap = await thorchainAmm.estimateSwap({
        fromAsset,
        destinationAsset: assetFromStringEx('ETH.ETH'),
        amount: new CryptoAmount(assetToBase(assetAmount(100, 6)), fromAsset),
      })

      printQuoteSwap(quoteSwap)
    })

    it(`Should estimate swap from AVAX.USDC to ETH.USDT`, async () => {
      const fromAsset = assetFromStringEx('AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E')
      const quoteSwap = await thorchainAmm.estimateSwap({
        fromAsset,
        destinationAsset: assetFromStringEx('ETH.USDT-0XDAC17F958D2EE523A2206206994597C13D831EC7'),
        amount: new CryptoAmount(assetToBase(assetAmount(10000, 6)), fromAsset),
      })

      printQuoteSwap(quoteSwap)
    })

    it(`Should estimate swap from synth BNB to BNB without errors`, async () => {
      const estimatedSwap = await thorchainAmm.estimateSwap({
        fromAsset: assetFromStringEx('BNB/BNB'),
        amount: new CryptoAmount(assetToBase(assetAmount('1')), assetFromStringEx('BNB/BNB')),
        destinationAddress: await wallet.getAddress(BNBChain),
        destinationAsset: assetFromStringEx('BNB.BNB'),
      })

      printQuoteSwap(estimatedSwap)
    })

    it('Should do non protocol asset swap. ATOM -> BNB', async () => {
      const txSubmitted = await thorchainAmm.doSwap({
        fromAsset: AssetATOM,
        destinationAsset: AssetBNB,
        amount: new CryptoAmount(assetToBase(assetAmount(0.55, 6)), AssetATOM),
        destinationAddress: await wallet.getAddress(AssetBNB.chain),
      })

      console.log(txSubmitted)
    })

    it('Should do protocol asset swap. RUNE -> AVAX.USDC', async () => {
      const txSubmitted = await thorchainAmm.doSwap({
        fromAsset: AssetRuneNative,
        destinationAsset: assetFromStringEx('AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E'),
        amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetRuneNative),
        destinationAddress: await wallet.getAddress(AssetAVAX.chain),
      })

      console.log(txSubmitted)
    })

    it(`Should do swap from synth BNB to BNB without errors`, async () => {
      const txSubmitted = await thorchainAmm.doSwap({
        fromAsset: assetFromStringEx('BNB/BNB'),
        amount: new CryptoAmount(assetToBase(assetAmount('1')), assetFromStringEx('BNB/BNB')),
        destinationAddress: await wallet.getAddress(BNBChain),
        destinationAsset: assetFromStringEx('BNB.BNB'),
      })

      console.log(txSubmitted)
    })

    it('Should check if Thorchain router is allowed to spend', async () => {
      const asset = assetFromStringEx('AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E') as TokenAsset

      const isApprovedToSpend = await thorchainAmm.isRouterApprovedToSpend({
        asset,
        amount: new CryptoAmount(assetToBase(assetAmount(10, 6)), asset),
        address: '0x3fb42E9C800E7A40F1101E39195E78F0c4C25886',
      })

      console.log(!isApprovedToSpend.length)
    })

    it('Should do non protocol ERC20 asset swap. AVAX.USDC -> AVAX', async () => {
      const fromAsset = assetFromStringEx('AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E') as TokenAsset

      const txSubmitted = await thorchainAmm.doSwap({
        fromAddress: await wallet.getAddress(fromAsset.chain),
        destinationAddress: await wallet.getAddress(AssetAVAX.chain),
        fromAsset,
        destinationAsset: AssetAVAX,
        amount: new CryptoAmount(assetToBase(assetAmount(4.38, 6)), fromAsset),
      })

      console.log(txSubmitted)
    })

    it(`Should perform a swap from ATOM to synth ATOM`, async () => {
      const txSubmitted = await thorchainAmm.doSwap({
        fromAsset: AssetATOM,
        amount: new CryptoAmount(assetToBase(assetAmount('10')), AssetATOM),
        destinationAddress: await wallet.getAddress(THORChain),
        destinationAsset: assetFromStringEx('GAIA/ATOM'),
      })

      console.log(txSubmitted)
    })

    it(`Should approve Thorchain router to spend`, async () => {
      const asset = assetFromStringEx('AVAX.USDC-0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e') as TokenAsset
      const txSubmitted = await thorchainAmm.approveRouterToSpend({
        asset,
        amount: new CryptoAmount(assetToBase(assetAmount('10', 6)), asset),
      })

      console.log(txSubmitted)
    })

    it('Should do swap from Keystore client to Ledger client', async () => {
      const thorchainQuery = new ThorchainQuery()
      const phrase = process.env.MAINNET_PHRASE
      const wallet = new Wallet({
        LTC: new LtcClientLedger({
          ...defaultLtcParams,
          network: Network.Mainnet,
          transport: await TransportNodeHid.create(),
        }),
        THOR: new THORKeystoreClient({ phrase, network: Network.Mainnet }),
      })
      const thorchainAmm = new ThorchainAMM(thorchainQuery, wallet)

      const txSubmitted = await thorchainAmm.doSwap({
        fromAddress: await wallet.getAddress(THORChain),
        destinationAddress: await wallet.getAddress(LTCChain),
        fromAsset: AssetRuneNative,
        destinationAsset: AssetLTC,
        amount: new CryptoAmount(assetToBase(assetAmount('1', 8)), AssetRuneNative),
      })

      console.log(txSubmitted)
    })

    it('Should do swap from UTXO Ledger client to Keystore client', async () => {
      const thorchainQuery = new ThorchainQuery()
      const phrase = process.env.MAINNET_PHRASE
      const wallet = new Wallet({
        LTC: new LtcClientLedger({
          ...defaultLtcParams,
          network: Network.Mainnet,
          transport: await TransportNodeHid.create(),
        }),
        THOR: new THORKeystoreClient({ phrase, network: Network.Mainnet }),
      })
      const thorchainAmm = new ThorchainAMM(thorchainQuery, wallet)

      const txSubmitted = await thorchainAmm.doSwap({
        fromAddress: await wallet.getAddress(LTCChain),
        destinationAddress: await wallet.getAddress(THORChain),
        fromAsset: AssetLTC,
        destinationAsset: AssetRuneNative,
        amount: new CryptoAmount(assetToBase(assetAmount('1', 8)), AssetLTC),
      })

      console.log(txSubmitted)
    })

    it('Should do swap from EVM Ledger client to Keystore client', async () => {
      const thorchainQuery = new ThorchainQuery()
      const wallet = new Wallet({
        AVAX: new AvaxClientLedger({
          ...defaultAvaxParams,
          network: Network.Mainnet,
          transport: await TransportNodeHid.create(),
        }),
      })
      const thorchainAmm = new ThorchainAMM(thorchainQuery, wallet)

      const USDCAsset = assetFromStringEx('AVAX.USDC-0XB97EF9EF8734C71904D8002F8B6BC66DD9C48A6E')
      const txSubmitted = await thorchainAmm.doSwap({
        fromAddress: await wallet.getAddress(AVAXChain),
        destinationAddress: await wallet.getAddress(AVAXChain),
        fromAsset: USDCAsset,
        destinationAsset: AssetAVAX,
        amount: new CryptoAmount(assetToBase(assetAmount('10', 6)), USDCAsset),
      })

      console.log(txSubmitted)
    })

    it('Should do swap from THOR Ledger', async () => {
      const thorchainQuery = new ThorchainQuery()
      const wallet = new Wallet({
        THOR: new THORLedgerClient({ transport: await TransportNodeHid.create(), network: Network.Mainnet }),
      })

      const sAVAX = assetFromStringEx('AVAX/AVAX')
      const thorchainAmm = new ThorchainAMM(thorchainQuery, wallet)

      const txSubmitted = await thorchainAmm.doSwap({
        fromAddress: await wallet.getAddress(THORChain),
        destinationAddress: await wallet.getAddress(THORChain),
        fromAsset: sAVAX,
        destinationAsset: AssetRuneNative,
        amount: new CryptoAmount(assetToBase(assetAmount('1', 8)), sAVAX),
      })

      console.log(txSubmitted)
    })
  })
})
