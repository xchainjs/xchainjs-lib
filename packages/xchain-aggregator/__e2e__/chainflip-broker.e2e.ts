import { AssetBTC, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { AssetETH, Client as EthClient, ETH_GAS_ASSET_DECIMAL, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { CryptoAmount, assetAmount, assetToBase } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { ChainflipProtocol } from '../src/protocols/chainflip'

jest.deepUnmock('@chainflip/sdk/swap')
jest.setTimeout(120000) // Longer timeout for live broker testing

describe('Chainflip protocol with broker - E2E', () => {
  let protocolWithBroker: ChainflipProtocol
  let protocolWithoutBroker: ChainflipProtocol
  let wallet: Wallet

  beforeAll(() => {
    const phrase = process.env.PHRASE_MAINNET

    wallet = new Wallet({
      BTC: new BtcClient({ ...defaultBtcParams, phrase, network: Network.Mainnet }),
      ETH: new EthClient({
        ...defaultEthParams,
        phrase,
      }),
    })

    // Protocol with broker configuration
    protocolWithBroker = new ChainflipProtocol({
      wallet,
      brokerUrl: 'https://broker.url.',
      affiliateBrokers: [
        {
          account: 'cF-address',
          commissionBps: 30, // .3%
        },
      ],
    })

    // Protocol without broker for comparison
    protocolWithoutBroker = new ChainflipProtocol({ wallet })
  })

  it('Should estimate swap with broker configuration', async () => {
    const estimatedSwap = await protocolWithBroker.estimateSwap({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      fromAddress: await wallet.getAddress(AssetETH.chain),
      amount: new CryptoAmount(assetToBase(assetAmount(10, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      destinationAddress: await wallet.getAddress(AssetBTC.chain),
    })
    console.log(estimatedSwap)
    console.log('Broker swap estimate:', {
      expectedAmount: estimatedSwap.expectedAmount.baseAmount.amount().toString(),
      affiliateFee: estimatedSwap.fees.affiliateFee.baseAmount.amount().toString(),
      outboundFee: estimatedSwap.fees.outboundFee.baseAmount.amount().toString(),
    })
  })

  it('Should estimate swap without broker configuration', async () => {
    const estimatedSwap = await protocolWithoutBroker.estimateSwap({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      fromAddress: await wallet.getAddress(AssetETH.chain),
      amount: new CryptoAmount(assetToBase(assetAmount(0.01, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      destinationAddress: await wallet.getAddress(AssetBTC.chain),
    })

    console.log('Non-broker swap estimate:', {
      expectedAmount: estimatedSwap.expectedAmount.baseAmount.amount().toString(),
      affiliateFee: estimatedSwap.fees.affiliateFee.baseAmount.amount().toString(),
      outboundFee: estimatedSwap.fees.outboundFee.baseAmount.amount().toString(),
    })
  })

  it('Should show broker fees in swap with broker configuration', async () => {
    const estimatedSwapWithBroker = await protocolWithBroker.estimateSwap({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      fromAddress: await wallet.getAddress(AssetETH.chain),
      amount: new CryptoAmount(assetToBase(assetAmount(10, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      destinationAddress: await wallet.getAddress(AssetBTC.chain),
    })

    const estimatedSwapWithoutBroker = await protocolWithoutBroker.estimateSwap({
      fromAsset: AssetETH,
      destinationAsset: AssetBTC,
      fromAddress: await wallet.getAddress(AssetETH.chain),
      amount: new CryptoAmount(assetToBase(assetAmount(10, ETH_GAS_ASSET_DECIMAL)), AssetETH),
      destinationAddress: await wallet.getAddress(AssetBTC.chain),
    })

    const brokerAffiliateFee = estimatedSwapWithBroker.fees.affiliateFee.baseAmount.amount()
    const noBrokerAffiliateFee = estimatedSwapWithoutBroker.fees.affiliateFee.baseAmount.amount()

    console.log('Broker affiliate fee:', brokerAffiliateFee.toString())
    console.log('Non-broker affiliate fee:', noBrokerAffiliateFee.toString())

    // With broker configuration, affiliate fees should be higher (broker takes commission)
    // This test might need adjustment based on actual broker behavior
  })
})
