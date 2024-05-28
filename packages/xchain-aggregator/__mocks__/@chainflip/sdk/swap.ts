import {
  Asset,
  AssetData,
  ChainData,
  Chains,
  DepositAddressRequest,
  DepositAddressResponse,
  QuoteRequest,
  QuoteResponse,
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
      },
      {
        chain: 'Polkadot',
        name: 'Polkadot',
        evmChainId: undefined,
        isMainnet: false,
        requiredBlockConfirmations: undefined,
      },
      {
        chain: 'Bitcoin',
        name: 'Bitcoin',
        evmChainId: undefined,
        isMainnet: false,
        requiredBlockConfirmations: 6,
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

  async requestDepositAddress(params: DepositAddressRequest): Promise<DepositAddressResponse> {
    if (params.srcChain === 'Bitcoin')
      return {
        ...params,
        depositAddress: 'BITCOINfakeaddress',
        depositChannelId: 'bitcoin-channel-id',
        brokerCommissionBps: 0,
        depositChannelExpiryBlock: BigInt(10000),
        estimatedDepositChannelExpiryTime: 1716889354,
        channelOpeningFee: BigInt(100),
      }
    if (params.srcChain === 'Ethereum' || params.srcChain === 'Arbitrum')
      return {
        ...params,
        depositAddress: 'ETHEREUMfakeaddress',
        depositChannelId: 'ethereum-channel-id',
        brokerCommissionBps: 0,
        depositChannelExpiryBlock: BigInt(20000),
        estimatedDepositChannelExpiryTime: 1716889354,
        channelOpeningFee: BigInt(100),
      }
    if (params.srcChain === 'Polkadot')
      return {
        ...params,
        depositAddress: 'POLKADOTfakeaddress',
        depositChannelId: 'polkadot-channel-id',
        brokerCommissionBps: 0,
        depositChannelExpiryBlock: BigInt(30000),
        estimatedDepositChannelExpiryTime: 1716889354,
        channelOpeningFee: BigInt(100),
      }
    throw Error('Can not get deposit address')
  }

  async getQuote({ srcAsset, srcChain, destAsset, destChain, amount }: QuoteRequest): Promise<QuoteResponse> {
    if (
      srcChain === 'Ethereum' &&
      srcAsset === 'ETH' &&
      destChain === 'Bitcoin' &&
      destAsset === 'BTC' &&
      amount === '10000000000000000'
    ) {
      return {
        srcAsset,
        srcChain,
        destAsset,
        destChain,
        amount,
        quote: {
          intermediateAmount: '36115119',
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
              type: 'LIQUIDITY',
              chain: 'Ethereum',
              asset: 'ETH',
              amount: '4655411871275',
            },
            {
              type: 'LIQUIDITY',
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
        },
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
        srcAsset,
        srcChain,
        destAsset,
        destChain,
        amount,
        quote: {
          intermediateAmount: '13560635',
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
              type: 'LIQUIDITY',
              chain: 'Ethereum',
              asset: 'USDT',
              amount: '6783',
            },
            {
              type: 'LIQUIDITY',
              chain: 'Ethereum',
              asset: 'USDC',
              amount: '6780',
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
        },
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
        srcAsset,
        srcChain,
        destAsset,
        destChain,
        amount,
        quote: {
          intermediateAmount: '33919877',
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
              type: 'LIQUIDITY',
              chain: 'Ethereum',
              asset: 'ETH',
              amount: '4357594332450',
            },
            {
              type: 'LIQUIDITY',
              chain: 'Ethereum',
              asset: 'USDC',
              amount: '16959',
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
        },
      }
    }
    throw Error('Quote not mocked')
  }
}

export { SwapSDK, Asset, AssetData, Chains }
