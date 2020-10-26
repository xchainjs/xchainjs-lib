import { Txs } from '@xchainjs/xchain-client';
import { Asset } from '@xchainjs/xchain-util';
import { Msg } from 'cosmos-client';
import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank';
import { TxResponse, APIQueryParam } from './cosmos/types';
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
/**
 * Parse transaction type
 */
export declare const getTxsFromHistory: (txs: Array<TxResponse>, mainAsset: Asset) => Txs;
/**
 * Get Query String
 */
export declare const getQueryString: (v: APIQueryParam) => string;
