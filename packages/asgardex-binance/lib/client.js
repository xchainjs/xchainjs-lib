"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
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
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
var axios_1 = require("axios");
var crypto = require("@binance-chain/javascript-sdk/lib/crypto");
var client_1 = require("@binance-chain/javascript-sdk/lib/client");
var asgardex_util_1 = require("@thorchain/asgardex-util");
var asgardexCrypto = require("@thorchain/asgardex-crypto");
var util_1 = require("./util");
/**
 * Custom Binance client
 *
 * @class Binance
 * @implements {BinanceClient}
 */
var Client = /** @class */ (function () {
    /**
     * Client has to be initialised with network type and phrase
     * It will throw an error if an invalid phrase has been passed
     **/
    function Client(_a) {
        var _this = this;
        var _b = _a.network, network = _b === void 0 ? 'testnet' : _b, phrase = _a.phrase;
        this.phrase = '';
        this.address = '';
        this.privateKey = null;
        this.getClientUrl = function () {
            return _this.network === 'testnet' ? 'https://testnet-dex.binance.org' : 'https://dex.binance.org';
        };
        this.getExplorerUrl = function () {
            return _this.network === 'testnet' ? 'https://testnet-explorer.binance.org' : 'https://explorer.binance.org';
        };
        this.getExplorerAddressUrl = function (address) {
            return _this.getExplorerUrl() + "/address/" + address;
        };
        this.getExplorerTxUrl = function (txID) {
            return _this.getExplorerUrl() + "/tx/" + txID;
        };
        this.getPrefix = function () {
            return _this.network === 'testnet' ? 'tbnb' : 'bnb';
        };
        this.setPhrase = function (phrase) {
            if (!_this.phrase || _this.phrase !== phrase) {
                if (!asgardexCrypto.validatePhrase(phrase)) {
                    throw new Error('Invalid BIP39 phrase');
                }
                _this.phrase = phrase;
                _this.privateKey = null;
                _this.address = '';
            }
            return _this.getAddress();
        };
        /**
         * @private
         * Returns private key
         * Throws an error if phrase has not been set before
         * */
        this.getPrivateKey = function () {
            if (!_this.privateKey) {
                if (!_this.phrase)
                    throw new Error('Phrase not set');
                _this.privateKey = crypto.getPrivateKeyFromMnemonic(_this.phrase);
            }
            return _this.privateKey;
        };
        this.getAddress = function () {
            if (!_this.address) {
                var address = crypto.getAddressFromPrivateKey(_this.getPrivateKey(), _this.getPrefix());
                if (!address) {
                    throw new Error('address not defined');
                }
                _this.address = address;
            }
            return _this.address;
        };
        this.validateAddress = function (address) {
            return _this.bncClient.checkAddress(address, _this.getPrefix());
        };
        this.getBalance = function (address, asset) { return __awaiter(_this, void 0, void 0, function () {
            var balances, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!address) {
                            address = this.getAddress();
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.bncClient.initChain()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.bncClient.getBalance(address)];
                    case 3:
                        balances = _a.sent();
                        return [2 /*return*/, balances.map(function (balance) {
                                return {
                                    asset: asgardex_util_1.assetFromString(balance.symbol) || asgardex_util_1.AssetBNB,
                                    amount: asgardex_util_1.assetToBase(asgardex_util_1.assetAmount(balance.free, 8)),
                                    frozenAmount: asgardex_util_1.assetToBase(asgardex_util_1.assetAmount(balance.frozen, 8)),
                                };
                            }).filter(function (balance) { return !asset || balance.asset === asset; })];
                    case 4:
                        error_1 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_1)];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.getTransactions = function (params) { return __awaiter(_this, void 0, void 0, function () {
            var clientUrl, url, txHistory, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bncClient.initChain()];
                    case 1:
                        _a.sent();
                        clientUrl = this.getClientUrl() + "/api/v1/transactions";
                        url = new URL(clientUrl);
                        url.searchParams.set('address', params ? params.address : this.getAddress());
                        if (params && params.limit) {
                            url.searchParams.set('limit', params.limit.toString());
                        }
                        if (params && params.offset) {
                            url.searchParams.set('offset', params.offset.toString());
                        }
                        if (params && params.startTime) {
                            url.searchParams.set('startTime', params.startTime.toString());
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get(url.toString()).then(function (response) { return response.data; })];
                    case 3:
                        txHistory = _a.sent();
                        return [2 /*return*/, {
                                total: txHistory.total,
                                txs: txHistory.tx.reduce(function (acc, tx) {
                                    var asset = asgardex_util_1.assetFromString(asgardex_util_1.AssetBNB.chain + "." + tx.txAsset);
                                    if (!asset)
                                        return acc;
                                    return __spreadArrays(acc, [
                                        {
                                            asset: asset,
                                            from: [
                                                {
                                                    from: tx.fromAddr,
                                                    amount: asgardex_util_1.assetToBase(asgardex_util_1.assetAmount(tx.value, 8)),
                                                }
                                            ],
                                            to: [
                                                {
                                                    to: tx.toAddr,
                                                    amount: asgardex_util_1.assetToBase(asgardex_util_1.assetAmount(tx.value, 8)),
                                                }
                                            ],
                                            date: new Date(tx.timeStamp),
                                            type: util_1.getTxType(tx.txType),
                                            hash: tx.txHash,
                                        }
                                    ]);
                                }, []),
                            }];
                    case 4:
                        error_2 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_2)];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.multiSend = function (_a) {
            var address = _a.address, transactions = _a.transactions, _b = _a.memo, memo = _b === void 0 ? '' : _b;
            return __awaiter(_this, void 0, void 0, function () {
                var transferResult;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.bncClient.initChain()];
                        case 1:
                            _c.sent();
                            return [4 /*yield*/, this.bncClient.setPrivateKey(this.getPrivateKey()).catch(function (error) { return Promise.reject(error); })];
                        case 2:
                            _c.sent();
                            return [4 /*yield*/, this.bncClient.multiSend(address || this.getAddress(), transactions.map(function (transaction) {
                                    return {
                                        to: transaction.to,
                                        coins: transaction.coins.map(function (coin) {
                                            return {
                                                denom: coin.asset.symbol,
                                                amount: asgardex_util_1.baseToAsset(coin.amount).amount().toString()
                                            };
                                        })
                                    };
                                }), memo)];
                        case 3:
                            transferResult = _c.sent();
                            try {
                                return [2 /*return*/, transferResult.result.map(function (txResult) { var _a; return (_a = txResult === null || txResult === void 0 ? void 0 : txResult.hash) !== null && _a !== void 0 ? _a : ''; })[0]];
                            }
                            catch (err) {
                                return [2 /*return*/, ''];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        this.deposit = function (_a) {
            var asset = _a.asset, amount = _a.amount, recipient = _a.recipient, memo = _a.memo;
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    return [2 /*return*/, this.transfer({ asset: asset, amount: amount, recipient: recipient, memo: memo })];
                });
            });
        };
        this.transfer = function (_a) {
            var asset = _a.asset, amount = _a.amount, recipient = _a.recipient, memo = _a.memo;
            return __awaiter(_this, void 0, void 0, function () {
                var transferResult;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.bncClient.initChain()];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, this.bncClient.setPrivateKey(this.getPrivateKey()).catch(function (error) { return Promise.reject(error); })];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, this.bncClient.transfer(this.getAddress(), recipient, asgardex_util_1.baseToAsset(amount).amount().toString(), asset ? asset.symbol : asgardex_util_1.AssetBNB.symbol, memo)];
                        case 3:
                            transferResult = _b.sent();
                            try {
                                return [2 /*return*/, transferResult.result.map(function (txResult) { var _a; return (_a = txResult === null || txResult === void 0 ? void 0 : txResult.hash) !== null && _a !== void 0 ? _a : ''; })[0]];
                            }
                            catch (err) {
                                return [2 /*return*/, ''];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        this.freeze = function (_a) {
            var recipient = _a.recipient, asset = _a.asset, amount = _a.amount;
            return __awaiter(_this, void 0, void 0, function () {
                var address, transferResult;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.bncClient.initChain()];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, this.bncClient.setPrivateKey(this.getPrivateKey()).catch(function (error) { return Promise.reject(error); })];
                        case 2:
                            _b.sent();
                            address = recipient || this.getAddress();
                            if (!address)
                                return [2 /*return*/, Promise.reject(new Error('Address has to be set. Or set a phrase by calling `setPhrase` before to use an address of an imported key.'))];
                            return [4 /*yield*/, this.bncClient.tokens.freeze(address, asset.symbol, asgardex_util_1.baseToAsset(amount).amount().toString())];
                        case 3:
                            transferResult = _b.sent();
                            try {
                                return [2 /*return*/, transferResult.result.map(function (txResult) { var _a; return (_a = txResult === null || txResult === void 0 ? void 0 : txResult.hash) !== null && _a !== void 0 ? _a : ''; })[0]];
                            }
                            catch (err) {
                                return [2 /*return*/, ''];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        this.unfreeze = function (_a) {
            var recipient = _a.recipient, asset = _a.asset, amount = _a.amount;
            return __awaiter(_this, void 0, void 0, function () {
                var address, transferResult;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.bncClient.initChain()];
                        case 1:
                            _b.sent();
                            return [4 /*yield*/, this.bncClient.setPrivateKey(this.getPrivateKey()).catch(function (error) { return Promise.reject(error); })];
                        case 2:
                            _b.sent();
                            address = recipient || this.getAddress();
                            if (!address)
                                return [2 /*return*/, Promise.reject(new Error('Address has to be set. Or set a phrase by calling `setPhrase` before to use an address of an imported key.'))];
                            return [4 /*yield*/, this.bncClient.tokens.unfreeze(address, asset.symbol, asgardex_util_1.baseToAsset(amount).amount().toString())];
                        case 3:
                            transferResult = _b.sent();
                            try {
                                return [2 /*return*/, transferResult.result.map(function (txResult) { var _a; return (_a = txResult === null || txResult === void 0 ? void 0 : txResult.hash) !== null && _a !== void 0 ? _a : ''; })[0]];
                            }
                            catch (err) {
                                return [2 /*return*/, ''];
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        this.getFees = function () { return __awaiter(_this, void 0, void 0, function () {
            var feesArray, transferFee, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bncClient.initChain()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get(this.getClientUrl() + "/api/v1/fees").then(function (response) { return response.data; })];
                    case 3:
                        feesArray = _a.sent();
                        transferFee = feesArray.find(util_1.isTransferFee);
                        if (!transferFee) {
                            throw new Error('failed to get transfer fees');
                        }
                        return [2 /*return*/, {
                                type: 'base',
                                average: asgardex_util_1.baseAmount(transferFee.fixed_fee_params.fee),
                            }];
                    case 4:
                        error_3 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_3)];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.getMultiSendFees = function () { return __awaiter(_this, void 0, void 0, function () {
            var feesArray, transferFee, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bncClient.initChain()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get(this.getClientUrl() + "/api/v1/fees").then(function (response) { return response.data; })];
                    case 3:
                        feesArray = _a.sent();
                        transferFee = feesArray.find(util_1.isTransferFee);
                        if (!transferFee) {
                            throw new Error('failed to get transfer fees');
                        }
                        return [2 /*return*/, {
                                type: 'base',
                                average: asgardex_util_1.baseAmount(transferFee.multi_transfer_fee),
                            }];
                    case 4:
                        error_4 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_4)];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this.getFreezeFees = function () { return __awaiter(_this, void 0, void 0, function () {
            var feesArray, freezeFee, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bncClient.initChain()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get(this.getClientUrl() + "/api/v1/fees").then(function (response) { return response.data; })];
                    case 3:
                        feesArray = _a.sent();
                        freezeFee = feesArray.find(util_1.isFreezeFee);
                        if (!freezeFee) {
                            throw new Error('failed to get transfer fees');
                        }
                        return [2 /*return*/, {
                                type: 'base',
                                average: asgardex_util_1.baseAmount(freezeFee.fee),
                            }];
                    case 4:
                        error_5 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_5)];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        // Invalid phrase will throw an error!
        this.network = network;
        if (phrase)
            this.setPhrase(phrase);
        this.bncClient = new client_1.BncClient(this.getClientUrl());
        this.bncClient.chooseNetwork(network);
    }
    Client.prototype.purgeClient = function () {
        this.phrase = '';
        this.address = '';
        this.privateKey = null;
    };
    Client.prototype.getBncClient = function () {
        return this.bncClient;
    };
    // update network
    Client.prototype.setNetwork = function (network) {
        this.network = network;
        this.bncClient = new client_1.BncClient(this.getClientUrl());
        this.bncClient.chooseNetwork(network);
        this.address = '';
        return this;
    };
    // Will return the desired network
    Client.prototype.getNetwork = function () {
        return this.network;
    };
    Client.generatePhrase = function () {
        return asgardexCrypto.generatePhrase();
    };
    return Client;
}());
exports.Client = Client;
//# sourceMappingURL=client.js.map