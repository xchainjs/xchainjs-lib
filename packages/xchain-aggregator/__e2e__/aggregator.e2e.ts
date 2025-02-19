import { AssetAVAX, Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { AssetBETH, BASEChain, Client as BaseClient, defaultBaseParams } from '@xchainjs/xchain-base'
import { AssetBNB, Client as BnbClient } from '@xchainjs/xchain-binance'
import {
  AssetBTC,
  BTCChain,
  BTC_DECIMAL,
  Client as BtcClient,
  defaultBTCParams as defaultBtcParams,
} from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { AssetETH, Client as EthClient, ETHChain, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { AssetKUJI } from '@xchainjs/xchain-kujira'
import { Client as ThorClient, THORChain } from '@xchainjs/xchain-thorchain'
import {
  Asset,
  AssetType,
  CryptoAmount,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { Aggregator, QuoteSwap } from '../src'

function printQuoteSwap(quoteSwap: QuoteSwap) {
  console.log({
    protocol: quoteSwap.protocol,
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
    totalSwapSeconds: quoteSwap.totalSwapSeconds,
    slipBasisPoints: quoteSwap.slipBasisPoints,
    canSwap: quoteSwap.canSwap,
    errors: quoteSwap.errors,
    warning: quoteSwap.warning,
  })
}

function bestSwap(allQuotes: QuoteSwap[]) {
  const bestQuote = allQuotes.reduce((best, current) =>
    current.expectedAmount.gt(best.expectedAmount) ? current : best,
  )
  return bestQuote
}
const SOLAsset: Asset = {
  chain: 'SOL',
  ticker: 'SOL',
  symbol: 'SOL',
  type: AssetType.NATIVE,
}

const AssetUSDT: TokenAsset = {
  chain: ETHChain,
  symbol: 'USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
  ticker: 'USDT',
  type: AssetType.TOKEN,
}

jest.deepUnmock('@chainflip/sdk/swap')

describe('Aggregator', () => {
  let aggregator: Aggregator
  let wallet: Wallet

  beforeAll(() => {
    const phrase = process.env.PHRASE_MAINNET
    wallet = new Wallet({
      BTC: new BtcClient({ ...defaultBtcParams, phrase, network: Network.Mainnet }),
      ETH: new EthClient({
        ...defaultEthParams,
        phrase,
        network: Network.Mainnet,
      }),
      AVAX: new AvaxClient({ ...defaultAvaxParams, phrase, network: Network.Mainnet }),
      BASE: new BaseClient({ ...defaultBaseParams, phrase, network: Network.Mainnet }),
      BNB: new BnbClient({ phrase, network: Network.Mainnet }),
      THOR: new ThorClient({ phrase, network: Network.Mainnet }),
    })
    aggregator = new Aggregator({ wallet })
  })

  it('Should get configuration', () => {
    console.log(aggregator.getConfiguration())
  })

  it('Should find swap with greatest expected amount', async () => {
    const estimatedSwap = await aggregator.estimateSwap({
      fromAsset: AssetBTC,
      destinationAsset: SOLAsset,
      fromAddress: await wallet.getAddress(BTCChain),
      destinationAddress: 'FakeSolAddress',
      amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetBTC),
    })
    printQuoteSwap(bestSwap(estimatedSwap))
  })
  it('Should find swap on CF with usdt', async () => {
    const estimatedSwap = await aggregator.estimateSwap({
      fromAsset: AssetUSDT,
      destinationAsset: SOLAsset,
      fromAddress: await wallet.getAddress(ETHChain),
      destinationAddress: 'fakeSOlAddress',
      amount: new CryptoAmount(assetToBase(assetAmount(20, 6)), AssetUSDT),
    })
    printQuoteSwap(bestSwap(estimatedSwap))

    const hash = await aggregator.doSwap({
      protocol: estimatedSwap[0].protocol,
      fromAsset: AssetUSDT,
      fromAddress: await wallet.getAddress(ETHChain),
      destinationAsset: SOLAsset,
      amount: new CryptoAmount(assetToBase(assetAmount(20, 6)), AssetUSDT),
      destinationAddress: 'fakeSOlAddress',
    })
    console.log(hash)
  })
  it('Should find swap with greatest expected amount for base', async () => {
    const estimatedSwap = await aggregator.estimateSwap({
      fromAsset: AssetBTC,
      destinationAsset: AssetBETH,
      fromAddress: await wallet.getAddress(BTCChain),
      streamingInterval: 1,
      streamingQuantity: 0,
      destinationAddress: await wallet.getAddress(BASEChain),
      amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetBTC),
    })
    printQuoteSwap(bestSwap(estimatedSwap))
  })

  it('Should find estimated swap with one protocol not supporting one asset', async () => {
    const estimatedSwap = await aggregator.estimateSwap({
      fromAsset: AssetBTC,
      destinationAsset: AssetKUJI,
      amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetBTC),
    })
    printQuoteSwap(bestSwap(estimatedSwap))
  })

  it('Should find estimated swap with trade assets', async () => {
    const estimatedSwap = await aggregator.estimateSwap({
      fromAsset: assetFromStringEx('BTC~BTC'),
      destinationAsset: assetFromStringEx('ETH~ETH'),
      amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), assetFromStringEx('BTC~BTC')),
      destinationAddress: await wallet.getAddress(THORChain),
    })
    printQuoteSwap(bestSwap(estimatedSwap))
  })

  it('Should not estimate swap', async () => {
    try {
      await aggregator.estimateSwap({
        fromAsset: AssetAVAX,
        destinationAsset: AssetKUJI,
        amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetAVAX),
      })
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message)
      }
    }
  })

  it('Should do swap using chosen protocol', async () => {
    const txEstimatedSwap = await aggregator.estimateSwap({
      fromAsset: AssetBNB,
      destinationAsset: AssetAVAX,
      amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetBNB),
      destinationAddress: await wallet.getAddress(AssetAVAX.chain),
    })

    printQuoteSwap(txEstimatedSwap[0])

    const txSubmitted = await aggregator.doSwap({
      protocol: txEstimatedSwap[0].protocol,
      fromAsset: AssetBNB,
      destinationAsset: AssetAVAX,
      amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetBNB),
      destinationAddress: await wallet.getAddress(AssetAVAX.chain),
    })

    console.log(txSubmitted)
  })

  it('Should do ERC20 swap using chosen protocol', async () => {
    const txEstimatedSwap = await aggregator.estimateSwap({
      fromAsset: assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7'),
      destinationAsset: AssetETH,
      amount: new CryptoAmount(
        assetToBase(assetAmount(20, 6)),
        assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7'),
      ),
      destinationAddress: await wallet.getAddress(AssetETH.chain),
    })

    printQuoteSwap(bestSwap(txEstimatedSwap))

    const txSubmitted = await aggregator.doSwap({
      protocol: bestSwap(txEstimatedSwap).protocol,
      fromAsset: assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7'),
      destinationAsset: AssetETH,
      amount: new CryptoAmount(
        assetToBase(assetAmount(20, 6)),
        assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7'),
      ),
      destinationAddress: await wallet.getAddress(AssetETH.chain),
    })

    console.log(txSubmitted)
  })

  it('Should do swap without selecting protocol', async () => {
    const txSubmitted = await aggregator.doSwap({
      fromAsset: AssetBNB,
      destinationAsset: AssetAVAX,
      amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetBNB),
      destinationAddress: await wallet.getAddress(AssetAVAX.chain),
    })

    console.log(txSubmitted)
  })

  // it('Should get swaps history', async () => {
  //   const swapHistory = await aggregator.getSwapHistory({
  //     chainAddresses: [{ chain: 'BTC', address: 'address' }],
  //   })

  //   console.log(
  //     swapHistory.swaps.map((swap) => {
  //       return {
  //         protocol: swap.protocol,
  //         status: swap.status,
  //         date: swap.date.toDateString(),
  //         inboundTX: {
  //           hash: swap.inboundTx.hash,
  //           address: swap.inboundTx.address,
  //           asset: assetToString(swap.inboundTx.amount.asset),
  //           amount: swap.inboundTx.amount.assetAmount.amount().toString(),
  //         },
  //         outboundTx: swap.outboundTx
  //           ? {
  //               hash: swap.outboundTx.hash,
  //               address: swap.outboundTx.address,
  //               asset: assetToString(swap.outboundTx.amount.asset),
  //               amount: swap.outboundTx.amount.assetAmount.amount().toString(),
  //             }
  //           : undefined,
  //       }
  //     }),
  //   )
  // })
})
