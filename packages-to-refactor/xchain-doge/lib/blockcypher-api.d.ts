import { Network } from '@xchainjs/xchain-client/lib';
/**
 * Get Dogecoin suggested transaction fee.
 *
 * @returns {number} The Dogecoin suggested transaction fee per bytes in sat.
 */
export declare const getSuggestedTxFee: ({ blockcypherUrl }: {
    blockcypherUrl: string;
}) => Promise<number>;
export declare const getSendTxUrl: ({ blockcypherUrl, network }: {
    blockcypherUrl: string;
    network: Network;
}) => string;
