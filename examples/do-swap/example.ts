import {
  BlockcypherDataProviders as BTCBlockcypherDataProviders,
  Client as BTCClient,
  SochainDataProviders as BTCSochainDataProviders,
  defaultBTCParams,
} from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import {
  BlockcypherDataProviders as LTCBlockcypherDataProviders,
  Client as LTCClient,
  defaultLTCParams,
  sochainDataProviders as LTCSochainDataProviders,
} from '@xchainjs/xchain-litecoin'
import { Wallet } from '@xchainjs/xchain-thorchain-amm'
import { ThorchainQuery } from '@xchainjs/xchain-thorchain-query'
import { SochainProvider } from '@xchainjs/xchain-utxo-providers'

function customDataProvider(seed: string, thorchainQuery: ThorchainQuery): Wallet {
  // create a wallet
  const wallet = new Wallet(seed, thorchainQuery)

  // ============================
  // ===customize BTC client=====
  // ============================
  // override with your API key
  const mySochainProvider = BTCSochainDataProviders[Network.Mainnet] as SochainProvider
  mySochainProvider.apiKey = 'YOU_SOCHAIN_API_KEY'

  //overridde the default init params with your onfig
  const btcInitParams = {
    ...defaultBTCParams,
    dataProviders: [BTCSochainDataProviders, BTCBlockcypherDataProviders], // use sochain first and blockcypher as fallback
    phrase: seed,
  }
  const btcClient = new BTCClient(btcInitParams)
  wallet.clients['BTC'] = btcClient

  // ============================
  // ===customize LTC client=====
  // ============================
  // override with your API key
  const myLtcSochainProvider = LTCSochainDataProviders[Network.Mainnet] as SochainProvider
  myLtcSochainProvider.apiKey = 'YOU_SOCHAIN_API_KEY'

  //overridde the default init params with your onfig
  const ltcInitParams = {
    ...defaultLTCParams,
    dataProviders: [LTCSochainDataProviders, LTCBlockcypherDataProviders], // use sochain first and blockcypher as fallback
    phrase: seed,
  }
  const ltcClient = new LTCClient(ltcInitParams)
  wallet.clients['LTC'] = ltcClient

  // TODO repeat for DOGE,BCH

  return wallet
}
