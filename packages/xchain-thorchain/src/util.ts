import { Msg } from 'cosmos-client'
import { MsgSend, MsgMultiSend } from 'cosmos-client/x/bank'

/**
 * Type guard for MsgSend
 */
export const isMsgSend = (v: Msg): v is MsgSend => 
  (v as MsgSend)?.amount !== undefined && (v as MsgSend)?.from_address !== undefined && (v as MsgSend)?.to_address !== undefined

/**
 * Type guard for MsgMultiSend
 */
export const isMsgMultiSend = (v: Msg): v is MsgMultiSend => 
  (v as MsgMultiSend)?.inputs !== undefined && (v as MsgMultiSend)?.outputs !== undefined
