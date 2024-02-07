import { TxParams } from '@xchainjs/xchain-client'
import { BigNumber } from 'bignumber.js'

export type TxOfflineParams = TxParams & {
  gasLimit?: BigNumber
}
