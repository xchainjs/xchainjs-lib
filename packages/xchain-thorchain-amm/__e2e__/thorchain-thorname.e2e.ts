import { BTCChain, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as ThorClient, THORChain } from '@xchainjs/xchain-thorchain'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { Asset, assetFromStringEx, assetToString } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'
import { EtherscanProvider, Network as EthersNetwork } from 'ethers'

import { ThorchainAMM } from '../src/thorchain-amm'

describe('ThorchainAmm e2e tests', () => {
  describe('Thorname', () => {
    let thorchainAmm: ThorchainAMM
    let wallet: Wallet

    beforeAll(() => {
      const ETH_MAINNET_ETHERS_PROVIDER = new EtherscanProvider('homestead', process.env.ETHERSCAN_API_KEY)
      const network = EthersNetwork.from('sepolia')
      const ETH_TESTNET_ETHERS_PROVIDER = new EtherscanProvider(network, process.env.ETHERSCAN_API_KEY)

      const ethersJSProviders = {
        [Network.Mainnet]: ETH_MAINNET_ETHERS_PROVIDER,
        [Network.Testnet]: ETH_TESTNET_ETHERS_PROVIDER,
        [Network.Stagenet]: ETH_MAINNET_ETHERS_PROVIDER,
      }
      const mayaChainQuery = new ThorchainQuery()
      const phrase = process.env.MAINNET_PHRASE
      wallet = new Wallet({
        BTC: new BtcClient({ ...defaultBtcParams, phrase, network: Network.Mainnet }),
        ETH: new EthClient({
          ...defaultEthParams,
          providers: ethersJSProviders,
          phrase,
          network: Network.Mainnet,
        }),
        THOR: new ThorClient({ phrase, network: Network.Mainnet }),
      })
      thorchainAmm = new ThorchainAMM(mayaChainQuery, wallet)
    })

    it('Should estimate THORName registration', async () => {
      const estimated = await thorchainAmm.estimateTHORNameRegistration({
        name: 'thorname',
        chain: THORChain,
        chainAddress: await wallet.getAddress(THORChain),
        owner: await wallet.getAddress(THORChain),
      })

      console.log({
        allowed: estimated.allowed,
        memo: estimated.memo,
        cost: `${estimated.value.assetAmount.amount().toString()} ${assetToString(estimated.value.asset)}`,
      })
    })

    it('Should register THORName', async () => {
      const txSubmitted = await thorchainAmm.registerTHORName({
        name: 'thorname',
        chain: THORChain,
        chainAddress: await wallet.getAddress(THORChain),
        owner: await wallet.getAddress(THORChain),
      })

      console.log(txSubmitted)
    })

    it('Should estimate THORName update with new alias', async () => {
      const estimated = await thorchainAmm.estimateTHORNameUpdate({
        name: 'thorname',
        chain: BTCChain,
        chainAddress: await wallet.getAddress('BTC'),
      })

      console.log({
        allowed: estimated.allowed,
        memo: estimated.memo,
        cost: `${estimated.value.assetAmount.amount().toString()} ${assetToString(estimated.value.asset)}`,
      })
    })

    it('Should update THORName with new alias', async () => {
      const txSubmitted = await thorchainAmm.updateTHORName({
        name: 'thorname',
        chain: BTCChain,
        chainAddress: await wallet.getAddress('BTC'),
      })

      console.log(txSubmitted)
    })

    it('Should estimate THORName update with new preferred asset', async () => {
      const estimated = await thorchainAmm.estimateTHORNameUpdate({
        name: 'thorname',
        preferredAsset: assetFromStringEx('ETH.ETH') as Asset,
        chain: 'ETH',
        chainAddress: await wallet.getAddress('ETH'),
      })

      console.log({
        allowed: estimated.allowed,
        memo: estimated.memo,
        cost: `${estimated.value.assetAmount.amount().toString()} ${assetToString(estimated.value.asset)}`,
      })
    })

    it('Should update THORName with new preferred asset', async () => {
      const txSubmitted = await thorchainAmm.updateTHORName({
        name: 'thorname',
        preferredAsset: assetFromStringEx('ETH.ETH') as Asset,
        chain: 'ETH',
        chainAddress: await wallet.getAddress('ETH'),
      })

      console.log(txSubmitted)
    })

    it(`Should get all thornames by address`, async () => {
      const thornames = await thorchainAmm.getThornamesByAddress('0xc50531811f3d8161a2b53349974ae4c7c6d3bfba')
      console.log('thornames', thornames)
    })
  })
})
