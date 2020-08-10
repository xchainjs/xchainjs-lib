export declare const getAddressUtxos: (baseUrl: string, address: string) => Promise<any>;
export declare const getAddressTxs: (baseUrl: string, address: string) => Promise<any>;
export declare const getFeeEstimates: (baseUrl: string) => Promise<any>;
export declare const getBlocks: (baseUrl: string, startHeight?: number | undefined) => Promise<any>;
export declare const getTxInfo: (baseUrl: string, txId: string) => Promise<any>;
export declare const getAddressInfo: (baseUrl: string, address: string) => Promise<any>;
