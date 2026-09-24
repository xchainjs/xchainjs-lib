/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal.js");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.common = (function() {

    /**
     * Namespace common.
     * @exports common
     * @namespace
     */
    var common = {};

    common.Asset = (function() {

        /**
         * Properties of an Asset.
         * @memberof common
         * @interface IAsset
         * @property {string|null} [chain] Asset chain
         * @property {string|null} [symbol] Asset symbol
         * @property {string|null} [ticker] Asset ticker
         * @property {boolean|null} [synth] Asset synth
         * @property {boolean|null} [trade] Asset trade
         * @property {boolean|null} [secured] Asset secured
         */

        /**
         * Constructs a new Asset.
         * @memberof common
         * @classdesc Represents an Asset.
         * @implements IAsset
         * @constructor
         * @param {common.IAsset=} [properties] Properties to set
         */
        function Asset(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Asset chain.
         * @member {string} chain
         * @memberof common.Asset
         * @instance
         */
        Asset.prototype.chain = "";

        /**
         * Asset symbol.
         * @member {string} symbol
         * @memberof common.Asset
         * @instance
         */
        Asset.prototype.symbol = "";

        /**
         * Asset ticker.
         * @member {string} ticker
         * @memberof common.Asset
         * @instance
         */
        Asset.prototype.ticker = "";

        /**
         * Asset synth.
         * @member {boolean} synth
         * @memberof common.Asset
         * @instance
         */
        Asset.prototype.synth = false;

        /**
         * Asset trade.
         * @member {boolean} trade
         * @memberof common.Asset
         * @instance
         */
        Asset.prototype.trade = false;

        /**
         * Asset secured.
         * @member {boolean} secured
         * @memberof common.Asset
         * @instance
         */
        Asset.prototype.secured = false;

        /**
         * Creates a new Asset instance using the specified properties.
         * @function create
         * @memberof common.Asset
         * @static
         * @param {common.IAsset=} [properties] Properties to set
         * @returns {common.Asset} Asset instance
         */
        Asset.create = function create(properties) {
            return new Asset(properties);
        };

        /**
         * Encodes the specified Asset message. Does not implicitly {@link common.Asset.verify|verify} messages.
         * @function encode
         * @memberof common.Asset
         * @static
         * @param {common.IAsset} message Asset message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Asset.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.chain != null && Object.hasOwnProperty.call(message, "chain"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.chain);
            if (message.symbol != null && Object.hasOwnProperty.call(message, "symbol"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.symbol);
            if (message.ticker != null && Object.hasOwnProperty.call(message, "ticker"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.ticker);
            if (message.synth != null && Object.hasOwnProperty.call(message, "synth"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.synth);
            if (message.trade != null && Object.hasOwnProperty.call(message, "trade"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.trade);
            if (message.secured != null && Object.hasOwnProperty.call(message, "secured"))
                writer.uint32(/* id 6, wireType 0 =*/48).bool(message.secured);
            return writer;
        };

        /**
         * Encodes the specified Asset message, length delimited. Does not implicitly {@link common.Asset.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.Asset
         * @static
         * @param {common.IAsset} message Asset message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Asset.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Asset message from the specified reader or buffer.
         * @function decode
         * @memberof common.Asset
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.Asset} Asset
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Asset.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.Asset();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.chain = reader.string();
                    break;
                case 2:
                    message.symbol = reader.string();
                    break;
                case 3:
                    message.ticker = reader.string();
                    break;
                case 4:
                    message.synth = reader.bool();
                    break;
                case 5:
                    message.trade = reader.bool();
                    break;
                case 6:
                    message.secured = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Asset message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.Asset
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.Asset} Asset
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Asset.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Asset message.
         * @function verify
         * @memberof common.Asset
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Asset.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.chain != null && message.hasOwnProperty("chain"))
                if (!$util.isString(message.chain))
                    return "chain: string expected";
            if (message.symbol != null && message.hasOwnProperty("symbol"))
                if (!$util.isString(message.symbol))
                    return "symbol: string expected";
            if (message.ticker != null && message.hasOwnProperty("ticker"))
                if (!$util.isString(message.ticker))
                    return "ticker: string expected";
            if (message.synth != null && message.hasOwnProperty("synth"))
                if (typeof message.synth !== "boolean")
                    return "synth: boolean expected";
            if (message.trade != null && message.hasOwnProperty("trade"))
                if (typeof message.trade !== "boolean")
                    return "trade: boolean expected";
            if (message.secured != null && message.hasOwnProperty("secured"))
                if (typeof message.secured !== "boolean")
                    return "secured: boolean expected";
            return null;
        };

        /**
         * Creates an Asset message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.Asset
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.Asset} Asset
         */
        Asset.fromObject = function fromObject(object) {
            if (object instanceof $root.common.Asset)
                return object;
            var message = new $root.common.Asset();
            if (object.chain != null)
                message.chain = String(object.chain);
            if (object.symbol != null)
                message.symbol = String(object.symbol);
            if (object.ticker != null)
                message.ticker = String(object.ticker);
            if (object.synth != null)
                message.synth = Boolean(object.synth);
            if (object.trade != null)
                message.trade = Boolean(object.trade);
            if (object.secured != null)
                message.secured = Boolean(object.secured);
            return message;
        };

        /**
         * Creates a plain object from an Asset message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.Asset
         * @static
         * @param {common.Asset} message Asset
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Asset.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.chain = "";
                object.symbol = "";
                object.ticker = "";
                object.synth = false;
                object.trade = false;
                object.secured = false;
            }
            if (message.chain != null && message.hasOwnProperty("chain"))
                object.chain = message.chain;
            if (message.symbol != null && message.hasOwnProperty("symbol"))
                object.symbol = message.symbol;
            if (message.ticker != null && message.hasOwnProperty("ticker"))
                object.ticker = message.ticker;
            if (message.synth != null && message.hasOwnProperty("synth"))
                object.synth = message.synth;
            if (message.trade != null && message.hasOwnProperty("trade"))
                object.trade = message.trade;
            if (message.secured != null && message.hasOwnProperty("secured"))
                object.secured = message.secured;
            return object;
        };

        /**
         * Converts this Asset to JSON.
         * @function toJSON
         * @memberof common.Asset
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Asset.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Asset;
    })();

    common.Coin = (function() {

        /**
         * Properties of a Coin.
         * @memberof common
         * @interface ICoin
         * @property {common.IAsset|null} [asset] Coin asset
         * @property {string|null} [amount] Coin amount
         * @property {number|Long|null} [decimals] Coin decimals
         */

        /**
         * Constructs a new Coin.
         * @memberof common
         * @classdesc Represents a Coin.
         * @implements ICoin
         * @constructor
         * @param {common.ICoin=} [properties] Properties to set
         */
        function Coin(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Coin asset.
         * @member {common.IAsset|null|undefined} asset
         * @memberof common.Coin
         * @instance
         */
        Coin.prototype.asset = null;

        /**
         * Coin amount.
         * @member {string} amount
         * @memberof common.Coin
         * @instance
         */
        Coin.prototype.amount = "";

        /**
         * Coin decimals.
         * @member {number|Long} decimals
         * @memberof common.Coin
         * @instance
         */
        Coin.prototype.decimals = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new Coin instance using the specified properties.
         * @function create
         * @memberof common.Coin
         * @static
         * @param {common.ICoin=} [properties] Properties to set
         * @returns {common.Coin} Coin instance
         */
        Coin.create = function create(properties) {
            return new Coin(properties);
        };

        /**
         * Encodes the specified Coin message. Does not implicitly {@link common.Coin.verify|verify} messages.
         * @function encode
         * @memberof common.Coin
         * @static
         * @param {common.ICoin} message Coin message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Coin.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.asset != null && Object.hasOwnProperty.call(message, "asset"))
                $root.common.Asset.encode(message.asset, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.amount);
            if (message.decimals != null && Object.hasOwnProperty.call(message, "decimals"))
                writer.uint32(/* id 3, wireType 0 =*/24).int64(message.decimals);
            return writer;
        };

        /**
         * Encodes the specified Coin message, length delimited. Does not implicitly {@link common.Coin.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.Coin
         * @static
         * @param {common.ICoin} message Coin message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Coin.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Coin message from the specified reader or buffer.
         * @function decode
         * @memberof common.Coin
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.Coin} Coin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Coin.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.Coin();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.asset = $root.common.Asset.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.amount = reader.string();
                    break;
                case 3:
                    message.decimals = reader.int64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Coin message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.Coin
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.Coin} Coin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Coin.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Coin message.
         * @function verify
         * @memberof common.Coin
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Coin.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.asset != null && message.hasOwnProperty("asset")) {
                var error = $root.common.Asset.verify(message.asset);
                if (error)
                    return "asset." + error;
            }
            if (message.amount != null && message.hasOwnProperty("amount"))
                if (!$util.isString(message.amount))
                    return "amount: string expected";
            if (message.decimals != null && message.hasOwnProperty("decimals"))
                if (!$util.isInteger(message.decimals) && !(message.decimals && $util.isInteger(message.decimals.low) && $util.isInteger(message.decimals.high)))
                    return "decimals: integer|Long expected";
            return null;
        };

        /**
         * Creates a Coin message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.Coin
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.Coin} Coin
         */
        Coin.fromObject = function fromObject(object) {
            if (object instanceof $root.common.Coin)
                return object;
            var message = new $root.common.Coin();
            if (object.asset != null) {
                if (typeof object.asset !== "object")
                    throw TypeError(".common.Coin.asset: object expected");
                message.asset = $root.common.Asset.fromObject(object.asset);
            }
            if (object.amount != null)
                message.amount = String(object.amount);
            if (object.decimals != null)
                if ($util.Long)
                    (message.decimals = $util.Long.fromValue(object.decimals)).unsigned = false;
                else if (typeof object.decimals === "string")
                    message.decimals = parseInt(object.decimals, 10);
                else if (typeof object.decimals === "number")
                    message.decimals = object.decimals;
                else if (typeof object.decimals === "object")
                    message.decimals = new $util.LongBits(object.decimals.low >>> 0, object.decimals.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a Coin message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.Coin
         * @static
         * @param {common.Coin} message Coin
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Coin.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.asset = null;
                object.amount = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.decimals = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.decimals = options.longs === String ? "0" : 0;
            }
            if (message.asset != null && message.hasOwnProperty("asset"))
                object.asset = $root.common.Asset.toObject(message.asset, options);
            if (message.amount != null && message.hasOwnProperty("amount"))
                object.amount = message.amount;
            if (message.decimals != null && message.hasOwnProperty("decimals"))
                if (typeof message.decimals === "number")
                    object.decimals = options.longs === String ? String(message.decimals) : message.decimals;
                else
                    object.decimals = options.longs === String ? $util.Long.prototype.toString.call(message.decimals) : options.longs === Number ? new $util.LongBits(message.decimals.low >>> 0, message.decimals.high >>> 0).toNumber() : message.decimals;
            return object;
        };

        /**
         * Converts this Coin to JSON.
         * @function toJSON
         * @memberof common.Coin
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Coin.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Coin;
    })();

    return common;
})();

$root.types = (function() {

    /**
     * Namespace types.
     * @exports types
     * @namespace
     */
    var types = {};

    types.MsgDeposit = (function() {

        /**
         * Properties of a MsgDeposit.
         * @memberof types
         * @interface IMsgDeposit
         * @property {Array.<common.ICoin>|null} [coins] MsgDeposit coins
         * @property {string|null} [memo] MsgDeposit memo
         * @property {Uint8Array|null} [signer] MsgDeposit signer
         */

        /**
         * Constructs a new MsgDeposit.
         * @memberof types
         * @classdesc Represents a MsgDeposit.
         * @implements IMsgDeposit
         * @constructor
         * @param {types.IMsgDeposit=} [properties] Properties to set
         */
        function MsgDeposit(properties) {
            this.coins = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MsgDeposit coins.
         * @member {Array.<common.ICoin>} coins
         * @memberof types.MsgDeposit
         * @instance
         */
        MsgDeposit.prototype.coins = $util.emptyArray;

        /**
         * MsgDeposit memo.
         * @member {string} memo
         * @memberof types.MsgDeposit
         * @instance
         */
        MsgDeposit.prototype.memo = "";

        /**
         * MsgDeposit signer.
         * @member {Uint8Array} signer
         * @memberof types.MsgDeposit
         * @instance
         */
        MsgDeposit.prototype.signer = $util.newBuffer([]);

        /**
         * Creates a new MsgDeposit instance using the specified properties.
         * @function create
         * @memberof types.MsgDeposit
         * @static
         * @param {types.IMsgDeposit=} [properties] Properties to set
         * @returns {types.MsgDeposit} MsgDeposit instance
         */
        MsgDeposit.create = function create(properties) {
            return new MsgDeposit(properties);
        };

        /**
         * Encodes the specified MsgDeposit message. Does not implicitly {@link types.MsgDeposit.verify|verify} messages.
         * @function encode
         * @memberof types.MsgDeposit
         * @static
         * @param {types.IMsgDeposit} message MsgDeposit message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgDeposit.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.coins != null && message.coins.length)
                for (var i = 0; i < message.coins.length; ++i)
                    $root.common.Coin.encode(message.coins[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.memo != null && Object.hasOwnProperty.call(message, "memo"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.memo);
            if (message.signer != null && Object.hasOwnProperty.call(message, "signer"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.signer);
            return writer;
        };

        /**
         * Encodes the specified MsgDeposit message, length delimited. Does not implicitly {@link types.MsgDeposit.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.MsgDeposit
         * @static
         * @param {types.IMsgDeposit} message MsgDeposit message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgDeposit.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MsgDeposit message from the specified reader or buffer.
         * @function decode
         * @memberof types.MsgDeposit
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.MsgDeposit} MsgDeposit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgDeposit.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.MsgDeposit();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.coins && message.coins.length))
                        message.coins = [];
                    message.coins.push($root.common.Coin.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.memo = reader.string();
                    break;
                case 3:
                    message.signer = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MsgDeposit message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.MsgDeposit
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.MsgDeposit} MsgDeposit
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgDeposit.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MsgDeposit message.
         * @function verify
         * @memberof types.MsgDeposit
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MsgDeposit.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.coins != null && message.hasOwnProperty("coins")) {
                if (!Array.isArray(message.coins))
                    return "coins: array expected";
                for (var i = 0; i < message.coins.length; ++i) {
                    var error = $root.common.Coin.verify(message.coins[i]);
                    if (error)
                        return "coins." + error;
                }
            }
            if (message.memo != null && message.hasOwnProperty("memo"))
                if (!$util.isString(message.memo))
                    return "memo: string expected";
            if (message.signer != null && message.hasOwnProperty("signer"))
                if (!(message.signer && typeof message.signer.length === "number" || $util.isString(message.signer)))
                    return "signer: buffer expected";
            return null;
        };

        /**
         * Creates a MsgDeposit message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.MsgDeposit
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.MsgDeposit} MsgDeposit
         */
        MsgDeposit.fromObject = function fromObject(object) {
            if (object instanceof $root.types.MsgDeposit)
                return object;
            var message = new $root.types.MsgDeposit();
            if (object.coins) {
                if (!Array.isArray(object.coins))
                    throw TypeError(".types.MsgDeposit.coins: array expected");
                message.coins = [];
                for (var i = 0; i < object.coins.length; ++i) {
                    if (typeof object.coins[i] !== "object")
                        throw TypeError(".types.MsgDeposit.coins: object expected");
                    message.coins[i] = $root.common.Coin.fromObject(object.coins[i]);
                }
            }
            if (object.memo != null)
                message.memo = String(object.memo);
            if (object.signer != null)
                if (typeof object.signer === "string")
                    $util.base64.decode(object.signer, message.signer = $util.newBuffer($util.base64.length(object.signer)), 0);
                else if (object.signer.length)
                    message.signer = object.signer;
            return message;
        };

        /**
         * Creates a plain object from a MsgDeposit message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.MsgDeposit
         * @static
         * @param {types.MsgDeposit} message MsgDeposit
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MsgDeposit.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.coins = [];
            if (options.defaults) {
                object.memo = "";
                if (options.bytes === String)
                    object.signer = "";
                else {
                    object.signer = [];
                    if (options.bytes !== Array)
                        object.signer = $util.newBuffer(object.signer);
                }
            }
            if (message.coins && message.coins.length) {
                object.coins = [];
                for (var j = 0; j < message.coins.length; ++j)
                    object.coins[j] = $root.common.Coin.toObject(message.coins[j], options);
            }
            if (message.memo != null && message.hasOwnProperty("memo"))
                object.memo = message.memo;
            if (message.signer != null && message.hasOwnProperty("signer"))
                object.signer = options.bytes === String ? $util.base64.encode(message.signer, 0, message.signer.length) : options.bytes === Array ? Array.prototype.slice.call(message.signer) : message.signer;
            return object;
        };

        /**
         * Converts this MsgDeposit to JSON.
         * @function toJSON
         * @memberof types.MsgDeposit
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MsgDeposit.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return MsgDeposit;
    })();

    types.MsgSend = (function() {

        /**
         * Properties of a MsgSend.
         * @memberof types
         * @interface IMsgSend
         * @property {Uint8Array|null} [fromAddress] MsgSend fromAddress
         * @property {Uint8Array|null} [toAddress] MsgSend toAddress
         * @property {Array.<cosmos.base.v1beta1.ICoin>|null} [amount] MsgSend amount
         */

        /**
         * Constructs a new MsgSend.
         * @memberof types
         * @classdesc Represents a MsgSend.
         * @implements IMsgSend
         * @constructor
         * @param {types.IMsgSend=} [properties] Properties to set
         */
        function MsgSend(properties) {
            this.amount = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MsgSend fromAddress.
         * @member {Uint8Array} fromAddress
         * @memberof types.MsgSend
         * @instance
         */
        MsgSend.prototype.fromAddress = $util.newBuffer([]);

        /**
         * MsgSend toAddress.
         * @member {Uint8Array} toAddress
         * @memberof types.MsgSend
         * @instance
         */
        MsgSend.prototype.toAddress = $util.newBuffer([]);

        /**
         * MsgSend amount.
         * @member {Array.<cosmos.base.v1beta1.ICoin>} amount
         * @memberof types.MsgSend
         * @instance
         */
        MsgSend.prototype.amount = $util.emptyArray;

        /**
         * Creates a new MsgSend instance using the specified properties.
         * @function create
         * @memberof types.MsgSend
         * @static
         * @param {types.IMsgSend=} [properties] Properties to set
         * @returns {types.MsgSend} MsgSend instance
         */
        MsgSend.create = function create(properties) {
            return new MsgSend(properties);
        };

        /**
         * Encodes the specified MsgSend message. Does not implicitly {@link types.MsgSend.verify|verify} messages.
         * @function encode
         * @memberof types.MsgSend
         * @static
         * @param {types.IMsgSend} message MsgSend message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgSend.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.fromAddress != null && Object.hasOwnProperty.call(message, "fromAddress"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.fromAddress);
            if (message.toAddress != null && Object.hasOwnProperty.call(message, "toAddress"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.toAddress);
            if (message.amount != null && message.amount.length)
                for (var i = 0; i < message.amount.length; ++i)
                    $root.cosmos.base.v1beta1.Coin.encode(message.amount[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified MsgSend message, length delimited. Does not implicitly {@link types.MsgSend.verify|verify} messages.
         * @function encodeDelimited
         * @memberof types.MsgSend
         * @static
         * @param {types.IMsgSend} message MsgSend message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MsgSend.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MsgSend message from the specified reader or buffer.
         * @function decode
         * @memberof types.MsgSend
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {types.MsgSend} MsgSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgSend.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.types.MsgSend();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.fromAddress = reader.bytes();
                    break;
                case 2:
                    message.toAddress = reader.bytes();
                    break;
                case 3:
                    if (!(message.amount && message.amount.length))
                        message.amount = [];
                    message.amount.push($root.cosmos.base.v1beta1.Coin.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MsgSend message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof types.MsgSend
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {types.MsgSend} MsgSend
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MsgSend.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MsgSend message.
         * @function verify
         * @memberof types.MsgSend
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MsgSend.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.fromAddress != null && message.hasOwnProperty("fromAddress"))
                if (!(message.fromAddress && typeof message.fromAddress.length === "number" || $util.isString(message.fromAddress)))
                    return "fromAddress: buffer expected";
            if (message.toAddress != null && message.hasOwnProperty("toAddress"))
                if (!(message.toAddress && typeof message.toAddress.length === "number" || $util.isString(message.toAddress)))
                    return "toAddress: buffer expected";
            if (message.amount != null && message.hasOwnProperty("amount")) {
                if (!Array.isArray(message.amount))
                    return "amount: array expected";
                for (var i = 0; i < message.amount.length; ++i) {
                    var error = $root.cosmos.base.v1beta1.Coin.verify(message.amount[i]);
                    if (error)
                        return "amount." + error;
                }
            }
            return null;
        };

        /**
         * Creates a MsgSend message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof types.MsgSend
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {types.MsgSend} MsgSend
         */
        MsgSend.fromObject = function fromObject(object) {
            if (object instanceof $root.types.MsgSend)
                return object;
            var message = new $root.types.MsgSend();
            if (object.fromAddress != null)
                if (typeof object.fromAddress === "string")
                    $util.base64.decode(object.fromAddress, message.fromAddress = $util.newBuffer($util.base64.length(object.fromAddress)), 0);
                else if (object.fromAddress.length)
                    message.fromAddress = object.fromAddress;
            if (object.toAddress != null)
                if (typeof object.toAddress === "string")
                    $util.base64.decode(object.toAddress, message.toAddress = $util.newBuffer($util.base64.length(object.toAddress)), 0);
                else if (object.toAddress.length)
                    message.toAddress = object.toAddress;
            if (object.amount) {
                if (!Array.isArray(object.amount))
                    throw TypeError(".types.MsgSend.amount: array expected");
                message.amount = [];
                for (var i = 0; i < object.amount.length; ++i) {
                    if (typeof object.amount[i] !== "object")
                        throw TypeError(".types.MsgSend.amount: object expected");
                    message.amount[i] = $root.cosmos.base.v1beta1.Coin.fromObject(object.amount[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a MsgSend message. Also converts values to other types if specified.
         * @function toObject
         * @memberof types.MsgSend
         * @static
         * @param {types.MsgSend} message MsgSend
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MsgSend.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.amount = [];
            if (options.defaults) {
                if (options.bytes === String)
                    object.fromAddress = "";
                else {
                    object.fromAddress = [];
                    if (options.bytes !== Array)
                        object.fromAddress = $util.newBuffer(object.fromAddress);
                }
                if (options.bytes === String)
                    object.toAddress = "";
                else {
                    object.toAddress = [];
                    if (options.bytes !== Array)
                        object.toAddress = $util.newBuffer(object.toAddress);
                }
            }
            if (message.fromAddress != null && message.hasOwnProperty("fromAddress"))
                object.fromAddress = options.bytes === String ? $util.base64.encode(message.fromAddress, 0, message.fromAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.fromAddress) : message.fromAddress;
            if (message.toAddress != null && message.hasOwnProperty("toAddress"))
                object.toAddress = options.bytes === String ? $util.base64.encode(message.toAddress, 0, message.toAddress.length) : options.bytes === Array ? Array.prototype.slice.call(message.toAddress) : message.toAddress;
            if (message.amount && message.amount.length) {
                object.amount = [];
                for (var j = 0; j < message.amount.length; ++j)
                    object.amount[j] = $root.cosmos.base.v1beta1.Coin.toObject(message.amount[j], options);
            }
            return object;
        };

        /**
         * Converts this MsgSend to JSON.
         * @function toJSON
         * @memberof types.MsgSend
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MsgSend.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return MsgSend;
    })();

    return types;
})();

$root.cosmos = (function() {

    /**
     * Namespace cosmos.
     * @exports cosmos
     * @namespace
     */
    var cosmos = {};

    cosmos.base = (function() {

        /**
         * Namespace base.
         * @memberof cosmos
         * @namespace
         */
        var base = {};

        base.v1beta1 = (function() {

            /**
             * Namespace v1beta1.
             * @memberof cosmos.base
             * @namespace
             */
            var v1beta1 = {};

            v1beta1.Coin = (function() {

                /**
                 * Properties of a Coin.
                 * @memberof cosmos.base.v1beta1
                 * @interface ICoin
                 * @property {string|null} [denom] Coin denom
                 * @property {string|null} [amount] Coin amount
                 */

                /**
                 * Constructs a new Coin.
                 * @memberof cosmos.base.v1beta1
                 * @classdesc Represents a Coin.
                 * @implements ICoin
                 * @constructor
                 * @param {cosmos.base.v1beta1.ICoin=} [properties] Properties to set
                 */
                function Coin(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * Coin denom.
                 * @member {string} denom
                 * @memberof cosmos.base.v1beta1.Coin
                 * @instance
                 */
                Coin.prototype.denom = "";

                /**
                 * Coin amount.
                 * @member {string} amount
                 * @memberof cosmos.base.v1beta1.Coin
                 * @instance
                 */
                Coin.prototype.amount = "";

                /**
                 * Creates a new Coin instance using the specified properties.
                 * @function create
                 * @memberof cosmos.base.v1beta1.Coin
                 * @static
                 * @param {cosmos.base.v1beta1.ICoin=} [properties] Properties to set
                 * @returns {cosmos.base.v1beta1.Coin} Coin instance
                 */
                Coin.create = function create(properties) {
                    return new Coin(properties);
                };

                /**
                 * Encodes the specified Coin message. Does not implicitly {@link cosmos.base.v1beta1.Coin.verify|verify} messages.
                 * @function encode
                 * @memberof cosmos.base.v1beta1.Coin
                 * @static
                 * @param {cosmos.base.v1beta1.ICoin} message Coin message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Coin.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.denom != null && Object.hasOwnProperty.call(message, "denom"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.denom);
                    if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.amount);
                    return writer;
                };

                /**
                 * Encodes the specified Coin message, length delimited. Does not implicitly {@link cosmos.base.v1beta1.Coin.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof cosmos.base.v1beta1.Coin
                 * @static
                 * @param {cosmos.base.v1beta1.ICoin} message Coin message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                Coin.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a Coin message from the specified reader or buffer.
                 * @function decode
                 * @memberof cosmos.base.v1beta1.Coin
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {cosmos.base.v1beta1.Coin} Coin
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Coin.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cosmos.base.v1beta1.Coin();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.denom = reader.string();
                            break;
                        case 2:
                            message.amount = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a Coin message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof cosmos.base.v1beta1.Coin
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {cosmos.base.v1beta1.Coin} Coin
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                Coin.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a Coin message.
                 * @function verify
                 * @memberof cosmos.base.v1beta1.Coin
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                Coin.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.denom != null && message.hasOwnProperty("denom"))
                        if (!$util.isString(message.denom))
                            return "denom: string expected";
                    if (message.amount != null && message.hasOwnProperty("amount"))
                        if (!$util.isString(message.amount))
                            return "amount: string expected";
                    return null;
                };

                /**
                 * Creates a Coin message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof cosmos.base.v1beta1.Coin
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {cosmos.base.v1beta1.Coin} Coin
                 */
                Coin.fromObject = function fromObject(object) {
                    if (object instanceof $root.cosmos.base.v1beta1.Coin)
                        return object;
                    var message = new $root.cosmos.base.v1beta1.Coin();
                    if (object.denom != null)
                        message.denom = String(object.denom);
                    if (object.amount != null)
                        message.amount = String(object.amount);
                    return message;
                };

                /**
                 * Creates a plain object from a Coin message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof cosmos.base.v1beta1.Coin
                 * @static
                 * @param {cosmos.base.v1beta1.Coin} message Coin
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                Coin.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.denom = "";
                        object.amount = "";
                    }
                    if (message.denom != null && message.hasOwnProperty("denom"))
                        object.denom = message.denom;
                    if (message.amount != null && message.hasOwnProperty("amount"))
                        object.amount = message.amount;
                    return object;
                };

                /**
                 * Converts this Coin to JSON.
                 * @function toJSON
                 * @memberof cosmos.base.v1beta1.Coin
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                Coin.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return Coin;
            })();

            return v1beta1;
        })();

        return base;
    })();

    return cosmos;
})();

module.exports = $root;
