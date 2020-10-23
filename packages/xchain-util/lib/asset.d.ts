import BigNumber from 'bignumber.js';
import { Denomination, AssetAmount, BaseAmount, Amounts, Asset } from './types';
/**
 * Factory to create values of assets (e.g. RUNE)
 *
 * @param value - Asset amount - If the value is undefined, AssetAmount with value `0` will be returned
 * @param decimal (optional) - Decimal places - default 8
 *
 **/
export declare const assetAmount: (value: string | number | BigNumber | undefined, decimal?: number) => {
    type: Denomination.ASSET;
    amount: () => BigNumber;
    /**
     * Default number of asset decimals
     *
     * For history reason and by starting the project on Binance chain assets, it's 8 decimal.
     *
     * For example:
     * RUNE has a maximum of 8 digits of decimal
     * 0.00000001 RUNE == 1 ð (tor)
     * */
    decimal: number;
};
/**
 * Factory to create base amounts (e.g. tor)
 *
 * @param value - Base amount - If the value is undefined, BaseAmount with value `0` will be returned
 * @param decimal - Decimal places - default 8
 *
 **/
export declare const baseAmount: (value: string | number | BigNumber | undefined, decimal?: number) => {
    type: Denomination.BASE;
    amount: () => BigNumber;
    /**
     * Default number of asset decimals
     *
     * For history reason and by starting the project on Binance chain assets, it's 8 decimal.
     *
     * For example:
     * RUNE has a maximum of 8 digits of decimal
     * 0.00000001 RUNE == 1 ð (tor)
     * */
    decimal: number;
};
/**
 * Helper to convert values for a asset from base values (e.g. RUNE from tor)
 * */
export declare const baseToAsset: (base: BaseAmount) => AssetAmount;
/**
 * Helper to convert asset to base values (e.g. tor -> RUNE)
 * */
export declare const assetToBase: (asset: AssetAmount) => BaseAmount;
/**
 * Guard to check whether value is an amount of asset or not
 * */
export declare const isAssetAmount: (v: Amounts) => v is {
    type: Denomination.ASSET;
    amount: () => BigNumber;
    /**
     * Default number of asset decimals
     *
     * For history reason and by starting the project on Binance chain assets, it's 8 decimal.
     *
     * For example:
     * RUNE has a maximum of 8 digits of decimal
     * 0.00000001 RUNE == 1 ð (tor)
     * */
    decimal: number;
};
/**
 * Guard to check whether value is an amount of a base value or not
 * */
export declare const isBaseAmount: (v: Amounts) => v is {
    type: Denomination.BASE;
    amount: () => BigNumber;
    /**
     * Default number of asset decimals
     *
     * For history reason and by starting the project on Binance chain assets, it's 8 decimal.
     *
     * For example:
     * RUNE has a maximum of 8 digits of decimal
     * 0.00000001 RUNE == 1 ð (tor)
     * */
    decimal: number;
};
/**
 * Formats an `AssetAmount` into `string` based on decimal places
 *
 * If `decimal` is not set, `amount.decimal` is used
 * Note: `trimZeros` wins over `decimal`
 */
export declare const formatAssetAmount: ({ amount, decimal, trimZeros, }: {
    amount: AssetAmount;
    decimal?: number | undefined;
    trimZeros?: boolean | undefined;
}) => string;
/**
 * Formats a `BaseAmount` value into a `string`
 */
export declare const formatBaseAmount: (amount: BaseAmount) => string;
/**
 * Base "chain" assets
 *
 * Based on definition in Thorchain `common`
 * see https://gitlab.com/thorchain/thornode/-/blob/master/common/asset.go#L12-24
 */
export declare const AssetBNB: Asset;
export declare const AssetBTC: Asset;
export declare const AssetETH: Asset;
export declare const RUNE_TICKER = "RUNE";
export declare const AssetRune67C: Asset;
export declare const AssetRuneB1A: Asset;
export declare const AssetRuneNative: Asset;
/**
 * Helper to check whether asset is valid
 */
export declare const isValidAsset: (a: Asset) => boolean;
/**
 * Creates an `Asset` by a given string
 *
 * This helper function expects a string with following naming convention:
 * `AAA.BBB-CCC`
 * where
 * chain: `AAA`
 * ticker (optional): `BBB`
 * symbol: `BBB-CCC` or `CCC` (if no ticker available)
 *
 * @see  https://docs.thorchain.org/developers/transaction-memos#asset-notation
 *
 * If the naming convention fails, it returns null
 */
export declare const assetFromString: (s: string) => Asset | null;
/**
 * Returns an `Asset` as a string using following naming convention:
 *
 * `AAA.BBB-CCC`
 * where
 * chain: `AAA`
 * ticker (optional): `BBB`
 * symbol: `BBB-CCC` or `CCC` (if no ticker available)
 *
 * @see https://docs.thorchain.org/developers/transaction-memos#asset-notation
 *
 */
export declare const assetToString: ({ chain, symbol }: Asset) => string;
/**
 * Currency symbols currently supported
 */
export declare enum AssetCurrencySymbol {
    RUNE = "\u16B1",
    BTC = "\u20BF",
    SATOSHI = "\u26A1",
    ETH = "\u039E",
    USD = "$"
}
/**
 * Returns currency symbols by givven `Asset`
 */
export declare const currencySymbolByAsset: ({ ticker }: Asset) => string;
/**
 * Formats an asset amount using its currency symbol
 *
 * If `decimal` is not set, `amount.decimal` is used
 * If `asset` is not set, `$` will be used as currency symbol by default
 * `trimZeros` is `false` by default
 * Note: `trimZeros` wins over `decimal`
 */
export declare const formatAssetAmountCurrency: ({ amount, asset, decimal, trimZeros: shouldTrimZeros, }: {
    amount: AssetAmount;
    asset?: Asset | undefined;
    decimal?: number | undefined;
    trimZeros?: boolean | undefined;
}) => string;
/**
 * Formats a `BaseAmount` into a string of an `AssetAmount`
 *
 * If `decimal` is not set, `amount.decimal` is used
 * Note: `trimZeros` wins over `decimal`
 */
export declare const formatBaseAsAssetAmount: ({ amount, decimal, trimZeros, }: {
    amount: BaseAmount;
    decimal?: number | undefined;
    trimZeros?: boolean | undefined;
}) => string;
