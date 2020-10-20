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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CosmosSDKClient = void 0;
var BIP39 = require("bip39");
var BIP32 = require("bip32");
var cosmos_client_1 = require("cosmos-client");
var auth_1 = require("cosmos-client/x/auth");
var bank_1 = require("cosmos-client/x/bank");
var CosmosSDKClient = /** @class */ (function () {
    function CosmosSDKClient(server, chainId) {
        var _this = this;
        this.prefix = 'cosmos';
        this.derive_path = '44\'/118\'/0\'/0/0';
        this.setPrefix = function () {
            cosmos_client_1.AccAddress.setBech32Prefix(_this.prefix, _this.prefix + 'pub', _this.prefix + 'valoper', _this.prefix + 'valoperpub', _this.prefix + 'valcons', _this.prefix + 'valconspub');
        };
        this.getAddressFromPrivKey = function (privkey) {
            return cosmos_client_1.AccAddress.fromPublicKey(privkey.getPubKey()).toBech32();
        };
        this.getPrivKeyFromMnemonic = function (mnemonic) {
            var seed = BIP39.mnemonicToSeedSync(mnemonic);
            var node = BIP32.fromSeed(seed);
            var child = node.derivePath(_this.derive_path);
            if (!child.privateKey) {
                throw new Error('child does not have a privateKey');
            }
            return new cosmos_client_1.PrivKeySecp256k1(child.privateKey);
        };
        this.checkAddress = function (address) {
            try {
                if (!address.startsWith(_this.prefix)) {
                    return false;
                }
                return cosmos_client_1.AccAddress.fromBech32(address).toBech32() === address;
            }
            catch (err) {
                return false;
            }
        };
        this.getBalance = function (address) { return __awaiter(_this, void 0, void 0, function () {
            var accAddress;
            return __generator(this, function (_a) {
                try {
                    accAddress = cosmos_client_1.AccAddress.fromBech32(address);
                    return [2 /*return*/, bank_1.bank.balancesAddressGet(this.sdk, accAddress).then(function (res) { return res.data.result; })];
                }
                catch (error) {
                    return [2 /*return*/, Promise.reject(error)];
                }
                return [2 /*return*/];
            });
        }); };
        this.searchTx = function (messageAction, messageSender, page, limit, txMinHeight, txMaxHeight) { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, auth_1.auth
                                .txsGet(this.sdk, messageAction, messageSender, page, limit, txMinHeight, txMaxHeight)
                                .then(function (res) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, res.data];
                            }); }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_1)];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.transfer = function (privkey, from, to, amount, asset, memo) { return __awaiter(_this, void 0, void 0, function () {
            var fromAddress, toAddress, account, msg, fee, signatures, unsignedStdTx, signedStdTx, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        fromAddress = cosmos_client_1.AccAddress.fromBech32(from);
                        toAddress = cosmos_client_1.AccAddress.fromBech32(to);
                        return [4 /*yield*/, auth_1.auth.accountsAddressGet(this.sdk, fromAddress).then(function (res) { return res.data.result; })];
                    case 1:
                        account = _a.sent();
                        if (account.account_number === undefined) {
                            account = auth_1.BaseAccount.fromJSON(account.value);
                        }
                        msg = [
                            bank_1.MsgSend.fromJSON({
                                from_address: fromAddress.toBech32(),
                                to_address: toAddress.toBech32(),
                                amount: [{
                                        denom: asset,
                                        amount: amount.toString(),
                                    }]
                            })
                        ];
                        fee = {
                            gas: '200000',
                            amount: []
                        };
                        signatures = [];
                        unsignedStdTx = auth_1.StdTx.fromJSON({
                            msg: msg,
                            fee: fee,
                            signatures: signatures,
                            memo: memo,
                        });
                        signedStdTx = auth_1.auth.signStdTx(this.sdk, privkey, unsignedStdTx, account.account_number.toString(), account.sequence.toString());
                        return [4 /*yield*/, auth_1.auth.txsPost(this.sdk, signedStdTx, 'block').then(function (res) { return res.data; })];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_2)];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.server = server;
        this.chainId = chainId;
        this.sdk = new cosmos_client_1.CosmosSDK(this.server, this.chainId);
        this.setPrefix();
    }
    return CosmosSDKClient;
}());
exports.CosmosSDKClient = CosmosSDKClient;
//# sourceMappingURL=sdk-client.js.map