import { BaseAmount } from '../types';
import { PoolData } from './swap';
import BigNumber from 'bignumber.js';
export declare type UnitData = {
    stakeUnits: BaseAmount;
    totalUnits: BaseAmount;
};
export declare type StakeData = {
    asset: BaseAmount;
    rune: BaseAmount;
};
export declare const getStakeUnits: (stake: StakeData, pool: PoolData) => BaseAmount;
export declare const getPoolShare: (unitData: UnitData, pool: PoolData) => StakeData;
export declare const getSlipOnStake: (stake: StakeData, pool: PoolData) => BigNumber;
