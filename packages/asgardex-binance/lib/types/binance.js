"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
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
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
//# sourceMappingURL=binance.js.map