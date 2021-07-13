// import { Asset, Chain } from '@xchainjs/xchain-util/lib'

// import { Balance, Tx, TxHistoryParams, TxsPage } from '../types'

// import { BaseProvider } from './Provider'

// export class HaskoinProvider extends BaseProvider {
//   constructor(chain: Chain) {
//     if (chain !== Chain.Bitcoin && chain !== Chain.BitcoinCash)
//       throw new Error('Blockstream explorer only supports bitcoin and bitcoincash')
//     super(chain)
//   }
//   getBalance(address: string, assets?: Asset[]): Promise<Balance[]> {
//     throw new Error('Method not implemented.')
//   }
//   getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
//     throw new Error('Method not implemented.')
//   }
//   getTransactionData(txId: string, assetAddress?: string): Promise<Tx> {
//     throw new Error('Method not implemented.')
//   }
// }
