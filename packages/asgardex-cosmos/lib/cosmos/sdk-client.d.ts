import { BigSource } from 'big.js';
import { CosmosSDK, PrivKey } from 'cosmos-client';
import { BroadcastTxCommitResult, Coin, PaginatedQueryTxs } from 'cosmos-client/api';
export declare class CosmosSDKClient {
    sdk: CosmosSDK;
    server: string;
    chainId: string;
    prefix: string;
    private derive_path;
    constructor(server: string, chainId: string);
    setPrefix: () => void;
    getAddressFromPrivKey: (privkey: PrivKey) => string;
    getPrivKeyFromMnemonic: (mnemonic: string) => PrivKey;
    checkAddress: (address: string) => boolean;
    getBalance: (address: string) => Promise<Coin[]>;
    searchTx: (messageAction?: string, messageSender?: string, page?: number, limit?: number, txMinHeight?: number, txMaxHeight?: number) => Promise<PaginatedQueryTxs>;
    transfer: (privkey: PrivKey, from: string, to: string, amount: BigSource, asset: string, memo?: string) => Promise<BroadcastTxCommitResult>;
}
