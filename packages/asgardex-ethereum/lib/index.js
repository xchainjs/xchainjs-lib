'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var bip39 = require('bip39');
var ethers = require('ethers');
var providers = require('ethers/providers');
var utils = require('ethers/utils');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
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

var vaultABI = [
	{
		inputs: [
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "delta",
				type: "uint256"
			}
		],
		name: "Add",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address payable[]",
				name: "arrayAsgards",
				type: "address[]"
			}
		],
		name: "AddAsgard",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "Deposit",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "yggdrasil",
				type: "address"
			},
			{
				indexed: false,
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "YggdrasilMinus",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "yggdrasil",
				type: "address"
			},
			{
				indexed: false,
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "YggdrasilPlus",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "address payable[]",
				name: "newAsgards",
				type: "address[]"
			}
		],
		name: "addAsgard",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		name: "arrayAsgards",
		outputs: [
			{
				internalType: "address payable",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "asgardAllowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "asgardTransfer",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "asgards",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "deposit",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "deposit",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getAsgardCount",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "asset",
				type: "address"
			}
		],
		name: "sync",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "yggAllowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "yggdrasilMinus",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "yggdrasil",
				type: "address"
			},
			{
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "yggdrasilPlus",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "yggdrasilTransfer",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];

var erc20ABI = [
	{
		inputs: [
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "allowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
			{
				internalType: "bool",
				name: "success",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "transfer",
		outputs: [
			{
				internalType: "bool",
				name: "success",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
			{
				internalType: "bool",
				name: "success",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];

(function (Network) {
    Network["TEST"] = "rinkeby";
    Network["MAIN"] = "homestead";
})(exports.Network || (exports.Network = {}));
var ethAddress = '0x0000000000000000000000000000000000000000';
/**
 * Custom Ethereum client
 * @todo Error handling
 */
var Client = /** @class */ (function () {
    function Client(network, phrase, vault) {
        var _this = this;
        if (network === void 0) { network = exports.Network.TEST; }
        this._vault = null;
        /**
         * changes the wallet eg. when using connect() after init()
         */
        this.changeWallet = function (wallet) {
            return (_this._wallet = wallet);
        };
        if (phrase && !bip39.validateMnemonic(phrase)) {
            throw new Error('Invalid Phrase');
        }
        else {
            this._phrase = phrase || bip39.generateMnemonic();
            this._network = network;
            this._provider = ethers.getDefaultProvider(network);
            this._wallet = ethers.Wallet.fromMnemonic(this._phrase);
            this._address = this._wallet.address;
            this._balance = 0;
            this._etherscan = new providers.EtherscanProvider(this._network); // for tx history
            if (vault)
                this.setVault(vault);
        }
    }
    Object.defineProperty(Client.prototype, "address", {
        /**
         * Getters
         */
        get: function () {
            return this._address;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "wallet", {
        get: function () {
            return this._wallet;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "vault", {
        get: function () {
            return this._vault;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "network", {
        get: function () {
            return this._network;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "provider", {
        get: function () {
            return this._provider;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "balance", {
        get: function () {
            return this._balance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "etherscan", {
        // to enable spying on EtherscanProvider.getHistory()
        get: function () {
            return this._etherscan;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * changes the provider
     */
    Client.prototype.EtherscanProvider = function () {
        var newWallet = this.wallet.connect(new providers.EtherscanProvider(this._network));
        this.changeWallet(newWallet);
        return (this._provider = this._wallet.provider);
    };
    /**
     * Connects to the ethereum network with t
     */
    Client.prototype.init = function () {
        var provider = ethers.getDefaultProvider(this._network);
        var newWallet = this.wallet.connect(provider);
        this.changeWallet(newWallet);
        return this._wallet;
    };
    /**
     * Set's the current network
     */
    Client.prototype.setNetwork = function (network) {
        if (!network) {
            throw new Error('Wallet must be provided');
        }
        else {
            this._network = network;
            this._provider = ethers.getDefaultProvider(network);
            this._etherscan = new providers.EtherscanProvider(network);
            return this._network;
        }
    };
    /**
     * Set's the current vault contract
     */
    Client.prototype.setVault = function (vault) {
        if (!vault) {
            throw new Error('Vault address must be provided');
        }
        else {
            var contract = new ethers.Contract(vault, vaultABI, this._provider);
            this._vault = contract.connect(this.wallet);
            return this._vault;
        }
    };
    /**
     * Generates a new mnemonic / phrase
     */
    Client.generatePhrase = function () {
        return bip39.generateMnemonic();
    };
    /**
     * Validates a mnemonic phrase
     */
    Client.validatePhrase = function (phrase) {
        return bip39.validateMnemonic(phrase) ? true : false;
    };
    /**
     * Sets a new phrase (Eg. If user wants to change wallet)
     */
    Client.prototype.setPhrase = function (phrase) {
        if (!Client.validatePhrase(phrase)) {
            throw new Error('Phrase must be provided');
        }
        else {
            this._phrase = phrase;
            var newWallet = ethers.Wallet.fromMnemonic(phrase);
            this.changeWallet(newWallet);
            return true;
        }
    };
    /**
     * Validates an address
     */
    Client.validateAddress = function (address) {
        try {
            utils.getAddress(address);
            return true;
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Gets the eth balance of an address
     * @todo add start & end block parameters
     */
    Client.prototype.getBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var etherString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(address && !Client.validateAddress(address))) return [3 /*break*/, 1];
                        throw new Error('Invalid Address');
                    case 1: return [4 /*yield*/, this.wallet.provider.getBalance(address || this._address)];
                    case 2:
                        etherString = _a.sent();
                        this._balance = utils.formatEther(etherString);
                        return [2 /*return*/, this._balance];
                }
            });
        });
    };
    /**
     * Gets the erc20 asset balance of an address
     */
    Client.prototype.getERC20Balance = function (asset, address) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, erc20, etherString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (address && !Client.validateAddress(address)) {
                            throw new Error('Invalid Address');
                        }
                        if (!Client.validateAddress(asset)) {
                            throw new Error('Invalid Asset');
                        }
                        contract = new ethers.Contract(asset, erc20ABI, this.wallet);
                        erc20 = contract.connect(this.wallet);
                        return [4 /*yield*/, erc20.functions.balanceOf(address || this._address)];
                    case 1:
                        etherString = _a.sent();
                        this._balance = utils.formatEther(etherString);
                        return [2 /*return*/, this._balance];
                }
            });
        });
    };
    /**
     * Gets the current block of the network
     */
    Client.prototype.getBlockNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.wallet.provider.getBlockNumber()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Gets the transaction history of an address.
     */
    Client.prototype.getTransactions = function (address) {
        if (address === void 0) { address = this._address; }
        return __awaiter(this, void 0, void 0, function () {
            var transactions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(address && !Client.validateAddress(address))) return [3 /*break*/, 1];
                        throw new Error('Invalid Address');
                    case 1: return [4 /*yield*/, this._etherscan.getHistory(address)];
                    case 2:
                        transactions = _a.sent();
                        return [2 /*return*/, transactions];
                }
            });
        });
    };
    /**
     * Sends a transaction to the vault
     */
    Client.prototype.vaultTx = function (asset, amount, memo) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, erc20, allowance, approved, deposit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.vault) {
                            return [2 /*return*/, Promise.reject('vault has to be set before sending vault tx')];
                        }
                        if (!(asset.toString() == ethAddress)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.vault.deposit(ethers.utils.toUtf8String(memo), { value: amount })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        contract = new ethers.Contract(asset, erc20ABI, this.provider);
                        erc20 = contract.connect(this.wallet);
                        return [4 /*yield*/, erc20.allowance(this.vault.address, { from: this.wallet.address })];
                    case 3:
                        allowance = _a.sent();
                        if (!(utils.formatEther(allowance) < amount)) return [3 /*break*/, 6];
                        return [4 /*yield*/, erc20.approve(this.vault.address, amount, { from: this.wallet.address })];
                    case 4:
                        approved = _a.sent();
                        return [4 /*yield*/, approved.wait()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this.vault.deposit(asset, amount, ethers.utils.toUtf8String(memo))];
                    case 7:
                        deposit = _a.sent();
                        return [4 /*yield*/, deposit.wait()];
                    case 8: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Sends a transaction to the vault
     * @todo add from?: string, nonce: BigNumberish, gasLimit: BigNumberish, gasPrice: BigNumberish
     */
    Client.prototype.normalTx = function (addressTo, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var transactionRequest, transactionResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transactionRequest = { to: addressTo, value: amount };
                        return [4 /*yield*/, this.wallet.sendTransaction(transactionRequest)];
                    case 1:
                        transactionResponse = _a.sent();
                        return [2 /*return*/, transactionResponse];
                }
            });
        });
    };
    return Client;
}());
//# sourceMappingURL=index.js.map
