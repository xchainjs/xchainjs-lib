export declare type Keystore = {
    address: string;
    crypto: {
        cipher: string;
        ciphertext: string;
        cipherparams: {
            iv: string;
        };
        kdf: string;
        kdfparams: {
            prf: string;
            dklen: number;
            salt: string;
            c: number;
        };
        mac: string;
    };
    id: string;
    version: number;
    meta: string;
};
export declare const generatePhrase: (size?: number) => string;
export declare const validatePhrase: (phrase: string) => boolean;
export declare const getSeed: (phrase: string) => string;
export declare const getAddress: (phrase: string) => string;
export declare const encryptToKeyStore: (phrase: string, password: string) => Promise<Keystore>;
export declare const decryptFromKeystore: (keystore: Keystore, password: string) => Promise<string>;
