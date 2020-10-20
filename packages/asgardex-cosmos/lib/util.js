"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAsset = exports.getDenom = exports.isMsgMultiSend = exports.isMsgSend = void 0;
var asgardex_util_1 = require("@thorchain/asgardex-util");
var types_1 = require("./cosmos/types");
/**
 * Type guard for MsgSend
 */
exports.isMsgSend = function (v) { var _a, _b, _c; return ((_a = v) === null || _a === void 0 ? void 0 : _a.amount) !== undefined && ((_b = v) === null || _b === void 0 ? void 0 : _b.from_address) !== undefined && ((_c = v) === null || _c === void 0 ? void 0 : _c.to_address) !== undefined; };
/**
 * Type guard for MsgMultiSend
 */
exports.isMsgMultiSend = function (v) { var _a, _b; return ((_a = v) === null || _a === void 0 ? void 0 : _a.inputs) !== undefined && ((_b = v) === null || _b === void 0 ? void 0 : _b.outputs) !== undefined; };
/**
 * Get denom from Asset
 */
exports.getDenom = function (v) {
    if (v === types_1.AssetAtom)
        return 'uatom';
    if (v === types_1.AssetMuon)
        return 'umuon';
    return v.symbol;
};
/**
 * Get Asset from denom
 */
exports.getAsset = function (v) {
    if (v === 'uatom')
        return types_1.AssetAtom;
    if (v === 'umuon')
        return types_1.AssetMuon;
    return asgardex_util_1.assetFromString(types_1.CosmosChain + "." + v);
};
//# sourceMappingURL=util.js.map