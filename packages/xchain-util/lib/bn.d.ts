import BigNumber from 'bignumber.js';
/**
 * Shortcut to create a BigNumber
 */
declare const bn: (value: BigNumber.Value) => BigNumber;
/**
 * Helper to check whether a BigNumber is valid or not
 * */
export declare const isValidBN: (value: BigNumber) => boolean;
/**
 * Helper to create a big number from string or number
 * If it fails to create a big number, a big number with value 0 will be returned instead
 * */
export declare const bnOrZero: (value: string | number | undefined) => BigNumber;
/**
 * Helper to validate a possible BigNumber
 * If the given valie is invalid or undefined, 0 is returned as a BigNumber
 */
export declare const validBNOrZero: (value: BigNumber | undefined) => BigNumber;
/**
 * Format a BaseNumber to a string depending on given decimal places
 * */
export declare const formatBN: (value: BigNumber, decimalPlaces?: number) => string;
export declare enum SymbolPosition {
    BEFORE = "before",
    AFTER = "after"
}
/**
 * Formats a big number value by prefixing it with `$`
 */
export declare const formatBNCurrency: (n: BigNumber, decimalPlaces?: number, symbol?: string, position?: SymbolPosition) => string;
/**
 * Helper to get a fixed `BigNumber`
 * Returns zero `BigNumber` if `value` is invalid
 * */
export declare const fixedBN: (value: number | string | BigNumber | undefined, decimalPlaces?: number) => BigNumber;
export default bn;
