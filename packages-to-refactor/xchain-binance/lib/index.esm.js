import { BncClient } from '@binance-chain/javascript-sdk/lib/client';
import { getPrivateKeyFromMnemonic, getAddressFromPrivateKey } from '@binance-chain/javascript-sdk/lib/crypto';
import { singleFee, FeeType, Network, TxType, BaseXChainClient } from '@xchainjs/xchain-client';
import { baseAmount, assetFromString, AssetBNB, assetToBase, assetAmount, Chain, assetToString, baseToAsset } from '@xchainjs/xchain-util';
import axios from 'axios';

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

/**
 * Type guard for runtime checks of `Fee`
 *
 * @param {Fee|TransferFee|DexFees} v
 * @returns {boolean} `true` or `false`.
 */
const isFee = (v) => { var _a, _b, _c; return !!((_a = v) === null || _a === void 0 ? void 0 : _a.msg_type) && ((_b = v) === null || _b === void 0 ? void 0 : _b.fee) !== undefined && ((_c = v) === null || _c === void 0 ? void 0 : _c.fee_for) !== undefined; };
/**
 * Type guard for `TransferFee`
 *
 * @param {Fee|TransferFee|DexFees} v
 * @returns {boolean} `true` or `false`.
 */
const isTransferFee = (v) => { var _a, _b; return isFee((_a = v) === null || _a === void 0 ? void 0 : _a.fixed_fee_params) && !!((_b = v) === null || _b === void 0 ? void 0 : _b.multi_transfer_fee); };
/**
 * Type guard for `Account`
 *
 * @param {unknown} v
 * @returns {boolean} `true` or `false`.
 */
const isAccount = (v) => typeof v.account_number === 'number' &&
    typeof v.address === 'string' &&
    Array.isArray(v.balances) &&
    Array.isArray(v.public_key) &&
    typeof v.flags === 'number' &&
    typeof v.sequence === 'number';
/**
 * Get TxType
 *
 * @param {BinanceTxType} t
 * @returns {TxType} `transfer` or `unknown`.
 */
const getTxType = (t) => {
    if (t === 'TRANSFER' || t === 'DEPOSIT')
        return TxType.Transfer;
    return TxType.Unknown;
};
/**
 * Parse Tx
 *
 * @param {BinanceTx} t The transaction to be parsed. (optional)
 * @returns {Tx|null} The transaction parsed from the binance tx.
 */
const parseTx = (tx) => {
    const asset = assetFromString(`${AssetBNB.chain}.${tx.txAsset}`);
    if (!asset)
        return null;
    return {
        asset,
        from: [
            {
                from: tx.fromAddr,
                amount: assetToBase(assetAmount(tx.value, 8)),
            },
        ],
        to: [
            {
                to: tx.toAddr,
                amount: assetToBase(assetAmount(tx.value, 8)),
            },
        ],
        date: new Date(tx.timeStamp),
        type: getTxType(tx.txType),
        hash: tx.txHash,
    };
};
/**
 * Get DerivePath
 *
 * @param {number} index (optional)
 * @returns {DerivePath} The binance derivation path by the index.
 */
const getDerivePath = (index = 0) => [44, 714, 0, 0, index];
/**
 * Get the default fee.
 *
 * @returns {Fees} The default fee.
 */
const getDefaultFees = () => {
    return singleFee(FeeType.FlatFee, baseAmount(37500));
};
/**
 * Get address prefix based on the network.
 *
 * @param {Network} network
 * @returns {string} The address prefix based on the network.
 *
 **/
const getPrefix = (network) => {
    switch (network) {
        case Network.Mainnet:
        case Network.Stagenet:
            return 'bnb';
        case Network.Testnet:
            return 'tbnb';
    }
};

/**
 * Custom Binance client
 */
class Client extends BaseXChainClient {
    /**
     * Constructor
     *
     * Client has to be initialised with network type and phrase.
     * It will throw an error if an invalid phrase has been passed.
     *
     * @param {XChainClientParams} params
     *
     * @throws {"Invalid phrase"} Thrown if the given phase is invalid.
     */
    constructor(params) {
        super(Chain.Binance, params);
        this.bncClient = new BncClient(this.getClientUrl());
        this.bncClient.chooseNetwork(this.getNetwork());
    }
    /**
     * Get the BncClient interface.
     *
     * @returns {BncClient} The BncClient from `@binance-chain/javascript-sdk`.
     */
    getBncClient() {
        return this.bncClient;
    }
    /**
     * Gets the current network, and enforces type limited to
     * 'mainnet' and 'testnet', which conflicts with `xchain-client`
     *
     * Remove this once @binance-chain has stagenet support.
     * @returns {Network}
     */
    getNetwork() {
        switch (super.getNetwork()) {
            case Network.Mainnet:
            case Network.Stagenet:
                return Network.Mainnet;
            case Network.Testnet:
                return Network.Testnet;
        }
    }
    /**
     * Set/update the current network.
     *
     * @param {Network} network
     * @returns {void}
     *
     * @throws {"Network must be provided"}
     * Thrown if network has not been set before.
     */
    setNetwork(network) {
        super.setNetwork(network);
        this.bncClient = new BncClient(this.getClientUrl());
        this.bncClient.chooseNetwork(network);
    }
    /**
     * Get the client url.
     *
     * @returns {string} The client url for binance chain based on the network.
     */
    getClientUrl() {
        switch (this.getNetwork()) {
            case Network.Mainnet:
                return 'https://dex.binance.org';
            case Network.Testnet:
                return 'https://testnet-dex.binance.org';
        }
    }
    /**
     * Get the explorer url.
     *
     * @returns {string} The explorer url based on the network.
     */
    getExplorerUrl() {
        switch (this.getNetwork()) {
            case Network.Mainnet:
                return 'https://explorer.binance.org';
            case Network.Testnet:
                return 'https://testnet-explorer.binance.org';
        }
    }
    /**
     * Get the explorer url for the given address.
     *
     * @param {Address} address
     * @returns {string} The explorer url for the given address based on the network.
     */
    getExplorerAddressUrl(address) {
        return `${this.getExplorerUrl()}/address/${address}`;
    }
    /**
     * Get the explorer url for the given transaction id.
     *
     * @param {string} txID
     * @returns {string} The explorer url for the given transaction id based on the network.
     */
    getExplorerTxUrl(txID) {
        return `${this.getExplorerUrl()}/tx/${txID}`;
    }
    /**
     * @private
     * Get private key.
     *
     * @param {number} index account index for the derivation path
     * @returns {PrivKey} The privkey generated from the given phrase
     *
     * @throws {"Phrase not set"}
     * Throws an error if phrase has not been set before
     * */
    getPrivateKey(index) {
        if (!this.phrase)
            throw new Error('Phrase not set');
        return getPrivateKeyFromMnemonic(this.phrase, true, index);
    }
    /**
     * Get the current address.
     *
     * @param {number} index (optional) Account index for the derivation path
     * @returns {Address} The current address.
     *
     * @throws {Error} Thrown if phrase has not been set before. A phrase is needed to create a wallet and to derive an address from it.
     */
    getAddress(index = 0) {
        return getAddressFromPrivateKey(this.getPrivateKey(index), getPrefix(this.network));
    }
    /**
     * Validate the given address.
     *
     * @param {Address} address
     * @returns {boolean} `true` or `false`
     */
    validateAddress(address) {
        return this.bncClient.checkAddress(address, getPrefix(this.network));
    }
    /**
     * Get account data of wallets or by given address.
     *
     * @param {Address} address (optional) By default, it will return account data of current wallet.
     * @param {number} index (optional) Account index for the derivation path
     *
     * @returns {Account} account details of given address.
     */
    getAccount(address, index = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountAddress = address || this.getAddress(index);
            const response = yield this.bncClient.getAccount(accountAddress);
            if (!response || !response.result || !isAccount(response.result))
                return Promise.reject(Error(`Could not get account data for address ${accountAddress}`));
            return response.result;
        });
    }
    /**
     * Get the balance of a given address.
     *
     * @param {Address} address By default, it will return the balance of the current wallet. (optional)
     * @param {Asset} asset If not set, it will return all assets available. (optional)
     * @returns {Balance[]} The balance of the address.
     */
    getBalance(address, assets) {
        return __awaiter(this, void 0, void 0, function* () {
            const balances = yield this.bncClient.getBalance(address);
            return balances
                .map((balance) => {
                return {
                    asset: assetFromString(`${Chain.Binance}.${balance.symbol}`) || AssetBNB,
                    amount: assetToBase(assetAmount(balance.free, 8)),
                };
            })
                .filter((balance) => !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length);
        });
    }
    /**
     * @private
     * Search transactions with parameters.
     *
     * @returns {Params} The parameters to be used for transaction search.
     * */
    searchTransactions(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientUrl = `${this.getClientUrl()}/api/v1/transactions`;
            const url = new URL(clientUrl);
            const endTime = Date.now();
            const diffTime = 90 * 24 * 60 * 60 * 1000;
            url.searchParams.set('endTime', endTime.toString());
            url.searchParams.set('startTime', (endTime - diffTime).toString());
            for (const key in params) {
                const value = params[key];
                if (value) {
                    url.searchParams.set(key, value);
                    if (key === 'startTime' && !params['endTime']) {
                        url.searchParams.set('endTime', (parseInt(value) + diffTime).toString());
                    }
                    if (key === 'endTime' && !params['startTime']) {
                        url.searchParams.set('startTime', (parseInt(value) - diffTime).toString());
                    }
                }
            }
            const txHistory = (yield axios.get(url.toString())).data;
            return {
                total: txHistory.total,
                txs: txHistory.tx.map(parseTx).filter(Boolean),
            };
        });
    }
    /**
     * Get transaction history of a given address with pagination options.
     * By default it will return the transaction history of the current wallet.
     *
     * @param {TxHistoryParams} params The options to get transaction history. (optional)
     * @returns {TxsPage} The transaction history.
     */
    getTransactions(params) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.searchTransactions({
                address: params && params.address,
                limit: params && ((_a = params.limit) === null || _a === void 0 ? void 0 : _a.toString()),
                offset: params && ((_b = params.offset) === null || _b === void 0 ? void 0 : _b.toString()),
                startTime: params && params.startTime && params.startTime.getTime().toString(),
                txAsset: params && params.asset,
            });
        });
    }
    /**
     * Get the transaction details of a given transaction id.
     *
     * @param {string} txId The transaction id.
     * @returns {Tx} The transaction details of the given transaction id.
     */
    getTransactionData(txId) {
        return __awaiter(this, void 0, void 0, function* () {
            const txResult = (yield axios.get(`${this.getClientUrl()}/api/v1/tx/${txId}?format=json`)).data;
            const blockHeight = txResult.height;
            let address = '';
            const msgs = txResult.tx.value.msg;
            if (msgs.length) {
                const msg = msgs[0].value;
                if (msg.inputs && msg.inputs.length) {
                    address = msg.inputs[0].address;
                }
                else if (msg.outputs && msg.outputs.length) {
                    address = msg.outputs[0].address;
                }
            }
            const txHistory = yield this.searchTransactions({ address, blockHeight });
            const [transaction] = txHistory.txs.filter((tx) => tx.hash === txId);
            if (!transaction) {
                throw new Error('transaction not found');
            }
            return transaction;
        });
    }
    /**
     * Broadcast multi-send transaction.
     *
     * @param {MultiSendParams} params The multi-send transfer options.
     * @returns {TxHash} The transaction hash.
     */
    multiSend({ walletIndex = 0, transactions, memo = '' }) {
        return __awaiter(this, void 0, void 0, function* () {
            const derivedAddress = this.getAddress(walletIndex);
            yield this.bncClient.initChain();
            yield this.bncClient.setPrivateKey(this.getPrivateKey(walletIndex));
            const transferResult = yield this.bncClient.multiSend(derivedAddress, transactions.map((transaction) => {
                return {
                    to: transaction.to,
                    coins: transaction.coins.map((coin) => {
                        return {
                            denom: coin.asset.symbol,
                            amount: baseToAsset(coin.amount).amount().toString(),
                        };
                    }),
                };
            }), memo);
            return transferResult.result.map((txResult) => { var _a; return (_a = txResult === null || txResult === void 0 ? void 0 : txResult.hash) !== null && _a !== void 0 ? _a : ''; })[0];
        });
    }
    /**
     * Transfer balances.
     *
     * @param {TxParams} params The transfer options.
     * @returns {TxHash} The transaction hash.
     */
    transfer({ walletIndex, asset, amount, recipient, memo }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.bncClient.initChain();
            yield this.bncClient.setPrivateKey(this.getPrivateKey(walletIndex || 0));
            const transferResult = yield this.bncClient.transfer(this.getAddress(walletIndex), recipient, baseToAsset(amount).amount().toString(), asset ? asset.symbol : AssetBNB.symbol, memo);
            return transferResult.result.map((txResult) => { var _a; return (_a = txResult === null || txResult === void 0 ? void 0 : txResult.hash) !== null && _a !== void 0 ? _a : ''; })[0];
        });
    }
    /**
     * Get the current transfer fee.
     *
     * @returns {TransferFee} The current transfer fee.
     */
    getTransferFee() {
        return __awaiter(this, void 0, void 0, function* () {
            const feesArray = (yield axios.get(`${this.getClientUrl()}/api/v1/fees`)).data;
            const [transferFee] = feesArray.filter(isTransferFee);
            if (!transferFee)
                throw new Error('failed to get transfer fees');
            return transferFee;
        });
    }
    /**
     * Get the current fee.
     *
     * @returns {Fees} The current fee.
     */
    getFees() {
        return __awaiter(this, void 0, void 0, function* () {
            let singleTxFee = undefined;
            try {
                singleTxFee = baseAmount(yield this.getFeeRateFromThorchain());
            }
            catch (error) {
                console.log(error);
                console.warn(`Error pulling rates from thorchain, will try alternate`);
            }
            if (!singleTxFee) {
                const transferFee = yield this.getTransferFee();
                singleTxFee = baseAmount(transferFee.fixed_fee_params.fee);
            }
            return singleFee(FeeType.FlatFee, singleTxFee);
        });
    }
    /**
     * Get the current fee for multi-send transaction.
     *
     * @returns {Fees} The current fee for multi-send transaction.
     */
    getMultiSendFees() {
        return __awaiter(this, void 0, void 0, function* () {
            const transferFee = yield this.getTransferFee();
            const multiTxFee = baseAmount(transferFee.multi_transfer_fee);
            return {
                type: 'base',
                average: multiTxFee,
                fast: multiTxFee,
                fastest: multiTxFee,
            };
        });
    }
    /**
     * Get the current fee for both single and multi-send transaction.
     *
     * @returns {SingleAndMultiFees} The current fee for both single and multi-send transaction.
     */
    getSingleAndMultiFees() {
        return __awaiter(this, void 0, void 0, function* () {
            const transferFee = yield this.getTransferFee();
            const singleTxFee = baseAmount(transferFee.fixed_fee_params.fee);
            const multiTxFee = baseAmount(transferFee.multi_transfer_fee);
            return {
                single: {
                    type: 'base',
                    fast: singleTxFee,
                    fastest: singleTxFee,
                    average: singleTxFee,
                },
                multi: {
                    type: 'base',
                    average: multiTxFee,
                    fast: multiTxFee,
                    fastest: multiTxFee,
                },
            };
        });
    }
}

/**
 * Order status as part of an order
 * See description of Order.status for more detail https://docs.binance.org/api-reference/dex-api/paths.html#order
 */
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Ack"] = "Ack";
    OrderStatus["PartialFill"] = "PartialFill";
    OrderStatus["IocNoFill"] = "IocNoFill";
    OrderStatus["FullyFill"] = "FullyFill";
    OrderStatus["Canceled"] = "Canceled";
    OrderStatus["Expired"] = "Expired";
    OrderStatus["FailedBlocking"] = "FailedBlocking";
    OrderStatus["FailedMatching"] = "FailedMatching";
    OrderStatus["IocExpire"] = "IocExpire";
})(OrderStatus || (OrderStatus = {}));

/**
 * Type definitions for data of Binance WebSocket Streams
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html
 *
 */
/**
 * Taker (as part of {@link Trade})
 */
var Taker;
(function (Taker) {
    Taker[Taker["UNKNOWN"] = 0] = "UNKNOWN";
    Taker[Taker["SELL_TAKER"] = 1] = "SELL_TAKER";
    Taker[Taker["BUY_TAKER"] = 2] = "BUY_TAKER";
    Taker[Taker["BUY_SURPLUS"] = 3] = "BUY_SURPLUS";
    Taker[Taker["SELL_SURPLUS"] = 4] = "SELL_SURPLUS";
    Taker[Taker["NEUTRAL"] = 5] = "NEUTRAL";
})(Taker || (Taker = {}));

var binanceWs = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get Taker () { return Taker; }
});

export { Client, OrderStatus, binanceWs as WS, getDefaultFees, getDerivePath, getPrefix };
