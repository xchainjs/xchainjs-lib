import { TxSubmitted } from '@xchainjs/xchain-thorchain-amm'

export enum JammerAction {
  addLp,
  withdrawLp,
  swap,
  transfer,
}

export type TxDetail = {
  date: Date
  result: TxSubmitted | string
  details: any
}
