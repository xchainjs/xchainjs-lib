export * from './etherscan/etherscan-data-provider'
export * from './etherscan/types'

import {
  DecodedEvent,
  GetBalanceResponse,
  GetTransactionResponse,
  GetTransactionsItem,
  GetTransactionsResponse,
  LogEvent,
  LogEventParam,
  getTxsParams,
} from './covalent/types'
import { RoutescanProvider } from './routescan'

export * from './covalent/covalent-data-provider'
export {
  GetBalanceResponse as CovalentGetBalanceResponse,
  LogEventParam as CovalentLogEventParam,
  LogEvent as CovalentLogEvent,
  DecodedEvent as CovalentDecodedEvent,
  GetTransactionsItem as CovalentGetTransactionsItem,
  GetTransactionsResponse as CovalentGetTransactionsResponse,
  GetTransactionResponse as CovalentGetTransactionResponse,
  getTxsParams as CovalentgetTxsParams,
  RoutescanProvider,
}
