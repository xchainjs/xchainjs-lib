'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var terra_js = require('@terra-money/terra.js');
var xchainClient = require('@xchainjs/xchain-client');
var xchainUtil = require('@xchainjs/xchain-util');
var axios = require('axios');
var lib = require('@xchainjs/xchain-util/lib');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);

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

const TERRA_DECIMAL = 6; // 10^6

(function (TerraNativeAsset) {
    TerraNativeAsset["LUNA"] = "LUNA";
    TerraNativeAsset["SDT"] = "SDT";
    TerraNativeAsset["UST"] = "UST";
    TerraNativeAsset["KRT"] = "KRT";
    TerraNativeAsset["MNT"] = "MNT";
    TerraNativeAsset["EUT"] = "EUT";
    TerraNativeAsset["CNT"] = "CNT";
    TerraNativeAsset["JPT"] = "JPT";
    TerraNativeAsset["GBT"] = "GBT";
    TerraNativeAsset["INT"] = "INT";
    TerraNativeAsset["CAT"] = "CAT";
    TerraNativeAsset["CHT"] = "CHT";
    TerraNativeAsset["AUT"] = "AUT";
    TerraNativeAsset["SGT"] = "SGT";
    TerraNativeAsset["TBT"] = "TBT";
    TerraNativeAsset["SET"] = "SET";
    TerraNativeAsset["NOT"] = "NOT";
    TerraNativeAsset["DKT"] = "DKT";
    TerraNativeAsset["IDT"] = "IDT";
    TerraNativeAsset["PHT"] = "PHT";
    TerraNativeAsset["HKT"] = "HKT";
    TerraNativeAsset["MYT"] = "MYT";
    TerraNativeAsset["TWT"] = "TWT";
})(exports.TerraNativeAsset || (exports.TerraNativeAsset = {}));
/**
 * Type guard to check whether string is a valid `TerraNativeAsset`
 *
 * @param {string} denom Denomination.
 * @returns {boolean} `true` or `false`
 */
const isTerraNativeAsset = (denom) => Object.values(exports.TerraNativeAsset).includes(denom);
const DENOM_MAP = {
    LUNA: 'uluna',
    SDT: 'usdr',
    UST: 'uusd',
    KRT: 'ukrw',
    MNT: 'umnt',
    EUT: 'ueur',
    CNT: 'ucny',
    JPT: 'ujpy',
    GBT: 'ugbp',
    INT: 'uinr',
    CAT: 'ucad',
    CHT: 'uchf',
    AUT: 'uaud',
    SGT: 'usgd',
    TBT: 'uthb',
    SET: 'usek',
    NOT: 'unok',
    DKT: 'udkk',
    IDT: 'uidr',
    PHT: 'uphp',
    HKT: 'uhkd',
    MYT: 'umyr',
    TWT: 'utwd',
};
const isTerraAsset = ({ chain, symbol, ticker, synth }) => chain === lib.Chain.Terra && isTerraNativeAsset(symbol) && isTerraNativeAsset(ticker) && !synth;
const getTerraMicroDenom = (assetDenom) => isTerraNativeAsset(assetDenom) ? DENOM_MAP[assetDenom] : null;

const DEFAULT_CONFIG = {
    [xchainClient.Network.Mainnet]: {
        explorerURL: 'https://finder.terra.money/mainnet',
        explorerAddressURL: 'https://finder.terra.money/mainnet/address/',
        explorerTxURL: 'https://finder.terra.money/mainnet/tx/',
        cosmosAPIURL: 'https://fcd.terra.dev',
        ChainID: 'columbus-5',
    },
    [xchainClient.Network.Stagenet]: {
        explorerURL: 'https://finder.terra.money/mainnet',
        explorerAddressURL: 'https://finder.terra.money/mainnet/address/',
        explorerTxURL: 'https://finder.terra.money/mainnet/tx/',
        cosmosAPIURL: 'https://fcd.terra.dev',
        ChainID: 'columbus-5',
    },
    [xchainClient.Network.Testnet]: {
        explorerURL: 'https://finder.terra.money/testnet',
        explorerAddressURL: 'https://finder.terra.money/testnet/address/',
        explorerTxURL: 'https://finder.terra.money/testnet/tx/',
        cosmosAPIURL: 'https://bombay-fcd.terra.dev',
        ChainID: 'bombay-12',
    },
};
/**
 * Terra Client
 */
class Client extends xchainClient.BaseXChainClient {
    constructor({ network = xchainClient.Network.Testnet, phrase, rootDerivationPaths = {
        [xchainClient.Network.Mainnet]: "44'/330'/0'/0/",
        [xchainClient.Network.Stagenet]: "44'/330'/0'/0/",
        [xchainClient.Network.Testnet]: "44'/330'/0'/0/",
    }, explorerURL, explorerAddressURL, explorerTxURL, cosmosAPIURL, ChainID, }) {
        super(xchainUtil.Chain.Terra, { network, rootDerivationPaths, phrase });
        this.config = Object.assign(Object.assign({}, DEFAULT_CONFIG), { explorerURL, explorerAddressURL, explorerTxURL, cosmosAPIURL, ChainID });
        this.lcdClient = new terra_js.LCDClient({
            URL: this.config[this.network].cosmosAPIURL,
            chainID: this.config[this.network].ChainID,
        });
    }
    getFees() {
        return __awaiter(this, void 0, void 0, function* () {
            const feesArray = (yield axios__default['default'].get(`${this.config[this.network].cosmosAPIURL}/v1/txs/gas_prices`)).data;
            const baseFeeInLuna = xchainUtil.baseAmount(feesArray['uluna'], TERRA_DECIMAL);
            return {
                type: xchainClient.FeeType.FlatFee,
                average: baseFeeInLuna,
                fast: baseFeeInLuna,
                fastest: baseFeeInLuna,
            };
        });
    }
    getAddress(walletIndex = 0) {
        const mnemonicKey = new terra_js.MnemonicKey({ mnemonic: this.phrase, index: walletIndex });
        return mnemonicKey.accAddress;
    }
    getExplorerUrl() {
        return this.config[this.network].explorerURL;
    }
    getExplorerAddressUrl(address) {
        return this.config[this.network].explorerAddressURL + (address === null || address === void 0 ? void 0 : address.toLowerCase());
    }
    getExplorerTxUrl(txID) {
        return this.config[this.network].explorerAddressURL + (txID === null || txID === void 0 ? void 0 : txID.toLowerCase());
    }
    validateAddress(address) {
        return terra_js.AccAddress.validate(address);
    }
    getBalance(address, assets) {
        return __awaiter(this, void 0, void 0, function* () {
            let balances = [];
            let [coins, pagination] = yield this.lcdClient.bank.balance(address);
            balances = balances.concat(this.coinsToBalances(coins));
            while (pagination.next_key) {
                [coins, pagination] = yield this.lcdClient.bank.balance(address, { 'pagination.offset': pagination.next_key });
                balances = balances.concat(this.coinsToBalances(coins));
            }
            if (assets) {
                //filter out only the assets the user wants to see
                return balances.filter((bal) => {
                    const exists = assets.find((asset) => asset.symbol === bal.asset.symbol);
                    return exists !== undefined;
                });
            }
            else {
                return balances;
            }
        });
    }
    setNetwork(network) {
        super.setNetwork(network);
        this.lcdClient = new terra_js.LCDClient({
            URL: this.config[this.network].cosmosAPIURL,
            chainID: this.config[this.network].ChainID,
        });
    }
    getTransactions(params) {
        return __awaiter(this, void 0, void 0, function* () {
            //TODO filter by start time?
            //TODO filter by asset
            const address = (params === null || params === void 0 ? void 0 : params.address) || this.getAddress();
            const offset = (params === null || params === void 0 ? void 0 : params.offset) ? `${params === null || params === void 0 ? void 0 : params.offset}` : '0';
            const limit = (params === null || params === void 0 ? void 0 : params.limit) ? `${params === null || params === void 0 ? void 0 : params.limit}` : '100';
            const results = (yield axios__default['default'].get(`${this.config[this.network].cosmosAPIURL}/v1/txs?offset=${offset}&limit=${limit}&account=${address}`)).data;
            const txs = results.txs.map((tx) => this.convertSearchResultTxToTx(tx));
            return {
                total: results.txs.length,
                txs,
            };
        });
    }
    getTransactionData(txId) {
        return __awaiter(this, void 0, void 0, function* () {
            const txInfo = yield this.lcdClient.tx.txInfo(txId.toUpperCase());
            return this.convertTxInfoToTx(txInfo);
        });
    }
    transfer({ walletIndex = 0, asset = xchainUtil.AssetLUNA, amount, recipient, memo }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.validateAddress(recipient))
                throw new Error(`${recipient} is not a valid terra address`);
            const terraMicroDenom = getTerraMicroDenom(asset.symbol);
            if (!terraMicroDenom)
                throw new Error(`${xchainUtil.assetToString(asset)} is not a valid terra chain asset`);
            const mnemonicKey = new terra_js.MnemonicKey({ mnemonic: this.phrase, index: walletIndex });
            const wallet = this.lcdClient.wallet(mnemonicKey);
            const amountToSend = {
                [terraMicroDenom]: `${amount.amount().toFixed()}`,
            };
            const send = new terra_js.MsgSend(wallet.key.accAddress, recipient, amountToSend);
            const tx = yield wallet.createAndSignTx({ msgs: [send], memo });
            const result = yield this.lcdClient.tx.broadcast(tx);
            return result.txhash;
        });
    }
    getTerraNativeAsset(denom) {
        if (denom.toLowerCase().includes('luna')) {
            return xchainUtil.AssetLUNA;
        }
        else {
            // native coins other than luna, UST, KRT, etc
            // NOTE: https://docs.terra.money/docs/develop/module-specifications/README.html#currency-denominations
            const standardDenom = denom.toUpperCase().slice(1, 3) + 'T';
            return {
                chain: xchainUtil.Chain.Terra,
                symbol: standardDenom,
                ticker: standardDenom,
                synth: false,
            };
        }
    }
    coinsToBalances(coins) {
        return coins.toArray().map((c) => {
            return {
                asset: this.getTerraNativeAsset(c.denom),
                amount: xchainUtil.baseAmount(c.amount.toFixed(), TERRA_DECIMAL),
            };
        });
    }
    convertSearchResultTxToTx(tx) {
        let from = [];
        let to = [];
        tx.tx.value.msg.forEach((msg) => {
            if (msg.type === 'bank/MsgSend') {
                const xfers = this.convertMsgSend(terra_js.MsgSend.fromAmino(msg));
                from = from.concat(xfers.from);
                to = to.concat(xfers.to);
            }
            else if (msg.type === 'bank/MsgMultiSend') {
                const xfers = this.convertMsgMultiSend(terra_js.MsgMultiSend.fromAmino(msg));
                from = from.concat(xfers.from);
                to = to.concat(xfers.to);
            }
        });
        return {
            // NOTE: since multiple assettypes can be xfered in one tx, this asset should not really exist
            // TODO we should consider refactoring xchain-client.Tx to remove the top level Asset...
            asset: {
                chain: xchainUtil.Chain.Terra,
                symbol: '',
                ticker: '',
                synth: false,
            },
            from,
            to,
            date: new Date(tx.timestamp),
            type: xchainClient.TxType.Transfer,
            hash: tx.txhash,
        };
    }
    convertTxInfoToTx(txInfo) {
        let from = [];
        let to = [];
        txInfo.tx.body.messages.forEach((msg) => {
            const msgObject = JSON.parse(msg.toJSON());
            if (msgObject['@type'] === '/cosmos.bank.v1beta1.MsgSend') {
                const xfers = this.convertMsgSend(msg);
                from = from.concat(xfers.from);
                to = to.concat(xfers.to);
            }
            else if (msgObject['@type'] === '/cosmos.bank.v1beta1.MsgMultiSend') {
                const xfers = this.convertMsgMultiSend(msg);
                from = from.concat(xfers.from);
                to = to.concat(xfers.to);
            }
        });
        return {
            // NOTE: since multiple assettypes can be xfered in one tx, this asset should not really exist
            // TODO we should consider refactoring xchain-client.Tx to remove the top level Asset...
            asset: {
                chain: xchainUtil.Chain.Terra,
                symbol: '',
                ticker: '',
                synth: false,
            },
            from,
            to,
            date: new Date(txInfo.timestamp),
            type: xchainClient.TxType.Transfer,
            hash: txInfo.txhash,
        };
    }
    convertMsgSend(msgSend) {
        const from = [];
        const to = [];
        msgSend.amount.toArray().forEach((coin) => {
            //ensure this is in base units ex uluna, uusd
            const baseCoin = coin.toIntCoin();
            const asset = this.getTerraNativeAsset(baseCoin.denom);
            const amount = xchainUtil.baseAmount(baseCoin.amount.toFixed(), TERRA_DECIMAL);
            if (asset) {
                // NOTE: this will only populate native terra Assets
                from.push({
                    from: msgSend.from_address,
                    amount,
                    asset,
                });
                to.push({
                    to: msgSend.to_address,
                    amount,
                    asset,
                });
            }
        });
        return { from, to };
    }
    convertMsgMultiSend(msgMultiSend) {
        const from = [];
        const to = [];
        msgMultiSend.inputs.forEach((input) => {
            input.coins.toArray().forEach((coin) => {
                //ensure this is in base units ex uluna, uusd
                const baseCoin = coin.toIntCoin();
                const asset = this.getTerraNativeAsset(baseCoin.denom);
                const amount = xchainUtil.baseAmount(baseCoin.amount.toFixed(), TERRA_DECIMAL);
                if (asset) {
                    // NOTE: this will only populate native terra Assets
                    from.push({
                        from: input.address,
                        amount,
                        asset,
                    });
                }
            });
        });
        msgMultiSend.outputs.forEach((output) => {
            output.coins.toArray().forEach((coin) => {
                //ensure this is in base units ex uluna, uusd
                const baseCoin = coin.toIntCoin();
                const asset = this.getTerraNativeAsset(baseCoin.denom);
                const amount = xchainUtil.baseAmount(baseCoin.amount.toFixed(), TERRA_DECIMAL);
                if (asset) {
                    // NOTE: this will only populate native terra Assets
                    to.push({
                        to: output.address,
                        amount,
                        asset,
                    });
                }
            });
        });
        return { from, to };
    }
}

exports.Client = Client;
exports.TERRA_DECIMAL = TERRA_DECIMAL;
exports.getTerraMicroDenom = getTerraMicroDenom;
exports.isTerraAsset = isTerraAsset;
