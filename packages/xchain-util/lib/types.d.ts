import BigNumber from 'bignumber.js';
import { chains } from './chain.const';
export declare enum Denomination {
    /**
     * values for asset amounts in base units (no decimal)
     */
    BASE = "BASE",
    /**
     * values of asset amounts (w/ decimal)
     */
    ASSET = "ASSET"
}
declare type Amount<T> = {
    type: T;
    amount: () => BigNumber;
    decimal: number;
};
export declare type BaseAmount = Amount<Denomination.BASE>;
export declare type AssetAmount = Amount<Denomination.ASSET>;
export declare type Amounts = AssetAmount | BaseAmount;
export declare type Chain = typeof chains[number];
export declare type Asset = {
    chain: Chain;
    symbol: string;
    ticker: string;
};
export {};
