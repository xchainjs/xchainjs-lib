/// <reference types="node" />
export declare const getBytes: (string: string) => number[];
export declare const ab2hexstring: (arr: number[]) => string;
export declare const sha256ripemd160: (hex: string) => string;
export declare const encodeAddress: (value: string | Buffer, prefix?: string, type?: BufferEncoding) => string;
export declare const createAddress: (publicKey: number[]) => string;
export declare const pbkdf2Async: (passphrase: string | Buffer | NodeJS.TypedArray | DataView, salt: string | Buffer | NodeJS.TypedArray | DataView, iterations: number, keylen: number, digest: string) => Promise<Buffer>;
