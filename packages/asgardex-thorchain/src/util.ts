import { Msg } from 'cosmos-client'
import { MsgSend } from './thor/types'

/**
 * Type guard for MsgSend
 */
export const isMsgSend = (v: Msg): v is MsgSend => 
  (v as MsgSend)?.amount !== undefined && (v as MsgSend)?.from_address !== undefined && (v as MsgSend)?.to_address !== undefined
