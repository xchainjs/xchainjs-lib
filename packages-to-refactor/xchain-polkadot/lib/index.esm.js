import { Keyring, ApiPromise, WsProvider } from '@polkadot/api';
import { isHex, hexToU8a } from '@polkadot/util';
import { Network, singleFee, FeeType, TxType } from '@xchainjs/xchain-client';
import { validatePhrase } from '@xchainjs/xchain-crypto';
import { Chain, assetToBase, assetAmount, assetToString, baseAmount } from '@xchainjs/xchain-util';
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

const AssetDOT = { chain: Chain.Polkadot, symbol: 'DOT', ticker: 'DOT', synth: false };

/**
 * Check Subscan API response
 *
 * @param {SubscanResponse} response The subscan response.
 * @returns {boolean} `true` or `false`
 */
const isSuccess = (response) => !response.code;
/**
 * Get the decimal based on the network
 *
 * @param {Network} network The network.
 * @returns {number} The decimal based on the network.
 */
const getDecimal = (network) => {
    switch (network) {
        case Network.Mainnet:
        case Network.Stagenet:
            return 10;
        case Network.Testnet:
            return 12;
    }
};
/**
 * Get the default fees.
 *
 * @returns {Fees} The default fees based on the network.
 */
const getDefaultFees = (network) => {
    const fee = assetToBase(assetAmount(0.015, getDecimal(network)));
    return singleFee(FeeType.PerByte, fee);
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
            return '1';
        case Network.Testnet:
            return '5';
    }
};

/**
 * Custom Polkadot client
 */
class Client {
    /**
     * Constructor
     * Client is initialised with network type and phrase (optional)
     *
     * @param {XChainClientParams} params
     */
    constructor({ network = Network.Testnet, phrase, rootDerivationPaths = {
        [Network.Mainnet]: "44//354//0//0//0'",
        [Network.Testnet]: "44//354//0//0//0'",
        [Network.Stagenet]: "44//354//0//0//0'",
    }, }) {
        this.phrase = '';
        this.network = network;
        this.rootDerivationPaths = rootDerivationPaths;
        if (phrase)
            this.setPhrase(phrase);
    }
    /**
     * Get getFullDerivationPath
     *
     * @param {number} index the HD wallet index
     * @returns {string} The polkadot derivation path based on the network.
     */
    getFullDerivationPath(index = 0) {
        // console.log(this.rootDerivationPaths[this.network])
        if (index === 0) {
            // this should make the tests backwards compatible
            return this.rootDerivationPaths[this.network];
        }
        else {
            return this.rootDerivationPaths[this.network] + `//${index}`;
        }
    }
    /**
     * Purge client.
     *
     * @returns {void}
     */
    purgeClient() {
        this.phrase = '';
    }
    /**
     * Set/update the current network.
     *
     * @param {Network} network
     *
     * @throws {"Network must be provided"}
     * Thrown if network has not been set before.
     */
    setNetwork(network) {
        if (!network) {
            throw new Error('Network must be provided');
        }
        else {
            if (network !== this.network) {
                this.network = network;
            }
        }
    }
    /**
     * Get the current network.
     *
     * @returns {Network}
     */
    getNetwork() {
        return this.network;
    }
    /**
     * Get the client url.
     *
     * @returns {string} The client url based on the network.
     */
    getClientUrl() {
        switch (this.network) {
            case Network.Mainnet:
            case Network.Stagenet:
                return 'https://polkadot.subscan.io';
            case Network.Testnet:
                return 'https://westend.subscan.io';
        }
    }
    /**
     * Get the client WebSocket url.
     *
     * @returns {string} The client WebSocket url based on the network.
     */
    getWsEndpoint() {
        switch (this.network) {
            case Network.Mainnet:
            case Network.Stagenet:
                return 'wss://rpc.polkadot.io';
            case Network.Testnet:
                return 'wss://westend-rpc.polkadot.io';
        }
    }
    /**
     * Get the explorer url.
     *
     * @returns {string} The explorer url based on the network.
     */
    getExplorerUrl() {
        switch (this.network) {
            case Network.Mainnet:
            case Network.Stagenet:
                return 'https://polkadot.subscan.io';
            case Network.Testnet:
                return 'https://westend.subscan.io';
        }
    }
    /**
     * Get the explorer url for the given address.
     *
     * @param {Address} address
     * @returns {string} The explorer url for the given address based on the network.
     */
    getExplorerAddressUrl(address) {
        return `${this.getExplorerUrl()}/account/${address}`;
    }
    /**
     * Get the explorer url for the given transaction id.
     *
     * @param {string} txID The transaction id
     * @returns {string} The explorer url for the given transaction id based on the network.
     */
    getExplorerTxUrl(txID) {
        return `${this.getExplorerUrl()}/extrinsic/${txID}`;
    }
    /**
     * Get the SS58 format to be used for Polkadot Keyring.
     *
     * @returns {number} The SS58 format based on the network.
     */
    getSS58Format() {
        switch (this.network) {
            case Network.Mainnet:
            case Network.Stagenet:
                return 0;
            case Network.Testnet:
                return 42;
        }
    }
    /**
     * Set/update a new phrase.
     *
     * @param {string} phrase A new phrase.
     * @returns {Address} The address from the given phrase
     *
     * @throws {"Invalid phrase"}
     * Thrown if the given phase is invalid.
     */
    setPhrase(phrase, walletIndex = 0) {
        if (this.phrase !== phrase) {
            if (!validatePhrase(phrase)) {
                throw new Error('Invalid phrase');
            }
            this.phrase = phrase;
        }
        return this.getAddress(walletIndex);
    }
    /**
     * @private
     * Private function to get Keyring pair for polkadotjs provider.
     * @see https://polkadot.js.org/docs/api/start/keyring/#creating-a-keyring-instance
     *
     * @returns {KeyringPair} The keyring pair to be used to generate wallet address.
     * */
    getKeyringPair(index) {
        const key = new Keyring({ ss58Format: this.getSS58Format(), type: 'ed25519' });
        return key.createFromUri(`${this.phrase}//${this.getFullDerivationPath(index)}`);
    }
    /**
     * @private
     * Private function to get the polkadotjs API provider.
     *
     * @see https://polkadot.js.org/docs/api/start/create#api-instance
     *
     * @returns {ApiPromise} The polkadotjs API provider based on the network.
     * */
    getAPI() {
        return __awaiter(this, void 0, void 0, function* () {
            const api = new ApiPromise({ provider: new WsProvider(this.getWsEndpoint()) });
            yield api.isReady;
            if (!api.isConnected)
                yield api.connect();
            return api;
        });
    }
    /**
     * Validate the given address.
     * @see https://polkadot.js.org/docs/util-crypto/examples/validate-address
     *
     * @param {Address} address
     * @returns {boolean} `true` or `false`
     */
    validateAddress(address) {
        try {
            const key = new Keyring({ ss58Format: this.getSS58Format(), type: 'ed25519' });
            return key.encodeAddress(isHex(address) ? hexToU8a(address) : key.decodeAddress(address)) === address;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get the current address.
     *
     * Generates a network-specific key-pair by first converting the buffer to a Wallet-Import-Format (WIF)
     * The address is then decoded into type P2WPKH and returned.
     *
     * @returns {Address} The current address.
     *
     * @throws {"Address not defined"} Thrown if failed creating account from phrase.
     */
    getAddress(index = 0) {
        return this.getKeyringPair(index).address;
    }
    /**
     * Get the DOT balance of a given address.
     *
     * @param {Address} address By default, it will return the balance of the current wallet. (optional)
     * @returns {Balance[]} The DOT balance of the address.
     */
    getBalance(address, assets) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = (yield axios.post(`${this.getClientUrl()}/api/open/account`, { address: address || this.getAddress() })).data;
            if (!isSuccess(response))
                throw new Error('Invalid address');
            const account = response.data;
            return account && (!assets || assets.filter((asset) => assetToString(AssetDOT) === assetToString(asset)).length)
                ? [
                    {
                        asset: AssetDOT,
                        amount: assetToBase(assetAmount(account.balance, getDecimal(this.network))),
                    },
                ]
                : [];
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
            const limit = (_a = params === null || params === void 0 ? void 0 : params.limit) !== null && _a !== void 0 ? _a : 10;
            const offset = (_b = params === null || params === void 0 ? void 0 : params.offset) !== null && _b !== void 0 ? _b : 0;
            const response = (yield axios.post(`${this.getClientUrl()}/api/scan/transfers`, {
                address: params === null || params === void 0 ? void 0 : params.address,
                row: limit,
                page: offset,
            })).data;
            if (!isSuccess(response) || !response.data)
                throw new Error('Failed to get transactions');
            const transferResult = response.data;
            return {
                total: transferResult.count,
                txs: (transferResult.transfers || []).map((transfer) => ({
                    asset: AssetDOT,
                    from: [
                        {
                            from: transfer.from,
                            amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.network))),
                        },
                    ],
                    to: [
                        {
                            to: transfer.to,
                            amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.network))),
                        },
                    ],
                    date: new Date(transfer.block_timestamp * 1000),
                    type: TxType.Transfer,
                    hash: transfer.hash,
                })),
            };
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
            const response = (yield axios.post(`${this.getClientUrl()}/api/scan/extrinsic`, { hash: txId })).data;
            if (!isSuccess(response) || !response.data)
                throw new Error('Failed to get transactions');
            const extrinsic = response.data;
            const transfer = extrinsic.transfer;
            return {
                asset: AssetDOT,
                from: [
                    {
                        from: transfer.from,
                        amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.network))),
                    },
                ],
                to: [
                    {
                        to: transfer.to,
                        amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.network))),
                    },
                ],
                date: new Date(extrinsic.block_timestamp * 1000),
                type: TxType.Transfer,
                hash: extrinsic.extrinsic_hash,
            };
        });
    }
    /**
     * Transfer DOT.
     *
     * @param {TxParams} params The transfer options.
     * @returns {TxHash} The transaction hash.
     */
    transfer(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const api = yield this.getAPI();
            let transaction = null;
            const walletIndex = params.walletIndex || 0;
            // Creating a transfer
            const transfer = api.tx.balances.transfer(params.recipient, params.amount.amount().toString());
            if (!params.memo) {
                // Send a simple transfer
                transaction = transfer;
            }
            else {
                // Send a `utility.batch` with two Calls: i) Balance.Transfer ii) System.Remark
                // Creating a remark
                const remark = api.tx.system.remark(params.memo);
                // Send the Batch Transaction
                transaction = api.tx.utility.batch([transfer, remark]);
            }
            // Check balances
            const paymentInfo = yield transaction.paymentInfo(this.getKeyringPair(walletIndex));
            const fee = baseAmount(paymentInfo.partialFee.toString(), getDecimal(this.network));
            const balances = yield this.getBalance(this.getAddress(walletIndex), [AssetDOT]);
            if (!balances || params.amount.amount().plus(fee.amount()).isGreaterThan(balances[0].amount.amount())) {
                throw new Error('insufficient balance');
            }
            const txHash = yield transaction.signAndSend(this.getKeyringPair(walletIndex));
            yield api.disconnect();
            return txHash.toString();
        });
    }
    /**
     * Get the current fee with transfer options.
     *
     * @see https://polkadot.js.org/docs/api/cookbook/tx/#how-do-i-estimate-the-transaction-fees
     *
     * @param {TxParams} params The transfer options.
     * @returns {Fees} The estimated fees with the transfer options.
     */
    estimateFees(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const walletIndex = params.walletIndex ? params.walletIndex : 0;
            const api = yield this.getAPI();
            const info = yield api.tx.balances
                .transfer(params.recipient, params.amount.amount().toNumber())
                .paymentInfo(this.getKeyringPair(walletIndex));
            const fee = baseAmount(info.partialFee.toString(), getDecimal(this.network));
            yield api.disconnect();
            return singleFee(FeeType.PerByte, fee);
        });
    }
    /**
     * Get the current fee.
     *
     * @returns {Fees} The current fee.
     */
    getFees() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.estimateFees({
                recipient: this.getAddress(),
                amount: baseAmount(0, getDecimal(this.network)),
            });
        });
    }
}

export { AssetDOT, Client, getDecimal, getDefaultFees, getPrefix, isSuccess };
