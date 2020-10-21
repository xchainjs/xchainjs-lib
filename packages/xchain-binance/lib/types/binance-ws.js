"use strict";
/**
 * Type definitions for data of Binance WebSocket Streams
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Taker = void 0;
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
})(Taker = exports.Taker || (exports.Taker = {}));
//# sourceMappingURL=binance-ws.js.map