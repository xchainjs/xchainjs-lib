import { Fees, Network } from '@xchainjs/xchain-client';
/**
 * Check Subscan API response
 *
 * @param {SubscanResponse} response The subscan response.
 * @returns {boolean} `true` or `false`
 */
export declare const isSuccess: (response: {
    code: number;
}) => boolean;
/**
 * Get the decimal based on the network
 *
 * @param {Network} network The network.
 * @returns {number} The decimal based on the network.
 */
export declare const getDecimal: (network: Network) => number;
/**
 * Get the default fees.
 *
 * @returns {Fees} The default fees based on the network.
 */
export declare const getDefaultFees: (network: Network) => Fees;
/**
 * Get address prefix based on the network.
 *
 * @param {Network} network
 * @returns {string} The address prefix based on the network.
 *
 **/
export declare const getPrefix: (network: Network) => "1" | "5";
