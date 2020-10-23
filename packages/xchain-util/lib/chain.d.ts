import { Chain } from './types';
/**
 * Type guard to check whether string  is based on type `Chain`
 */
export declare const isChain: (c: string) => c is "BNB" | "BTC" | "ETH" | "THOR";
export declare const chainToString: (chainId: Chain) => "Thorchain" | "Bitcoin" | "Ethereum" | "Binance Chain" | "unknown chain";
