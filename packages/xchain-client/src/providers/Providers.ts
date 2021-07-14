/* eslint-disable ordered-imports/ordered-imports */
import { Chain } from '@xchainjs/xchain-util/lib'
import { ProviderMap } from './Provider'

import { SochainProvider } from './SochainProvider'

const sochainProviderBTC = new SochainProvider(Chain.Bitcoin)

type ProvidersType = {
  [index in Chain]: ProviderMap
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
