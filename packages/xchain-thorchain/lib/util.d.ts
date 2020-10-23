import { Msg } from 'cosmos-client';
import { MsgSend, MsgMultiSend } from 'cosmos-client/x/bank';
import { Asset } from '@xchainjs/xchain-util';
/**
 * Type guard for MsgSend
 */
export declare const isMsgSend: (v: Msg) => v is MsgSend;
/**
 * Type guard for MsgMultiSend
 */
export declare const isMsgMultiSend: (v: Msg) => v is MsgMultiSend;
/**
 * Get denom from Asset
 */
export declare const getDenom: (v: Asset) => string;
/**
 * Get Asset from denom
 */
export declare const getAsset: (v: string) => Asset | null;
