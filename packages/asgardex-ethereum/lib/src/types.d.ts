import { ethers } from 'ethers';
export declare type Address = string;
export declare type Phrase = string;
export declare enum Network {
    TEST = "rinkeby",
    MAIN = "homestead"
}
export declare type NormalTxOpts = {
    addressTo: Address;
    amount: ethers.BigNumberish;
    overrides?: NormalTxOverrides;
};
export declare type NormalTxOverrides = {
    nonce?: ethers.BigNumberish;
    gasLimit?: ethers.BigNumberish;
    gasPrice?: ethers.BigNumberish;
    data?: ethers.BytesLike;
};
export declare type Erc20TxOpts = {
    erc20ContractAddress: Address;
    addressTo: Address;
    amount: ethers.BigNumberish;
    overrides?: Erc20TxOverrides;
};
export declare type Erc20TxOverrides = {
    nonce?: ethers.BigNumberish;
    gasLimit: ethers.BigNumberish;
    gasPrice?: ethers.BigNumberish;
    value?: ethers.BigNumberish;
};
export declare type EstimateGasERC20Opts = {
    erc20ContractAddress: Address;
    addressTo: Address;
    amount: ethers.BigNumberish;
};
