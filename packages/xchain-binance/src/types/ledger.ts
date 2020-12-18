import { Transaction } from '@binance-chain/javascript-sdk'
import { SignMsg } from '@binance-chain/javascript-sdk/lib/types'
import { Address, Network, TxParams } from '@xchainjs/xchain-client/lib'

export type LedgerTxInfo = {
  tx: Transaction
  signMsg: SignMsg
}

export type LedgerTxInfoParams = TxParams & {
  sender: Address
  network: Network
}
