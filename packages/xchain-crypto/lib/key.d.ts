/// <reference types="node" />
export declare type PrivKey = {
    getPubKey(): PubKey;
    toBuffer(): Buffer;
    toBase64(): string;
    sign(message: Buffer): Buffer;
};
export declare type PubKey = {
    getAddress(): Buffer;
    toBuffer(): Buffer;
    toBase64(): string;
    verify(signature: Buffer, message?: Buffer): boolean;
};
