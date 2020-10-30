/// <reference types="node" />
import { PubKey, PrivKey } from './key';
export declare class PubKeySecp256k1 implements PubKey {
    private pubKey;
    constructor(pubKey: Buffer);
    hash160(buffer: Buffer): Buffer;
    getAddress(): Buffer;
    verify(signature: Buffer, message: Buffer): any;
    toBuffer(): Buffer;
    toBase64(): string;
    toJSONInCodec(): string;
    static fromBase64(value: string): PubKeySecp256k1;
    static fromJSON(value: string): PubKeySecp256k1;
}
export declare class PrivKeySecp256k1 implements PrivKey {
    private pubKey;
    private privKey;
    constructor(privKey: Buffer);
    getPubKey(): PubKeySecp256k1;
    sign(message: Buffer): any;
    toBuffer(): Buffer;
    toBase64(): string;
    toJSONInCodec(): string;
    static fromBase64(value: string): PrivKeySecp256k1;
    static fromJSON(value: string): PrivKeySecp256k1;
}
