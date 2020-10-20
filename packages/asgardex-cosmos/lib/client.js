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
var sdk_client_1 = require("./cosmos/sdk-client");
var codec_1 = require("cosmos-client/codec");
var types_1 = require("./cosmos/types");
var util_1 = require("./util");
var asgardex_util_1 = require("@thorchain/asgardex-util");
var asgardexCrypto = require("@thorchain/asgardex-crypto");
var Client = /** @class */ (function () {
    function Client(_a) {
        var _this = this;
        var _b = _a.network, network = _b === void 0 ? 'testnet' : _b, phrase = _a.phrase;
        this.phrase = '';
        this.address = ''; // default address at index 0
        this.privateKey = null; // default private key at index 0
        this.setNetwork = function (network) {
            _this.network = network;
            _this.thorClient = new sdk_client_1.CosmosSDKClient(_this.getClientUrl(), _this.getChainId());
            _this.address = '';
            return _this;
        };
        this.getClientUrl = function () {
            return _this.network === 'testnet' ? 'http://lcd.gaia.bigdipper.live:1317' : 'https://api.cosmos.network';
        };
        this.getChainId = function () {
            return _this.network === 'testnet' ? 'gaia-3a' : 'cosmoshub-3';
        };
        this.getExplorerUrl = function () {
            return _this.network === 'testnet' ? 'https://gaia.bigdipper.live' : 'https://cosmos.bigdipper.live';
        };
        this.getExplorerAddressUrl = function (address) {
            return _this.getExplorerUrl() + "/account/" + address;
        };
        this.getExplorerTxUrl = function (txID) {
            return _this.getExplorerUrl() + "/transactions/" + txID;
        };
        this.setPhrase = function (phrase) {
            if (_this.phrase !== phrase) {
                if (!asgardexCrypto.validatePhrase(phrase)) {
                    throw new Error('Invalid BIP39 phrase');
                }
                _this.phrase = phrase;
                _this.privateKey = null;
                _this.address = '';
            }
            return _this.getAddress();
        };
        this.getPrivateKey = function () {
            if (!_this.privateKey) {
                if (!_this.phrase)
                    throw new Error('Phrase not set');
                _this.privateKey = _this.thorClient.getPrivKeyFromMnemonic(_this.phrase);
            }
            return _this.privateKey;
        };
        this.getAddress = function () {
            if (!_this.address) {
                var address = _this.thorClient.getAddressFromPrivKey(_this.getPrivateKey());
                if (!address) {
                    throw new Error('address not defined');
                }
                _this.address = address;
            }
            return _this.address;
        };
        this.validateAddress = function (address) {
            return _this.thorClient.checkAddress(address);
        };
        this.getMainAsset = function () {
            return _this.network === 'testnet' ? types_1.AssetMuon : types_1.AssetAtom;
        };
        this.getBalance = function (address, asset) { return __awaiter(_this, void 0, void 0, function () {
            var balances, mainAsset_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!address) {
                            address = this.getAddress();
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.thorClient.getBalance(address)];
                    case 2:
                        balances = _a.sent();
                        mainAsset_1 = this.getMainAsset();
                        return [2 /*return*/, balances.map(function (balance) {
                                return {
                                    asset: balance.denom && util_1.getAsset(balance.denom) || mainAsset_1,
                                    amount: asgardex_util_1.baseAmount(balance.amount, 6),
                                };
                            }).filter(function (balance) { return !asset || balance.asset === asset; })];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_1)];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.getTransactions = function (params) { return __awaiter(_this, void 0, void 0, function () {
            var messageAction, messageSender, page, limit, txMinHeight, txMaxHeight, mainAsset_2, txHistory, txs, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        messageAction = 'send' // filter MsgSend only
                        ;
                        messageSender = params && params.address || this.getAddress();
                        page = params && params.offset || undefined;
                        limit = params && params.limit || undefined;
                        txMinHeight = undefined;
                        txMaxHeight = undefined;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        mainAsset_2 = this.getMainAsset();
                        return [4 /*yield*/, this.thorClient.searchTx(messageAction, messageSender, page, limit, txMinHeight, txMaxHeight)];
                    case 2:
                        txHistory = _b.sent();
                        txs = (txHistory.txs || []).reduce(function (acc, tx) {
                            var msgs = [];
                            if (tx.tx.type !== undefined) {
                                msgs = codec_1.codec.fromJSONString(JSON.stringify(tx.tx)).msg;
                            }
                            else {
                                msgs = codec_1.codec.fromJSONString(JSON.stringify(tx.tx.body.messages));
                            }
                            var from = [];
                            var to = [];
                            msgs.map(function (msg) {
                                if (util_1.isMsgSend(msg)) {
                                    var msgSend = msg;
                                    var amount = msgSend.amount
                                        .map(function (coin) { return asgardex_util_1.baseAmount(coin.amount, 6); })
                                        .reduce(function (acc, cur) { return asgardex_util_1.baseAmount(acc.amount().plus(cur.amount()), 6); }, asgardex_util_1.baseAmount(0, 6));
                                    from.push({
                                        from: msgSend.from_address.toBech32(),
                                        amount: amount,
                                    });
                                    to.push({
                                        to: msgSend.to_address.toBech32(),
                                        amount: amount,
                                    });
                                }
                                else if (util_1.isMsgMultiSend(msg)) {
                                    var msgMultiSend = msg;
                                    from.push.apply(from, msgMultiSend.inputs.map(function (input) {
                                        return {
                                            from: input.address,
                                            amount: input.coins
                                                .map(function (coin) { return asgardex_util_1.baseAmount(coin.amount, 6); })
                                                .reduce(function (acc, cur) { return asgardex_util_1.baseAmount(acc.amount().plus(cur.amount()), 6); }, asgardex_util_1.baseAmount(0, 6))
                                        };
                                    }));
                                    to.push.apply(to, msgMultiSend.outputs.map(function (output) {
                                        return {
                                            to: output.address,
                                            amount: output.coins
                                                .map(function (coin) { return asgardex_util_1.baseAmount(coin.amount, 6); })
                                                .reduce(function (acc, cur) { return asgardex_util_1.baseAmount(acc.amount().plus(cur.amount()), 6); }, asgardex_util_1.baseAmount(0, 6))
                                        };
                                    }));
                                }
                            });
                            return __spreadArrays(acc, [
                                {
                                    asset: mainAsset_2,
                                    from: from,
                                    to: to,
                                    date: new Date(tx.timestamp),
                                    type: (from.length > 0 || to.length > 0) ? 'transfer' : 'unknown',
                                    hash: tx.hash || '',
                                }
                            ]);
                        }, []);
                        return [2 /*return*/, {
                                total: parseInt(((_a = txHistory.total_count) === null || _a === void 0 ? void 0 : _a.toString()) || '0'),
                                txs: txs,
                            }];
                    case 3:
                        error_2 = _b.sent();
                        return [2 /*return*/, Promise.reject(error_2)];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
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
                var mainAsset, transferResult, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            mainAsset = this.getMainAsset();
                            return [4 /*yield*/, this.thorClient.transfer(this.getPrivateKey(), this.getAddress(), recipient, amount.amount().toString(), util_1.getDenom(asset || mainAsset), memo)];
                        case 1:
                            transferResult = _b.sent();
                            return [2 /*return*/, (transferResult === null || transferResult === void 0 ? void 0 : transferResult.txhash) || ''];
                        case 2:
                            error_3 = _b.sent();
                            return [2 /*return*/, Promise.reject(error_3)];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        // Need to be updated
        this.getFees = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, {
                            type: 'base',
                            average: asgardex_util_1.baseAmount(0, 6),
                        }];
                }
                catch (error) {
                    return [2 /*return*/, Promise.reject(error)];
                }
                return [2 /*return*/];
            });
        }); };
        this.network = network;
        this.thorClient = new sdk_client_1.CosmosSDKClient(this.getClientUrl(), this.getChainId());
        if (phrase)
            this.setPhrase(phrase);
    }
    Client.prototype.purgeClient = function () {
        this.phrase = '';
        this.address = '';
        this.privateKey = null;
    };
    Client.prototype.getNetwork = function () {
        return this.network;
    };
    Client.generatePhrase = function () {
        return asgardexCrypto.generatePhrase();
    };
    Client.validatePhrase = function (phrase) {
        return asgardexCrypto.validatePhrase(phrase);
    };
    return Client;
}());
exports.Client = Client;
//# sourceMappingURL=client.js.map