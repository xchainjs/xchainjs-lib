import { Asset } from '@xchainjs/xchain-util';
/**
 * Get denom from Asset
 */
export declare const getDenom: (v: Asset) => string;
/**
 * Get Asset from denom
 */
export declare const getAsset: (v: string) => Asset | null;
