import {
  Asset,
  AssetData,
  ChainData,
  Chains,
  DepositAddressRequestV2,
  DepositAddressResponse,
  QuoteRequest,
  QuoteResponseV2,
} from '@chainflip/sdk/swap'

class SwapSDK {
  async getChains(): Promise<ChainData[]> {
    return [
      {
        chain: 'Ethereum',
        name: 'Ethereum',
        evmChainId: 11155111,
        isMainnet: false,
        requiredBlockConfirmations: 7,
        maxRetryDurationBlocks: undefined,
      },
      {
        chain: 'Polkadot',
        name: 'Polkadot',
        evmChainId: undefined,
        isMainnet: false,
        requiredBlockConfirmations: undefined,
        maxRetryDurationBlocks: undefined,
      },
      {
        chain: 'Bitcoin',
        name: 'Bitcoin',
        evmChainId: undefined,
        isMainnet: false,
        requiredBlockConfirmations: 6,
        maxRetryDurationBlocks: undefined,
      },
    ]
  }

  async getAssets(): Promise<AssetData[]> {
    return [
      {
        chainflipId: 'Eth',
        asset: 'ETH',
        chain: 'Ethereum',
        contractAddress: undefined,
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
        isMainnet: true,
        minimumSwapAmount: '10000000000000000',
        maximumSwapAmount: null,
        minimumEgressAmount: '1',
      },
      {
        chainflipId: 'Flip',
        asset: 'FLIP',
        chain: 'Ethereum',
        contractAddress: '0x826180541412D574cf1336d22c0C0a287822678A',
        decimals: 18,
        name: 'FLIP',
        symbol: 'FLIP',
        isMainnet: true,
        minimumSwapAmount: '4000000000000000000',
        maximumSwapAmount: null,
        minimumEgressAmount: '1',
      },
      {
        chainflipId: 'Usdc',
        asset: 'USDC',
        chain: 'Ethereum',
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        name: 'USDC',
        symbol: 'USDC',
        isMainnet: true,
        minimumSwapAmount: '20000000',
        maximumSwapAmount: null,
        minimumEgressAmount: '1',
      },
      {
        chainflipId: 'Usdt',
        asset: 'USDT',
        chain: 'Ethereum',
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        name: 'USDT',
        symbol: 'USDT',
        isMainnet: true,
        minimumSwapAmount: '20000000',
        maximumSwapAmount: null,
        minimumEgressAmount: '1',
      },
      {
        chainflipId: 'Dot',
        asset: 'DOT',
        chain: 'Polkadot',
        contractAddress: undefined,
        decimals: 10,
        name: 'Polkadot',
        symbol: 'DOT',
        isMainnet: true,
        minimumSwapAmount: '40000000000',
        maximumSwapAmount: null,
        minimumEgressAmount: '1',
      },
      {
        chainflipId: 'Btc',
        asset: 'BTC',
        chain: 'Bitcoin',
        contractAddress: undefined,
        decimals: 8,
        name: 'Bitcoin',
        symbol: 'BTC',
        isMainnet: true,
        minimumSwapAmount: '70000',
        maximumSwapAmount: null,
        minimumEgressAmount: '600',
      },
    ]
  }

  async requestDepositAddressV2(params: DepositAddressRequestV2): Promise<DepositAddressResponse> {
    if (params.quote.srcAsset.chain === 'Bitcoin')
      return {
        amount: params.quote.depositAmount,
        srcAsset: params.quote.srcAsset.asset,
        srcChain: params.quote.srcAsset.chain,
        destAddress: params.destAddress,
        destAsset: params.quote.destAsset.asset,
        destChain: params.quote.destAsset.chain,
        depositAddress: 'BITCOINfakeaddress',
        depositChannelId: 'bitcoin-channel-id',
        brokerCommissionBps: 0,
        affiliateBrokers: [],
        depositChannelExpiryBlock: BigInt(10000),
        estimatedDepositChannelExpiryTime: 1716889354,
        channelOpeningFee: BigInt(100),
      }
    if (params.quote.srcAsset.chain === 'Ethereum' || params.quote.srcAsset.chain === 'Arbitrum')
      return {
        amount: params.quote.depositAmount,
        srcAsset: params.quote.srcAsset.asset,
        srcChain: params.quote.srcAsset.chain,
        destAddress: params.destAddress,
        destAsset: params.quote.destAsset.asset,
        destChain: params.quote.destAsset.chain,
        depositAddress: 'ETHEREUMfakeaddress',
        depositChannelId: 'ethereum-channel-id',
        brokerCommissionBps: 0,
        affiliateBrokers: [],
        depositChannelExpiryBlock: BigInt(20000),
        estimatedDepositChannelExpiryTime: 1716889354,
        channelOpeningFee: BigInt(100),
      }
    if (params.quote.srcAsset.chain === 'Polkadot')
      return {
        amount: params.quote.depositAmount,
        srcAsset: params.quote.srcAsset.asset,
        srcChain: params.quote.srcAsset.chain,
        destAddress: params.destAddress,
        destAsset: params.quote.destAsset.asset,
        destChain: params.quote.destAsset.chain,
        depositAddress: 'POLKADOTfakeaddress',
        depositChannelId: 'polkadot-channel-id',
        brokerCommissionBps: 0,
        affiliateBrokers: [],
        depositChannelExpiryBlock: BigInt(30000),
        estimatedDepositChannelExpiryTime: 1716889354,
        channelOpeningFee: BigInt(100),
      }
    throw Error('Can not get deposit address')
  }

  async getQuoteV2({ srcAsset, srcChain, destAsset, destChain, amount }: QuoteRequest): Promise<QuoteResponseV2> {
    if (
      srcChain === 'Ethereum' &&
      srcAsset === 'ETH' &&
      destChain === 'Bitcoin' &&
      destAsset === 'BTC' &&
      amount === '10000000000000000'
    ) {
      return {
        amount,
        srcChain,
        srcAsset,
        destChain,
        destAsset,
        quotes: [
          {
            srcAsset: { chain: 'Ethereum', asset: 'ETH' },
            destAsset: { chain: 'Bitcoin', asset: 'BTC' },
            depositAmount: '1000000',
            type: 'REGULAR',
            intermediateAmount: '36115119',
            estimatedDurationsSeconds: { deposit: 1800, swap: 264, egress: 12 },
            egressAmount: '51193',
            includedFees: [
              {
                type: 'INGRESS',
                chain: 'Ethereum',
                asset: 'ETH',
                amount: '689176257450000',
              },
              {
                type: 'NETWORK',
                chain: 'Ethereum',
                asset: 'USDC',
                amount: '36115',
              },
              {
                type: 'NETWORK',
                chain: 'Ethereum',
                asset: 'ETH',
                amount: '4655411871275',
              },
              {
                type: 'NETWORK',
                chain: 'Ethereum',
                asset: 'USDC',
                amount: '18057',
              },
              {
                type: 'EGRESS',
                chain: 'Bitcoin',
                asset: 'BTC',
                amount: '1599',
              },
            ],
            lowLiquidityWarning: false,
            estimatedDurationSeconds: 702,
            recommendedSlippageTolerancePercent: 1,
            poolInfo: [],
            estimatedPrice: '2300',
          },
        ],
      }
    }

    if (
      srcChain === 'Ethereum' &&
      srcAsset === 'USDT' &&
      destChain === 'Ethereum' &&
      destAsset === 'ETH' &&
      amount === '20000000'
    ) {
      return {
        amount,
        srcChain,
        srcAsset,
        destChain,
        destAsset,
        quotes: [
          {
            srcAsset: { chain: 'Ethereum', asset: 'USDT' },
            destAsset: { chain: 'Ethereum', asset: 'ETH' },
            depositAmount: '2000000',
            type: 'REGULAR',
            intermediateAmount: '36115119',
            estimatedDurationsSeconds: { deposit: 1800, swap: 264, egress: 12 },
            egressAmount: '2063188201000691',
            includedFees: [
              {
                type: 'INGRESS',
                chain: 'Ethereum',
                asset: 'USDT',
                amount: '6433935',
              },
              {
                type: 'NETWORK',
                chain: 'Ethereum',
                asset: 'USDC',
                amount: '13560',
              },
              {
                type: 'EGRESS',
                chain: 'Ethereum',
                asset: 'ETH',
                amount: '1447621978320000',
              },
            ],
            lowLiquidityWarning: false,
            estimatedDurationSeconds: 114,
            recommendedSlippageTolerancePercent: 1,
            poolInfo: [],
            estimatedPrice: '2300',
          },
        ],
      }
    }

    if (
      srcChain === 'Ethereum' &&
      srcAsset === 'ETH' &&
      destChain === 'Ethereum' &&
      destAsset === 'USDT' &&
      amount === '10000000000000000'
    ) {
      return {
        amount,
        srcChain,
        srcAsset,
        destChain,
        destAsset,
        quotes: [
          {
            srcAsset: { chain: 'Ethereum', asset: 'ETH' },
            destAsset: { chain: 'Ethereum', asset: 'USDT' },
            depositAmount: '1000000',
            type: 'REGULAR',
            intermediateAmount: '33919877',
            estimatedDurationsSeconds: { deposit: 1800, swap: 114, egress: 12 },
            egressAmount: '24884030',
            includedFees: [
              {
                type: 'INGRESS',
                chain: 'Ethereum',
                asset: 'ETH',
                amount: '1284811335100000',
              },
              {
                type: 'NETWORK',
                chain: 'Ethereum',
                asset: 'USDC',
                amount: '33919',
              },
              {
                type: 'EGRESS',
                chain: 'Ethereum',
                asset: 'USDT',
                amount: '8988369',
              },
            ],
            lowLiquidityWarning: false,
            estimatedDurationSeconds: 114,
            recommendedSlippageTolerancePercent: 1,
            poolInfo: [],
            estimatedPrice: '2300',
          },
        ],
      }
    }

    throw Error('Quote not mocked')
  }
}
export { SwapSDK, Asset, AssetData, Chains }
