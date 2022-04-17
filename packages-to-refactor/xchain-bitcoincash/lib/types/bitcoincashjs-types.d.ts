/// <reference types="node" />
export declare type KeyPair = {
    getAddress(index: number): string;
};
export declare type Transaction = {
    toHex(): string;
};
export declare type TransactionBuilder = {
    inputs: any[];
    sign(vin: number, keyPair: KeyPair, redeemScript?: Buffer, hashType?: number, witnessValue?: number, witnessScript?: Buffer, signatureAlgorithm?: string): void;
    build(): Transaction;
    buildIncomplete(): Transaction;
};
export declare type Network = {
    messagePrefix: Buffer | string;
    bip32: {
        public: Buffer;
        private: Buffer;
    };
    pubKeyHash: Buffer;
    scriptHash: Buffer;
    wif: Buffer;
};
