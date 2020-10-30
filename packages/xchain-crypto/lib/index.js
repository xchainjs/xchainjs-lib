'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var crypto$2 = require('crypto');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto$2);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var bech32 = require('bech32');
var sha256 = require('crypto-js/sha256');
var ripemd160 = require('crypto-js/ripemd160');
var hexEncoding = require('crypto-js/enc-hex');
var ab2hexstring = function (arr) {
    var result = '';
    for (var i = 0; i < arr.length; i++) {
        var str = arr[i].toString(16);
        str = str.length === 0 ? '00' : str.length === 1 ? '0' + str : str;
        result += str;
    }
    return result;
};
var sha256ripemd160 = function (hex) {
    if (typeof hex !== 'string')
        throw new Error('sha256ripemd160 expects a string');
    if (hex.length % 2 !== 0)
        throw new Error("invalid hex string length: " + hex);
    var hexEncoded = hexEncoding.parse(hex);
    var ProgramSha256 = sha256(hexEncoded);
    return ripemd160(ProgramSha256).toString();
};
var encodeAddress = function (value, prefix, type) {
    if (prefix === void 0) { prefix = 'thor'; }
    if (type === void 0) { type = 'hex'; }
    var words;
    if (Buffer.isBuffer(value)) {
        words = bech32.toWords(Buffer.from(value));
    }
    else {
        words = bech32.toWords(Buffer.from(value, type));
    }
    return bech32.encode(prefix, words);
};
var createAddress = function (publicKey) {
    var hexed = ab2hexstring(publicKey);
    var hash = sha256ripemd160(hexed);
    var address = encodeAddress(hash, 'thor');
    return address;
};
var pbkdf2Async = function (passphrase, salt, iterations, keylen, digest) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                crypto__default['default'].pbkdf2(passphrase, salt, iterations, keylen, digest, function (err, drived) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(drived);
                    }
                });
            })];
    });
}); };

var crypto = require('crypto');
var secp256k1 = require('tiny-secp256k1');
var PubKeySecp256k1 = /** @class */ (function () {
    function PubKeySecp256k1(pubKey) {
        this.pubKey = pubKey;
    }
    PubKeySecp256k1.prototype.hash160 = function (buffer) {
        var sha256Hash = crypto.createHash('sha256').update(buffer).digest();
        try {
            return crypto.createHash('rmd160').update(sha256Hash).digest();
        }
        catch (err) {
            return crypto.createHash('ripemd160').update(sha256Hash).digest();
        }
    };
    PubKeySecp256k1.prototype.getAddress = function () {
        return this.hash160(this.pubKey);
    };
    PubKeySecp256k1.prototype.verify = function (signature, message) {
        var hash = crypto.createHash('sha256').update(message).digest();
        return secp256k1.verify(hash, signature, this.pubKey);
    };
    PubKeySecp256k1.prototype.toBuffer = function () {
        return Buffer.from(this.pubKey);
    };
    PubKeySecp256k1.prototype.toBase64 = function () {
        return this.pubKey.toString('base64');
    };
    PubKeySecp256k1.prototype.toJSONInCodec = function () {
        return this.toBase64();
    };
    PubKeySecp256k1.fromBase64 = function (value) {
        var buffer = Buffer.from(value, 'base64');
        return new PubKeySecp256k1(buffer);
    };
    PubKeySecp256k1.fromJSON = function (value) {
        return PubKeySecp256k1.fromBase64(value);
    };
    return PubKeySecp256k1;
}());
var PrivKeySecp256k1 = /** @class */ (function () {
    function PrivKeySecp256k1(privKey) {
        this.pubKey = new PubKeySecp256k1(secp256k1.pointFromScalar(privKey));
        this.privKey = privKey;
    }
    PrivKeySecp256k1.prototype.getPubKey = function () {
        return this.pubKey;
    };
    PrivKeySecp256k1.prototype.sign = function (message) {
        var hash = crypto.createHash('sha256').update(message).digest();
        var signature = secp256k1.sign(hash, this.privKey);
        return signature;
    };
    PrivKeySecp256k1.prototype.toBuffer = function () {
        return Buffer.from(this.privKey);
    };
    PrivKeySecp256k1.prototype.toBase64 = function () {
        return this.privKey.toString('base64');
    };
    PrivKeySecp256k1.prototype.toJSONInCodec = function () {
        return this.toBase64();
    };
    PrivKeySecp256k1.fromBase64 = function (value) {
        var buffer = Buffer.from(value, 'base64');
        return new PrivKeySecp256k1(buffer);
    };
    PrivKeySecp256k1.fromJSON = function (value) {
        return PrivKeySecp256k1.fromBase64(value);
    };
    return PrivKeySecp256k1;
}());

var crypto$1 = require('crypto');
var nacl = require('tweetnacl');
var PubKeyEd25519 = /** @class */ (function () {
    function PubKeyEd25519(pubKey) {
        this.pubKey = pubKey;
    }
    PubKeyEd25519.prototype.getAddress = function () {
        var hash = crypto$1.createHash('sha256').update(this.pubKey).digest();
        return hash.subarray(0, 20);
    };
    PubKeyEd25519.prototype.verify = function (signature) {
        return nacl.sign.open(new Uint8Array(signature), new Uint8Array(this.pubKey)) !== null;
    };
    PubKeyEd25519.prototype.toBuffer = function () {
        return Buffer.from(this.pubKey);
    };
    PubKeyEd25519.prototype.toBase64 = function () {
        return this.pubKey.toString('base64');
    };
    PubKeyEd25519.prototype.toJSONInCodec = function () {
        return this.toBase64();
    };
    PubKeyEd25519.fromBase64 = function (value) {
        var buffer = Buffer.from(value, 'base64');
        return new PubKeyEd25519(buffer);
    };
    PubKeyEd25519.fromJSON = function (value) {
        return PubKeyEd25519.fromBase64(value);
    };
    return PubKeyEd25519;
}());
var PrivKeyEd25519 = /** @class */ (function () {
    function PrivKeyEd25519(privKey) {
        var keypair = nacl.sign.keyPair.fromSeed(new Uint8Array(privKey));
        this.pubKey = new PubKeyEd25519(Buffer.from(keypair.publicKey));
        this.privKey = privKey;
    }
    PrivKeyEd25519.prototype.getPubKey = function () {
        return this.pubKey;
    };
    PrivKeyEd25519.prototype.sign = function (message) {
        var keypair = nacl.sign.keyPair.fromSeed(new Uint8Array(this.privKey));
        return Buffer.from(nacl.sign(new Uint8Array(message), new Uint8Array(keypair.secretKey)));
    };
    PrivKeyEd25519.prototype.toBuffer = function () {
        return Buffer.from(this.privKey);
    };
    PrivKeyEd25519.prototype.toBase64 = function () {
        return this.privKey.toString('base64');
    };
    PrivKeyEd25519.prototype.toJSONInCodec = function () {
        return this.toBase64();
    };
    PrivKeyEd25519.fromBase64 = function (value) {
        var buffer = Buffer.from(value, 'base64');
        return new PrivKeyEd25519(buffer);
    };
    PrivKeyEd25519.fromJSON = function (value) {
        return PrivKeyEd25519.fromBase64(value);
    };
    return PrivKeyEd25519;
}());

var bip39 = require('bip39');
var HDKey = require('hdkey');
var blake256 = require('foundry-primitives').blake256;
var uuidv4 = require('uuid').v4;
// Constants
var XChainBIP39Phrase = 'xchain';
var BIP44Path = "m/44'/931'/0'/0/0";
var cipher = 'aes-128-ctr';
var kdf = 'pbkdf2';
var prf = 'hmac-sha256';
var dklen = 32;
var c = 262144;
var hashFunction = 'sha256';
var meta = 'xchain-keystore';
var generatePhrase = function (size) {
    if (size === void 0) { size = 12; }
    var entropy = size == 12 ? 128 : 256;
    var phrase = bip39.generateMnemonic(entropy);
    return phrase;
};
var validatePhrase = function (phrase) {
    return bip39.validateMnemonic(phrase);
};
var getSeed = function (phrase) {
    var words = phrase.split(' ');
    if (words.length != 12 && words.length != 24) {
        throw new Error('invalid phrase');
    }
    var seed = bip39.mnemonicToSeedSync(phrase, XChainBIP39Phrase);
    return seed;
};
var getAddress = function (phrase) {
    var seed = getSeed(phrase);
    var hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'));
    var childkey = hdkey.derive(BIP44Path);
    var address = createAddress(childkey._publicKey);
    return address;
};
var getPublicKeyPair = function (phrase) {
    var seed = getSeed(phrase);
    var hdkey = HDKey.fromMasterSeed(Buffer.from(seed, 'hex'));
    var childkey = hdkey.derive(BIP44Path);
    return {
        secp256k1: new PrivKeySecp256k1(childkey.privateKey).getPubKey(),
        ed25519: new PrivKeyEd25519(childkey.privateKey).getPubKey(),
    };
};
var encryptToKeyStore = function (phrase, password) { return __awaiter(void 0, void 0, void 0, function () {
    var ID, salt, iv, kdfParams, cipherParams, derivedKey, cipherIV, cipherText, mac, cryptoStruct, keystore;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ID = uuidv4();
                salt = crypto__default['default'].randomBytes(32);
                iv = crypto__default['default'].randomBytes(16);
                kdfParams = {
                    prf: prf,
                    dklen: dklen,
                    salt: salt.toString('hex'),
                    c: c,
                };
                cipherParams = {
                    iv: iv.toString('hex'),
                };
                return [4 /*yield*/, pbkdf2Async(Buffer.from(password), salt, kdfParams.c, kdfParams.dklen, hashFunction)];
            case 1:
                derivedKey = _a.sent();
                cipherIV = crypto__default['default'].createCipheriv(cipher, derivedKey.slice(0, 16), iv);
                cipherText = Buffer.concat([cipherIV.update(Buffer.from(phrase, 'utf8')), cipherIV.final()]);
                mac = blake256(Buffer.concat([derivedKey.slice(16, 32), Buffer.from(cipherText)]));
                cryptoStruct = {
                    cipher: cipher,
                    ciphertext: cipherText.toString('hex'),
                    cipherparams: cipherParams,
                    kdf: kdf,
                    kdfparams: kdfParams,
                    mac: mac,
                };
                keystore = {
                    publickeys: getPublicKeyPair(phrase),
                    crypto: cryptoStruct,
                    id: ID,
                    version: 1,
                    meta: meta,
                };
                return [2 /*return*/, keystore];
        }
    });
}); };
var decryptFromKeystore = function (keystore, password) { return __awaiter(void 0, void 0, void 0, function () {
    var kdfparams, derivedKey, ciphertext, mac, decipher, phrase, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                kdfparams = keystore.crypto.kdfparams;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, pbkdf2Async(Buffer.from(password), Buffer.from(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, hashFunction)];
            case 2:
                derivedKey = _a.sent();
                ciphertext = Buffer.from(keystore.crypto.ciphertext, 'hex');
                mac = blake256(Buffer.concat([derivedKey.slice(16, 32), ciphertext]));
                if (mac !== keystore.crypto.mac) {
                    return [2 /*return*/, Promise.reject('invalid password')];
                }
                decipher = crypto__default['default'].createDecipheriv(keystore.crypto.cipher, derivedKey.slice(0, 16), Buffer.from(keystore.crypto.cipherparams.iv, 'hex'));
                phrase = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
                return [2 /*return*/, Promise.resolve(phrase.toString('utf8'))];
            case 3:
                error_1 = _a.sent();
                return [2 /*return*/, Promise.reject(error_1)];
            case 4: return [2 /*return*/];
        }
    });
}); };

exports.decryptFromKeystore = decryptFromKeystore;
exports.encryptToKeyStore = encryptToKeyStore;
exports.generatePhrase = generatePhrase;
exports.getAddress = getAddress;
exports.getPublicKeyPair = getPublicKeyPair;
exports.getSeed = getSeed;
exports.validatePhrase = validatePhrase;
//# sourceMappingURL=index.js.map
