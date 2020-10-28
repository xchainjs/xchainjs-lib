import { CosmosSDK, PrivKey } from 'cosmos-client';
import { BroadcastTxCommitResult, Coin } from 'cosmos-client/api';
import { SearchTxParams, TransferParams, TxHistoryResponse, CosmosSDKClientParams } from './types';
export declare class CosmosSDKClient {
    sdk: CosmosSDK;
    server: string;
    chainId: string;
    prefix: string;
    derive_path: string;
    constructor({ server, chainId, prefix, derive_path }: CosmosSDKClientParams);
    setPrefix: () => void;
    getAddressFromPrivKey: (privkey: PrivKey) => string;
    getPrivKeyFromMnemonic: (mnemonic: string) => PrivKey;
    checkAddress: (address: string) => boolean;
    getBalance: (address: string) => Promise<Coin[]>;
    searchTx: ({ messageAction, messageSender, page, limit, txMinHeight, txMaxHeight, }: SearchTxParams) => Promise<TxHistoryResponse>;
    transfer: ({ privkey, from, to, amount, asset, memo }: TransferParams) => Promise<BroadcastTxCommitResult>;
}
