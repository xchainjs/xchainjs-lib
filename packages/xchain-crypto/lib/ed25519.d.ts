/// <reference types="node" />
import { PubKey, PrivKey } from './key';
export declare class PubKeyEd25519 implements PubKey {
    private pubKey;
    constructor(pubKey: Buffer);
    getAddress(): any;
    verify(signature: Buffer): boolean;
    toBuffer(): Buffer;
    toBase64(): string;
    toJSONInCodec(): string;
    static fromBase64(value: string): PubKeyEd25519;
    static fromJSON(value: string): PubKeyEd25519;
}
export declare class PrivKeyEd25519 implements PrivKey {
    private pubKey;
    private privKey;
    constructor(privKey: Buffer);
    getPubKey(): PubKeyEd25519;
    sign(message: Buffer): Buffer;
    toBuffer(): Buffer;
    toBase64(): string;
    toJSONInCodec(): string;
    static fromBase64(value: string): PrivKeyEd25519;
    static fromJSON(value: string): PrivKeyEd25519;
}
