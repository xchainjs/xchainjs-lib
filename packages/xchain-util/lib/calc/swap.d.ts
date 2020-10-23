import { BaseAmount } from '../types';
import BigNumber from 'bignumber.js';
export declare type PoolData = {
    assetBalance: BaseAmount;
    runeBalance: BaseAmount;
};
export declare const getSwapOutput: (inputAmount: BaseAmount, pool: PoolData, toRune: boolean) => BaseAmount;
export declare const getSwapOutputWithFee: (inputAmount: BaseAmount, pool: PoolData, toRune: boolean, transactionFee?: BaseAmount) => BaseAmount;
export declare const getSwapInput: (toRune: boolean, pool: PoolData, outputAmount: BaseAmount) => BaseAmount;
export declare const getSwapSlip: (inputAmount: BaseAmount, pool: PoolData, toRune: boolean) => BigNumber;
export declare const getSwapFee: (inputAmount: BaseAmount, pool: PoolData, toRune: boolean) => BaseAmount;
export declare const getValueOfAssetInRune: (inputAsset: BaseAmount, pool: PoolData) => BaseAmount;
export declare const getValueOfRuneInAsset: (inputRune: BaseAmount, pool: PoolData) => BaseAmount;
export declare const getDoubleSwapOutput: (inputAmount: BaseAmount, pool1: PoolData, pool2: PoolData) => BaseAmount;
export declare const getDoubleSwapOutputWithFee: (inputAmount: BaseAmount, pool1: PoolData, pool2: PoolData, transactionFee?: BaseAmount) => BaseAmount;
export declare const getDoubleSwapInput: (pool1: PoolData, pool2: PoolData, outputAmount: BaseAmount) => BaseAmount;
export declare const getDoubleSwapSlip: (inputAmount: BaseAmount, pool1: PoolData, pool2: PoolData) => BigNumber;
export declare const getDoubleSwapFee: (inputAmount: BaseAmount, pool1: PoolData, pool2: PoolData) => BaseAmount;
export declare const getValueOfAsset1InAsset2: (inputAsset: BaseAmount, pool1: PoolData, pool2: PoolData) => BaseAmount;
