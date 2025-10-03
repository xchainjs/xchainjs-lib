import { AssetAVAX, Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { AssetBETH, BASEChain, Client as BaseClient, defaultBaseParams } from '@xchainjs/xchain-base'
import { AssetBSC, Client as BscClient, defaultBscParams } from '@xchainjs/xchain-bsc'
import {
  AssetBTC,
  BTCChain,
  BTC_DECIMAL,
  Client as BtcClient,
  defaultBTCParams as defaultBtcParams,
} from '@xchainjs/xchain-bitcoin'
import { Client as ZecClient, AssetZEC, defaultZECParams } from '@xchainjs/xchain-zcash'
import { Network } from '@xchainjs/xchain-client'
import { AssetETH, Client as EthClient, ETHChain, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { AssetKUJI } from '@xchainjs/xchain-kujira'
import { Client as ThorClient, THORChain } from '@xchainjs/xchain-thorchain'
import { Client as SolClient, SOLAsset, defaultSolanaParams } from '@xchainjs/xchain-solana'
import { AssetTRX, Client as TronClient, defaultTRONParams } from '@xchainjs/xchain-tron'
import {
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

const AssetUSDT: TokenAsset = {
  chain: ETHChain,
  symbol: 'USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7',
  ticker: 'USDT',
  type: AssetType.TOKEN,
}

const AssetUSDC: TokenAsset = {
  chain: ETHChain,
  symbol: 'USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  ticker: 'USDC',
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
      BNB: new BscClient({ ...defaultBscParams, phrase, network: Network.Mainnet }),
      THOR: new ThorClient({ phrase, network: Network.Mainnet }),
      SOL: new SolClient({ ...defaultSolanaParams, phrase, network: Network.Mainnet }),
      TRON: new TronClient({ ...defaultTRONParams, phrase, network: Network.Mainnet }),
      ZEC: new ZecClient({ ...defaultZECParams, phrase, network: Network.Mainnet }),
    })
    aggregator = new Aggregator({
      wallet,
      affiliate: {
        basisPoints: 30,
        affiliates: { Thorchain: 'dx', Mayachain: 'dx' },
      },
    })
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
  it('Should find estimated swap with secured assets', async () => {
    const estimatedSwap = await aggregator.estimateSwap({
      fromAsset: assetFromStringEx('AVAX-AVAX'),
      destinationAsset: assetFromStringEx('ETH-ETH'),
      amount: new CryptoAmount(assetToBase(assetAmount(1, BTC_DECIMAL)), assetFromStringEx('AVAX-AVAX')),
      destinationAddress: await wallet.getAddress(THORChain),
      streamingInterval: 1,
      streamingQuantity: 0,
      toleranceBps: 10000,
      fromAddress: await wallet.getAddress(THORChain),
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
    const destinationAddress = await wallet.getAddress(SOLAsset.chain)
    const txEstimatedSwap = await aggregator.estimateSwap({
      fromAsset: AssetUSDC,
      destinationAsset: SOLAsset,
      amount: new CryptoAmount(assetToBase(assetAmount(25, 6)), AssetUSDC),
      destinationAddress: destinationAddress,
    })

    printQuoteSwap(txEstimatedSwap[0])

    const txSubmitted = await aggregator.doSwap({
      protocol: txEstimatedSwap[0].protocol,
      fromAsset: AssetUSDC,
      fromAddress: await wallet.getAddress(ETHChain),
      destinationAsset: SOLAsset,
      amount: new CryptoAmount(assetToBase(assetAmount(25, 6)), AssetUSDC),
      destinationAddress: destinationAddress,
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
      fromAsset: AssetBSC,
      destinationAsset: AssetAVAX,
      amount: new CryptoAmount(assetToBase(assetAmount(1)), AssetBSC),
      destinationAddress: await wallet.getAddress(AssetAVAX.chain),
    })

    console.log(txSubmitted)
  })

  it('Should estimate swap from TRON.TRX to THOR.RUNE', async () => {
    const estimatedSwap = await aggregator.estimateSwap({
      fromAsset: AssetTRX,
      destinationAsset: assetFromStringEx('THOR.RUNE'),
      fromAddress: await wallet.getAddress(AssetTRX.chain),
      destinationAddress: await wallet.getAddress(THORChain),
      amount: new CryptoAmount(assetToBase(assetAmount(1000, 6)), AssetTRX),
    })
    printQuoteSwap(bestSwap(estimatedSwap))
  })

  it('Should estimate swap from THOR.RUNE to TRON.TRX', async () => {
    const estimatedSwap = await aggregator.estimateSwap({
      fromAsset: assetFromStringEx('THOR.RUNE'),
      destinationAsset: AssetTRX,
      fromAddress: await wallet.getAddress(THORChain),
      destinationAddress: await wallet.getAddress(AssetTRX.chain),
      amount: new CryptoAmount(assetToBase(assetAmount(100, 8)), assetFromStringEx('THOR.RUNE')),
    })
    printQuoteSwap(bestSwap(estimatedSwap))
  })

  it('Should check if ZEC and DASH are supported', async () => {
    const zecAsset = AssetZEC
    const dashAsset = assetFromStringEx('DASH.DASH')

    console.log('Asset strings:')
    console.log(`ZEC asset: ${assetToString(zecAsset)}`)
    console.log(`DASH asset: ${assetToString(dashAsset)}`)

    // Get mayachain protocol and check pools directly
    const mayachainProtocol = aggregator.getProtocol('Mayachain')
    if (mayachainProtocol) {
      try {
        // Debug: Get pools and check their status
        console.log('Debug: Checking pool statuses...')
        // Access the private mayachainQuery via any property to debug
        const pools = await (mayachainProtocol as any).mayachainQuery.getPools()

        console.log('Sample pool statuses:')
        pools.slice(0, 3).forEach((pool: any) => {
          console.log(`Pool ${pool.asset}: status="${pool.status}" (type: ${typeof pool.status})`)
        })

        // Check if ZEC.ZEC or DASH.DASH pools exist
        const zecPool = pools.find((pool: any) => pool.asset === 'ZEC.ZEC')
        const dashPool = pools.find((pool: any) => pool.asset === 'DASH.DASH')

        if (zecPool) {
          console.log(`ZEC pool found: status="${zecPool.status}" (type: ${typeof zecPool.status})`)
        } else {
          console.log('ZEC pool not found')
        }

        if (dashPool) {
          console.log(`DASH pool found: status="${dashPool.status}" (type: ${typeof dashPool.status})`)
        } else {
          console.log('DASH pool not found')
        }

        const zecSupported = await mayachainProtocol.isAssetSupported(zecAsset)
        const dashSupported = await mayachainProtocol.isAssetSupported(dashAsset)
        console.log(`Mayachain - ZEC: ${zecSupported}, DASH: ${dashSupported}`)
      } catch (e) {
        console.log(`Mayachain error: ${e}`)
      }
    }
  })

  it('Should estimate swap from ZEC to DASH if supported', async () => {
    const fromAsset = AssetZEC
    const destinationAsset = assetFromStringEx('DASH.DASH')

    try {
      const estimatedSwap = await aggregator.estimateSwap({
        fromAsset,
        destinationAsset,
        amount: new CryptoAmount(assetToBase(assetAmount(10, 8)), fromAsset),
      })

      console.log(`ZEC to DASH swap estimates:`)
      estimatedSwap.forEach((quote, index) => {
        console.log(`\nQuote ${index + 1}:`)
        printQuoteSwap(quote)
      })

      const best = bestSwap(estimatedSwap)
      console.log(`\nBest quote:`)
      printQuoteSwap(best)
    } catch {
      console.log('This likely means ZEC and/or DASH are not supported by any protocol pools')

      // Let's try a different approach - ZEC to BTC, then BTC to DASH conceptually
      console.log('\nTrying ZEC to BTC as alternative:')
      try {
        const zecToBtc = await aggregator.estimateSwap({
          fromAsset,
          destinationAsset: AssetBTC,
          amount: new CryptoAmount(assetToBase(assetAmount(1, 8)), fromAsset),
        })
        console.log('ZEC to BTC is supported!')
        printQuoteSwap(bestSwap(zecToBtc))
      } catch {
        console.log(`ZEC to BTC also failed: `)
      }
    }
  })
})
