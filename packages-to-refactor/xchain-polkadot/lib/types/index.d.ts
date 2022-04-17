import { Asset } from '@xchainjs/xchain-util';
export declare const AssetDOT: Asset;
export declare type SubscanResponse<T> = {
    code: number;
    message: string;
    ttl: number;
    data?: T | null;
};
export declare type Account = {
    address: string;
    balance: string;
    lock: string;
};
export declare type AccountDisplay = {
    address: string;
    display: string;
    judgements?: string | null;
    parent_display: string;
    parent: string;
    account_index: string;
    identity: boolean;
};
export declare type Transfer = {
    from: string;
    to: string;
    extrinsic_index: string;
    success: boolean;
    hash: string;
    block_num: number;
    block_timestamp: number;
    module: string;
    amount: string;
    fee: string;
    nonce?: number;
    from_account_display?: AccountDisplay;
    to_account_display?: AccountDisplay;
};
export declare type TransfersResult = {
    count: number;
    transfers?: Transfer[] | null;
};
export declare type ExtrinsicParam = {
    name: string;
    type: string;
    value: string;
    valueRaw: string;
};
export declare type ExtrinsicEvent = {
    event_index: string;
    block_num: number;
    extrinsic_idx: number;
    module_id: string;
    event_id: string;
    params: string;
    extrinsic_hash: string;
    event_idx: number;
    finalized: true;
};
export declare type ExtrinsicLifeTime = {
    birth: number;
    death: number;
};
export declare type Extrinsic = {
    block_timestamp: number;
    block_num: number;
    extrinsic_index: string;
    call_module_function: string;
    call_module: string;
    account_id: string;
    signature: string;
    nonce: number;
    extrinsic_hash: string;
    success: boolean;
    params: ExtrinsicParam[];
    transfer: Transfer;
    event: ExtrinsicEvent[];
    fee: string;
    error?: string | null;
    finalized: true;
    lifetime: ExtrinsicLifeTime;
    tip: string;
    account_display: AccountDisplay;
    crosschain_op?: string | null;
};
