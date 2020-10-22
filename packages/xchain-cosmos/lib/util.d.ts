import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank';
import { Msg } from 'cosmos-client';
import { Asset } from '@thorchain/asgardex-util';
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
