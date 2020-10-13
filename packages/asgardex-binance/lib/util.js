"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTxType = exports.isDexFees = exports.isTransferFee = exports.isFreezeFee = exports.isFee = exports.getTxHashFromMemo = exports.getHashFromTransfer = void 0;
/**
 * Get `hash` from transfer event sent by Binance chain
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 */
exports.getHashFromTransfer = function (transfer) { var _a; return (_a = transfer === null || transfer === void 0 ? void 0 : transfer.data) === null || _a === void 0 ? void 0 : _a.H; };
/**
 * Get `hash` from memo
 */
exports.getTxHashFromMemo = function (transfer) { var _a; return (_a = transfer === null || transfer === void 0 ? void 0 : transfer.data) === null || _a === void 0 ? void 0 : _a.M.split(':')[1]; };
/**
 * Type guard for runtime checks of `Fee`
 */
exports.isFee = function (v) { var _a, _b, _c; return !!((_a = v) === null || _a === void 0 ? void 0 : _a.msg_type) && ((_b = v) === null || _b === void 0 ? void 0 : _b.fee) !== undefined && ((_c = v) === null || _c === void 0 ? void 0 : _c.fee_for) !== undefined; };
/**
 * Type guard for `FreezeFee`
 */
exports.isFreezeFee = function (v) { var _a; return ((_a = v) === null || _a === void 0 ? void 0 : _a.msg_type) === 'tokensFreeze'; };
/**
 * Type guard for `TransferFee`
 */
exports.isTransferFee = function (v) { var _a, _b; return exports.isFee((_a = v) === null || _a === void 0 ? void 0 : _a.fixed_fee_params) && !!((_b = v) === null || _b === void 0 ? void 0 : _b.multi_transfer_fee); };
/**
 * Type guard for `DexFees`
 */
exports.isDexFees = function (v) { var _a, _b; return ((_b = (_a = v) === null || _a === void 0 ? void 0 : _a.dex_fee_fields) === null || _b === void 0 ? void 0 : _b.length) > 0; };
/**
 * Get TxType
 */
exports.getTxType = function (t) {
    if (t === 'TRANSFER' || t === 'DEPOSIT')
        return 'transfer';
    if (t === 'FREEZE_TOKEN')
        return 'freeze';
    if (t === 'UN_FREEZE_TOKEN')
        return 'unfreeze';
    return 'unkown';
};
//# sourceMappingURL=util.js.map