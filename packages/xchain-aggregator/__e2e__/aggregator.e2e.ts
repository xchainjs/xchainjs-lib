import { AssetAVAX, Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { AssetBNB, Client as BnbClient } from '@xchainjs/xchain-binance'
import {
  AssetBTC,
  BTC_DECIMAL,
  Client as BtcClient,
  defaultBTCParams as defaultBtcParams,
} from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { AssetETH, Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { AssetKUJI } from '@xchainjs/xchain-kujira'
import { Client as ThorClient, THORChain } from '@xchainjs/xchain-thorchain'
import {
  Asset,
  CryptoAmount,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { Aggregator, QuoteSwap } from '../src'
import { EarnPosition, QuoteAddToEarn } from '../src/types'

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

function printEarnPosition(position: EarnPosition) {
  console.log({
    protocol: position.protocol,
    address: position.address,
    asset: assetToString(position.asset),
    depositAmount: position.depositAmount.assetAmount.amount().toString(),
    redeemableAmount: position.redeemableAmount.assetAmount.amount().toString(),
    ageInDays: position.ageInDays,
    percentageGrowth: position.percentageGrowth,
    errors: position.errors,
  })
}

function printAddToEarnProduct(quote: QuoteAddToEarn) {
  console.log({
    protocol: quote.protocol,
    canAdd: quote.canAdd,
    toAddress: quote.toAddress,
    asset: assetToString(quote.amount.asset),
    assetAmount: quote.amount.assetAmount.amount().toString(),
    depositedAmount: quote.depositedAmount.assetAmount.amount().toString(),
    memo: quote.memo,
    errors: quote.errors,
    totalFees: {
      asset: assetToString(quote.fees.asset),
      affiliateFee: {
        asset: assetToString(quote.fees.affiliateFee.asset),
        amount: quote.fees.affiliateFee.baseAmount.amount().toString(),
        decimals: quote.fees.affiliateFee.baseAmount.decimal,
      },
      outboundFee: {
        asset: assetToString(quote.fees.outboundFee.asset),
        amount: quote.fees.outboundFee.baseAmount.amount().toString(),
        decimals: quote.fees.outboundFee.baseAmount.decimal,
      },
      liquidityFee: {
        asset: assetToString(quote.fees.liquidityFee.asset),
        amount: quote.fees.liquidityFee.baseAmount.amount().toString(),
        decimals: quote.fees.liquidityFee.baseAmount.decimal,
      },
    },
  })
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
      destinationAsset: AssetETH,
      amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetBTC),
    })
    printQuoteSwap(estimatedSwap)
  })

  it('Should find estimated swap with one protocol not supporting one asset', async () => {
    const estimatedSwap = await aggregator.estimateSwap({
      fromAsset: AssetBTC,
      destinationAsset: AssetKUJI,
      amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), AssetBTC),
    })
    printQuoteSwap(estimatedSwap)
  })

  it('Should find estimated swap with trade assets', async () => {
    const estimatedSwap = await aggregator.estimateSwap({
      fromAsset: assetFromStringEx('BTC~BTC'),
      destinationAsset: assetFromStringEx('ETH~ETH'),
      amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), assetFromStringEx('BTC~BTC')),
      destinationAddress: await wallet.getAddress(THORChain),
    })
    printQuoteSwap(estimatedSwap)
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

    printQuoteSwap(txEstimatedSwap)

    const txSubmitted = await aggregator.doSwap({
      protocol: txEstimatedSwap.protocol,
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

    printQuoteSwap(txEstimatedSwap)

    const txSubmitted = await aggregator.doSwap({
      protocol: txEstimatedSwap.protocol,
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

  it('Should list earn positions', async () => {
    const positions = await aggregator.listEarnPositions({
      assetAddresses: [
        {
          address: '0x3db0f3c5713f4248dcad61052c0590c538755eb8',
          asset: assetFromStringEx('BSC.BNB') as Asset,
        },
        {
          address: '0x3db0f3c5713f4248dcad61052c0590c538755eb8',
          asset: assetFromStringEx('ETH.ETH') as Asset,
        },
        {
          address: 'bc1qqduzvppjz2v0mccuel5d94qy2k43xhyr6amnp2',
          asset: assetFromStringEx('BTC.BTC') as Asset,
        },
      ],
    })

    for (const protocolPositions of Object.values(positions)) {
      for (const position of protocolPositions) {
        printEarnPosition(position)
      }
    }
  })

  it('Should estimate add to earn products', async () => {
    const quote = await aggregator.estimateAddToEarnProduct({
      amount: new CryptoAmount<Asset>(baseAmount(1 * 10 ** 8, 8), AssetBTC),
    })

    printAddToEarnProduct(quote)
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
