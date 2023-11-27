import { Balance } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'

export type ChainBalances = {
  chain: Chain
  address: string
  balances: Balance[]
  error?: string
}

export type TxSubmitted = {
  hash: string
  url: string
}
