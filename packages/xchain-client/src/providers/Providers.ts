/* eslint-disable ordered-imports/ordered-imports */
import { Chain } from '@xchainjs/xchain-util/lib'
import { Provider } from './Provider'

import { SochainProvider } from './SochainProvider'

const sochainProviderBTC = new SochainProvider(Chain.Bitcoin)

type ProviderDefaultMap = {
  getBalance: Provider[]
  getTransactions: Provider[]
  getTransactionData: Provider[]
}

type ProvidersType = {
  [index in Chain]: ProviderDefaultMap
}

const DefaultProviders: ProvidersType = {
  BTC: {
    getBalance: [sochainProviderBTC],
    getTransactions: [sochainProviderBTC],
    getTransactionData: [sochainProviderBTC],
  },
  BCH: {
    getBalance: [sochainProviderBTC],
    getTransactions: [sochainProviderBTC],
    getTransactionData: [sochainProviderBTC],
  },
  LTC: {
    getBalance: [sochainProviderBTC],
    getTransactions: [sochainProviderBTC],
    getTransactionData: [sochainProviderBTC],
  },
  ETH: {
    getBalance: [sochainProviderBTC],
    getTransactions: [sochainProviderBTC],
    getTransactionData: [sochainProviderBTC],
  },
  BNB: {
    getBalance: [sochainProviderBTC],
    getTransactions: [sochainProviderBTC],
    getTransactionData: [sochainProviderBTC],
  },
  THOR: {
    getBalance: [sochainProviderBTC],
    getTransactions: [sochainProviderBTC],
    getTransactionData: [sochainProviderBTC],
  },
  GAIA: {
    getBalance: [sochainProviderBTC],
    getTransactions: [sochainProviderBTC],
    getTransactionData: [sochainProviderBTC],
  },
  POLKA: {
    getBalance: [sochainProviderBTC],
    getTransactions: [sochainProviderBTC],
    getTransactionData: [sochainProviderBTC],
  },
}

export { DefaultProviders }
