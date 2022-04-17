import { Address, FeeRate, Network, TxParams } from '@xchainjs/xchain-client';
import { UTXO } from './common';
export declare type LedgerTxInfo = {
    utxos: UTXO[];
    newTxHex: string;
};
export declare type LedgerTxInfoParams = Pick<TxParams, 'amount' | 'recipient'> & {
    feeRate: FeeRate;
    sender: Address;
    network: Network;
    sochainUrl: string;
    nodeApiKey: string;
};
