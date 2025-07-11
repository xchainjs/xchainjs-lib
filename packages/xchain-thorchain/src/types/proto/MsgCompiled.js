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

    common.PubKeySet = (function() {

        /**
         * Properties of a PubKeySet.
         * @memberof common
         * @interface IPubKeySet
         * @property {string|null} [secp256k1] PubKeySet secp256k1
         * @property {string|null} [ed25519] PubKeySet ed25519
         */

        /**
         * Constructs a new PubKeySet.
         * @memberof common
         * @classdesc Represents a PubKeySet.
         * @implements IPubKeySet
         * @constructor
         * @param {common.IPubKeySet=} [properties] Properties to set
         */
        function PubKeySet(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PubKeySet secp256k1.
         * @member {string} secp256k1
         * @memberof common.PubKeySet
         * @instance
         */
        PubKeySet.prototype.secp256k1 = "";

        /**
         * PubKeySet ed25519.
         * @member {string} ed25519
         * @memberof common.PubKeySet
         * @instance
         */
        PubKeySet.prototype.ed25519 = "";

        /**
         * Creates a new PubKeySet instance using the specified properties.
         * @function create
         * @memberof common.PubKeySet
         * @static
         * @param {common.IPubKeySet=} [properties] Properties to set
         * @returns {common.PubKeySet} PubKeySet instance
         */
        PubKeySet.create = function create(properties) {
            return new PubKeySet(properties);
        };

        /**
         * Encodes the specified PubKeySet message. Does not implicitly {@link common.PubKeySet.verify|verify} messages.
         * @function encode
         * @memberof common.PubKeySet
         * @static
         * @param {common.IPubKeySet} message PubKeySet message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PubKeySet.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.secp256k1 != null && Object.hasOwnProperty.call(message, "secp256k1"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.secp256k1);
            if (message.ed25519 != null && Object.hasOwnProperty.call(message, "ed25519"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.ed25519);
            return writer;
        };

        /**
         * Encodes the specified PubKeySet message, length delimited. Does not implicitly {@link common.PubKeySet.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.PubKeySet
         * @static
         * @param {common.IPubKeySet} message PubKeySet message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PubKeySet.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PubKeySet message from the specified reader or buffer.
         * @function decode
         * @memberof common.PubKeySet
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.PubKeySet} PubKeySet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PubKeySet.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.PubKeySet();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.secp256k1 = reader.string();
                    break;
                case 2:
                    message.ed25519 = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PubKeySet message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.PubKeySet
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.PubKeySet} PubKeySet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PubKeySet.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PubKeySet message.
         * @function verify
         * @memberof common.PubKeySet
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PubKeySet.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.secp256k1 != null && message.hasOwnProperty("secp256k1"))
                if (!$util.isString(message.secp256k1))
                    return "secp256k1: string expected";
            if (message.ed25519 != null && message.hasOwnProperty("ed25519"))
                if (!$util.isString(message.ed25519))
                    return "ed25519: string expected";
            return null;
        };

        /**
         * Creates a PubKeySet message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.PubKeySet
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.PubKeySet} PubKeySet
         */
        PubKeySet.fromObject = function fromObject(object) {
            if (object instanceof $root.common.PubKeySet)
                return object;
            var message = new $root.common.PubKeySet();
            if (object.secp256k1 != null)
                message.secp256k1 = String(object.secp256k1);
            if (object.ed25519 != null)
                message.ed25519 = String(object.ed25519);
            return message;
        };

        /**
         * Creates a plain object from a PubKeySet message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.PubKeySet
         * @static
         * @param {common.PubKeySet} message PubKeySet
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PubKeySet.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.secp256k1 = "";
                object.ed25519 = "";
            }
            if (message.secp256k1 != null && message.hasOwnProperty("secp256k1"))
                object.secp256k1 = message.secp256k1;
            if (message.ed25519 != null && message.hasOwnProperty("ed25519"))
                object.ed25519 = message.ed25519;
            return object;
        };

        /**
         * Converts this PubKeySet to JSON.
         * @function toJSON
         * @memberof common.PubKeySet
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PubKeySet.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return PubKeySet;
    })();

    common.Tx = (function() {

        /**
         * Properties of a Tx.
         * @memberof common
         * @interface ITx
         * @property {string|null} [id] Tx id
         * @property {string|null} [chain] Tx chain
         * @property {string|null} [fromAddress] Tx fromAddress
         * @property {string|null} [toAddress] Tx toAddress
         * @property {Array.<common.ICoin>|null} [coins] Tx coins
         * @property {Array.<common.ICoin>|null} [gas] Tx gas
         * @property {string|null} [memo] Tx memo
         */

        /**
         * Constructs a new Tx.
         * @memberof common
         * @classdesc Represents a Tx.
         * @implements ITx
         * @constructor
         * @param {common.ITx=} [properties] Properties to set
         */
        function Tx(properties) {
            this.coins = [];
            this.gas = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Tx id.
         * @member {string} id
         * @memberof common.Tx
         * @instance
         */
        Tx.prototype.id = "";

        /**
         * Tx chain.
         * @member {string} chain
         * @memberof common.Tx
         * @instance
         */
        Tx.prototype.chain = "";

        /**
         * Tx fromAddress.
         * @member {string} fromAddress
         * @memberof common.Tx
         * @instance
         */
        Tx.prototype.fromAddress = "";

        /**
         * Tx toAddress.
         * @member {string} toAddress
         * @memberof common.Tx
         * @instance
         */
        Tx.prototype.toAddress = "";

        /**
         * Tx coins.
         * @member {Array.<common.ICoin>} coins
         * @memberof common.Tx
         * @instance
         */
        Tx.prototype.coins = $util.emptyArray;

        /**
         * Tx gas.
         * @member {Array.<common.ICoin>} gas
         * @memberof common.Tx
         * @instance
         */
        Tx.prototype.gas = $util.emptyArray;

        /**
         * Tx memo.
         * @member {string} memo
         * @memberof common.Tx
         * @instance
         */
        Tx.prototype.memo = "";

        /**
         * Creates a new Tx instance using the specified properties.
         * @function create
         * @memberof common.Tx
         * @static
         * @param {common.ITx=} [properties] Properties to set
         * @returns {common.Tx} Tx instance
         */
        Tx.create = function create(properties) {
            return new Tx(properties);
        };

        /**
         * Encodes the specified Tx message. Does not implicitly {@link common.Tx.verify|verify} messages.
         * @function encode
         * @memberof common.Tx
         * @static
         * @param {common.ITx} message Tx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Tx.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.chain != null && Object.hasOwnProperty.call(message, "chain"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.chain);
            if (message.fromAddress != null && Object.hasOwnProperty.call(message, "fromAddress"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.fromAddress);
            if (message.toAddress != null && Object.hasOwnProperty.call(message, "toAddress"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.toAddress);
            if (message.coins != null && message.coins.length)
                for (var i = 0; i < message.coins.length; ++i)
                    $root.common.Coin.encode(message.coins[i], writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.gas != null && message.gas.length)
                for (var i = 0; i < message.gas.length; ++i)
                    $root.common.Coin.encode(message.gas[i], writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.memo != null && Object.hasOwnProperty.call(message, "memo"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.memo);
            return writer;
        };

        /**
         * Encodes the specified Tx message, length delimited. Does not implicitly {@link common.Tx.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.Tx
         * @static
         * @param {common.ITx} message Tx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Tx.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Tx message from the specified reader or buffer.
         * @function decode
         * @memberof common.Tx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.Tx} Tx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Tx.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.Tx();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.chain = reader.string();
                    break;
                case 3:
                    message.fromAddress = reader.string();
                    break;
                case 4:
                    message.toAddress = reader.string();
                    break;
                case 5:
                    if (!(message.coins && message.coins.length))
                        message.coins = [];
                    message.coins.push($root.common.Coin.decode(reader, reader.uint32()));
                    break;
                case 6:
                    if (!(message.gas && message.gas.length))
                        message.gas = [];
                    message.gas.push($root.common.Coin.decode(reader, reader.uint32()));
                    break;
                case 7:
                    message.memo = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Tx message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.Tx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.Tx} Tx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Tx.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Tx message.
         * @function verify
         * @memberof common.Tx
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Tx.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.chain != null && message.hasOwnProperty("chain"))
                if (!$util.isString(message.chain))
                    return "chain: string expected";
            if (message.fromAddress != null && message.hasOwnProperty("fromAddress"))
                if (!$util.isString(message.fromAddress))
                    return "fromAddress: string expected";
            if (message.toAddress != null && message.hasOwnProperty("toAddress"))
                if (!$util.isString(message.toAddress))
                    return "toAddress: string expected";
            if (message.coins != null && message.hasOwnProperty("coins")) {
                if (!Array.isArray(message.coins))
                    return "coins: array expected";
                for (var i = 0; i < message.coins.length; ++i) {
                    var error = $root.common.Coin.verify(message.coins[i]);
                    if (error)
                        return "coins." + error;
                }
            }
            if (message.gas != null && message.hasOwnProperty("gas")) {
                if (!Array.isArray(message.gas))
                    return "gas: array expected";
                for (var i = 0; i < message.gas.length; ++i) {
                    var error = $root.common.Coin.verify(message.gas[i]);
                    if (error)
                        return "gas." + error;
                }
            }
            if (message.memo != null && message.hasOwnProperty("memo"))
                if (!$util.isString(message.memo))
                    return "memo: string expected";
            return null;
        };

        /**
         * Creates a Tx message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.Tx
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.Tx} Tx
         */
        Tx.fromObject = function fromObject(object) {
            if (object instanceof $root.common.Tx)
                return object;
            var message = new $root.common.Tx();
            if (object.id != null)
                message.id = String(object.id);
            if (object.chain != null)
                message.chain = String(object.chain);
            if (object.fromAddress != null)
                message.fromAddress = String(object.fromAddress);
            if (object.toAddress != null)
                message.toAddress = String(object.toAddress);
            if (object.coins) {
                if (!Array.isArray(object.coins))
                    throw TypeError(".common.Tx.coins: array expected");
                message.coins = [];
                for (var i = 0; i < object.coins.length; ++i) {
                    if (typeof object.coins[i] !== "object")
                        throw TypeError(".common.Tx.coins: object expected");
                    message.coins[i] = $root.common.Coin.fromObject(object.coins[i]);
                }
            }
            if (object.gas) {
                if (!Array.isArray(object.gas))
                    throw TypeError(".common.Tx.gas: array expected");
                message.gas = [];
                for (var i = 0; i < object.gas.length; ++i) {
                    if (typeof object.gas[i] !== "object")
                        throw TypeError(".common.Tx.gas: object expected");
                    message.gas[i] = $root.common.Coin.fromObject(object.gas[i]);
                }
            }
            if (object.memo != null)
                message.memo = String(object.memo);
            return message;
        };

        /**
         * Creates a plain object from a Tx message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.Tx
         * @static
         * @param {common.Tx} message Tx
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Tx.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.coins = [];
                object.gas = [];
            }
            if (options.defaults) {
                object.id = "";
                object.chain = "";
                object.fromAddress = "";
                object.toAddress = "";
                object.memo = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.chain != null && message.hasOwnProperty("chain"))
                object.chain = message.chain;
            if (message.fromAddress != null && message.hasOwnProperty("fromAddress"))
                object.fromAddress = message.fromAddress;
            if (message.toAddress != null && message.hasOwnProperty("toAddress"))
                object.toAddress = message.toAddress;
            if (message.coins && message.coins.length) {
                object.coins = [];
                for (var j = 0; j < message.coins.length; ++j)
                    object.coins[j] = $root.common.Coin.toObject(message.coins[j], options);
            }
            if (message.gas && message.gas.length) {
                object.gas = [];
                for (var j = 0; j < message.gas.length; ++j)
                    object.gas[j] = $root.common.Coin.toObject(message.gas[j], options);
            }
            if (message.memo != null && message.hasOwnProperty("memo"))
                object.memo = message.memo;
            return object;
        };

        /**
         * Converts this Tx to JSON.
         * @function toJSON
         * @memberof common.Tx
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Tx.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Tx;
    })();

    common.Fee = (function() {

        /**
         * Properties of a Fee.
         * @memberof common
         * @interface IFee
         * @property {Array.<common.ICoin>|null} [coins] Fee coins
         * @property {string|null} [poolDeduct] Fee poolDeduct
         */

        /**
         * Constructs a new Fee.
         * @memberof common
         * @classdesc Represents a Fee.
         * @implements IFee
         * @constructor
         * @param {common.IFee=} [properties] Properties to set
         */
        function Fee(properties) {
            this.coins = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Fee coins.
         * @member {Array.<common.ICoin>} coins
         * @memberof common.Fee
         * @instance
         */
        Fee.prototype.coins = $util.emptyArray;

        /**
         * Fee poolDeduct.
         * @member {string} poolDeduct
         * @memberof common.Fee
         * @instance
         */
        Fee.prototype.poolDeduct = "";

        /**
         * Creates a new Fee instance using the specified properties.
         * @function create
         * @memberof common.Fee
         * @static
         * @param {common.IFee=} [properties] Properties to set
         * @returns {common.Fee} Fee instance
         */
        Fee.create = function create(properties) {
            return new Fee(properties);
        };

        /**
         * Encodes the specified Fee message. Does not implicitly {@link common.Fee.verify|verify} messages.
         * @function encode
         * @memberof common.Fee
         * @static
         * @param {common.IFee} message Fee message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Fee.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.coins != null && message.coins.length)
                for (var i = 0; i < message.coins.length; ++i)
                    $root.common.Coin.encode(message.coins[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.poolDeduct != null && Object.hasOwnProperty.call(message, "poolDeduct"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.poolDeduct);
            return writer;
        };

        /**
         * Encodes the specified Fee message, length delimited. Does not implicitly {@link common.Fee.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.Fee
         * @static
         * @param {common.IFee} message Fee message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Fee.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Fee message from the specified reader or buffer.
         * @function decode
         * @memberof common.Fee
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.Fee} Fee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Fee.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.Fee();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.coins && message.coins.length))
                        message.coins = [];
                    message.coins.push($root.common.Coin.decode(reader, reader.uint32()));
                    break;
                case 2:
                    message.poolDeduct = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Fee message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.Fee
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.Fee} Fee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Fee.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Fee message.
         * @function verify
         * @memberof common.Fee
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Fee.verify = function verify(message) {
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
            if (message.poolDeduct != null && message.hasOwnProperty("poolDeduct"))
                if (!$util.isString(message.poolDeduct))
                    return "poolDeduct: string expected";
            return null;
        };

        /**
         * Creates a Fee message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.Fee
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.Fee} Fee
         */
        Fee.fromObject = function fromObject(object) {
            if (object instanceof $root.common.Fee)
                return object;
            var message = new $root.common.Fee();
            if (object.coins) {
                if (!Array.isArray(object.coins))
                    throw TypeError(".common.Fee.coins: array expected");
                message.coins = [];
                for (var i = 0; i < object.coins.length; ++i) {
                    if (typeof object.coins[i] !== "object")
                        throw TypeError(".common.Fee.coins: object expected");
                    message.coins[i] = $root.common.Coin.fromObject(object.coins[i]);
                }
            }
            if (object.poolDeduct != null)
                message.poolDeduct = String(object.poolDeduct);
            return message;
        };

        /**
         * Creates a plain object from a Fee message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.Fee
         * @static
         * @param {common.Fee} message Fee
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Fee.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.coins = [];
            if (options.defaults)
                object.poolDeduct = "";
            if (message.coins && message.coins.length) {
                object.coins = [];
                for (var j = 0; j < message.coins.length; ++j)
                    object.coins[j] = $root.common.Coin.toObject(message.coins[j], options);
            }
            if (message.poolDeduct != null && message.hasOwnProperty("poolDeduct"))
                object.poolDeduct = message.poolDeduct;
            return object;
        };

        /**
         * Converts this Fee to JSON.
         * @function toJSON
         * @memberof common.Fee
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Fee.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Fee;
    })();

    common.ProtoUint = (function() {

        /**
         * Properties of a ProtoUint.
         * @memberof common
         * @interface IProtoUint
         * @property {string|null} [value] ProtoUint value
         */

        /**
         * Constructs a new ProtoUint.
         * @memberof common
         * @classdesc Represents a ProtoUint.
         * @implements IProtoUint
         * @constructor
         * @param {common.IProtoUint=} [properties] Properties to set
         */
        function ProtoUint(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ProtoUint value.
         * @member {string} value
         * @memberof common.ProtoUint
         * @instance
         */
        ProtoUint.prototype.value = "";

        /**
         * Creates a new ProtoUint instance using the specified properties.
         * @function create
         * @memberof common.ProtoUint
         * @static
         * @param {common.IProtoUint=} [properties] Properties to set
         * @returns {common.ProtoUint} ProtoUint instance
         */
        ProtoUint.create = function create(properties) {
            return new ProtoUint(properties);
        };

        /**
         * Encodes the specified ProtoUint message. Does not implicitly {@link common.ProtoUint.verify|verify} messages.
         * @function encode
         * @memberof common.ProtoUint
         * @static
         * @param {common.IProtoUint} message ProtoUint message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ProtoUint.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.value);
            return writer;
        };

        /**
         * Encodes the specified ProtoUint message, length delimited. Does not implicitly {@link common.ProtoUint.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.ProtoUint
         * @static
         * @param {common.IProtoUint} message ProtoUint message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ProtoUint.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a ProtoUint message from the specified reader or buffer.
         * @function decode
         * @memberof common.ProtoUint
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.ProtoUint} ProtoUint
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ProtoUint.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.ProtoUint();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.value = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a ProtoUint message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.ProtoUint
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.ProtoUint} ProtoUint
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ProtoUint.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a ProtoUint message.
         * @function verify
         * @memberof common.ProtoUint
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ProtoUint.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.value != null && message.hasOwnProperty("value"))
                if (!$util.isString(message.value))
                    return "value: string expected";
            return null;
        };

        /**
         * Creates a ProtoUint message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.ProtoUint
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.ProtoUint} ProtoUint
         */
        ProtoUint.fromObject = function fromObject(object) {
            if (object instanceof $root.common.ProtoUint)
                return object;
            var message = new $root.common.ProtoUint();
            if (object.value != null)
                message.value = String(object.value);
            return message;
        };

        /**
         * Creates a plain object from a ProtoUint message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.ProtoUint
         * @static
         * @param {common.ProtoUint} message ProtoUint
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ProtoUint.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.value = "";
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = message.value;
            return object;
        };

        /**
         * Converts this ProtoUint to JSON.
         * @function toJSON
         * @memberof common.ProtoUint
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ProtoUint.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ProtoUint;
    })();

    /**
     * Status enum.
     * @name common.Status
     * @enum {number}
     * @property {number} incomplete=0 incomplete value
     * @property {number} done=1 done value
     * @property {number} reverted=2 reverted value
     */
    common.Status = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "incomplete"] = 0;
        values[valuesById[1] = "done"] = 1;
        values[valuesById[2] = "reverted"] = 2;
        return values;
    })();

    common.ObservedTx = (function() {

        /**
         * Properties of an ObservedTx.
         * @memberof common
         * @interface IObservedTx
         * @property {common.ITx|null} [tx] ObservedTx tx
         * @property {common.Status|null} [status] ObservedTx status
         * @property {Array.<string>|null} [outHashes] ObservedTx outHashes
         * @property {number|Long|null} [blockHeight] ObservedTx blockHeight
         * @property {Array.<string>|null} [signers] ObservedTx signers
         * @property {string|null} [observedPubKey] ObservedTx observedPubKey
         * @property {number|Long|null} [keysignMs] ObservedTx keysignMs
         * @property {number|Long|null} [finaliseHeight] ObservedTx finaliseHeight
         * @property {string|null} [aggregator] ObservedTx aggregator
         * @property {string|null} [aggregatorTarget] ObservedTx aggregatorTarget
         * @property {string|null} [aggregatorTargetLimit] ObservedTx aggregatorTargetLimit
         */

        /**
         * Constructs a new ObservedTx.
         * @memberof common
         * @classdesc Represents an ObservedTx.
         * @implements IObservedTx
         * @constructor
         * @param {common.IObservedTx=} [properties] Properties to set
         */
        function ObservedTx(properties) {
            this.outHashes = [];
            this.signers = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ObservedTx tx.
         * @member {common.ITx|null|undefined} tx
         * @memberof common.ObservedTx
         * @instance
         */
        ObservedTx.prototype.tx = null;

        /**
         * ObservedTx status.
         * @member {common.Status} status
         * @memberof common.ObservedTx
         * @instance
         */
        ObservedTx.prototype.status = 0;

        /**
         * ObservedTx outHashes.
         * @member {Array.<string>} outHashes
         * @memberof common.ObservedTx
         * @instance
         */
        ObservedTx.prototype.outHashes = $util.emptyArray;

        /**
         * ObservedTx blockHeight.
         * @member {number|Long} blockHeight
         * @memberof common.ObservedTx
         * @instance
         */
        ObservedTx.prototype.blockHeight = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ObservedTx signers.
         * @member {Array.<string>} signers
         * @memberof common.ObservedTx
         * @instance
         */
        ObservedTx.prototype.signers = $util.emptyArray;

        /**
         * ObservedTx observedPubKey.
         * @member {string} observedPubKey
         * @memberof common.ObservedTx
         * @instance
         */
        ObservedTx.prototype.observedPubKey = "";

        /**
         * ObservedTx keysignMs.
         * @member {number|Long} keysignMs
         * @memberof common.ObservedTx
         * @instance
         */
        ObservedTx.prototype.keysignMs = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ObservedTx finaliseHeight.
         * @member {number|Long} finaliseHeight
         * @memberof common.ObservedTx
         * @instance
         */
        ObservedTx.prototype.finaliseHeight = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * ObservedTx aggregator.
         * @member {string} aggregator
         * @memberof common.ObservedTx
         * @instance
         */
        ObservedTx.prototype.aggregator = "";

        /**
         * ObservedTx aggregatorTarget.
         * @member {string} aggregatorTarget
         * @memberof common.ObservedTx
         * @instance
         */
        ObservedTx.prototype.aggregatorTarget = "";

        /**
         * ObservedTx aggregatorTargetLimit.
         * @member {string} aggregatorTargetLimit
         * @memberof common.ObservedTx
         * @instance
         */
        ObservedTx.prototype.aggregatorTargetLimit = "";

        /**
         * Creates a new ObservedTx instance using the specified properties.
         * @function create
         * @memberof common.ObservedTx
         * @static
         * @param {common.IObservedTx=} [properties] Properties to set
         * @returns {common.ObservedTx} ObservedTx instance
         */
        ObservedTx.create = function create(properties) {
            return new ObservedTx(properties);
        };

        /**
         * Encodes the specified ObservedTx message. Does not implicitly {@link common.ObservedTx.verify|verify} messages.
         * @function encode
         * @memberof common.ObservedTx
         * @static
         * @param {common.IObservedTx} message ObservedTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ObservedTx.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.tx != null && Object.hasOwnProperty.call(message, "tx"))
                $root.common.Tx.encode(message.tx, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.status);
            if (message.outHashes != null && message.outHashes.length)
                for (var i = 0; i < message.outHashes.length; ++i)
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.outHashes[i]);
            if (message.blockHeight != null && Object.hasOwnProperty.call(message, "blockHeight"))
                writer.uint32(/* id 4, wireType 0 =*/32).int64(message.blockHeight);
            if (message.signers != null && message.signers.length)
                for (var i = 0; i < message.signers.length; ++i)
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.signers[i]);
            if (message.observedPubKey != null && Object.hasOwnProperty.call(message, "observedPubKey"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.observedPubKey);
            if (message.keysignMs != null && Object.hasOwnProperty.call(message, "keysignMs"))
                writer.uint32(/* id 7, wireType 0 =*/56).int64(message.keysignMs);
            if (message.finaliseHeight != null && Object.hasOwnProperty.call(message, "finaliseHeight"))
                writer.uint32(/* id 8, wireType 0 =*/64).int64(message.finaliseHeight);
            if (message.aggregator != null && Object.hasOwnProperty.call(message, "aggregator"))
                writer.uint32(/* id 9, wireType 2 =*/74).string(message.aggregator);
            if (message.aggregatorTarget != null && Object.hasOwnProperty.call(message, "aggregatorTarget"))
                writer.uint32(/* id 10, wireType 2 =*/82).string(message.aggregatorTarget);
            if (message.aggregatorTargetLimit != null && Object.hasOwnProperty.call(message, "aggregatorTargetLimit"))
                writer.uint32(/* id 11, wireType 2 =*/90).string(message.aggregatorTargetLimit);
            return writer;
        };

        /**
         * Encodes the specified ObservedTx message, length delimited. Does not implicitly {@link common.ObservedTx.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.ObservedTx
         * @static
         * @param {common.IObservedTx} message ObservedTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ObservedTx.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ObservedTx message from the specified reader or buffer.
         * @function decode
         * @memberof common.ObservedTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.ObservedTx} ObservedTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ObservedTx.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.ObservedTx();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.tx = $root.common.Tx.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.status = reader.int32();
                    break;
                case 3:
                    if (!(message.outHashes && message.outHashes.length))
                        message.outHashes = [];
                    message.outHashes.push(reader.string());
                    break;
                case 4:
                    message.blockHeight = reader.int64();
                    break;
                case 5:
                    if (!(message.signers && message.signers.length))
                        message.signers = [];
                    message.signers.push(reader.string());
                    break;
                case 6:
                    message.observedPubKey = reader.string();
                    break;
                case 7:
                    message.keysignMs = reader.int64();
                    break;
                case 8:
                    message.finaliseHeight = reader.int64();
                    break;
                case 9:
                    message.aggregator = reader.string();
                    break;
                case 10:
                    message.aggregatorTarget = reader.string();
                    break;
                case 11:
                    message.aggregatorTargetLimit = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ObservedTx message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.ObservedTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.ObservedTx} ObservedTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ObservedTx.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ObservedTx message.
         * @function verify
         * @memberof common.ObservedTx
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ObservedTx.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.tx != null && message.hasOwnProperty("tx")) {
                var error = $root.common.Tx.verify(message.tx);
                if (error)
                    return "tx." + error;
            }
            if (message.status != null && message.hasOwnProperty("status"))
                switch (message.status) {
                default:
                    return "status: enum value expected";
                case 0:
                case 1:
                case 2:
                    break;
                }
            if (message.outHashes != null && message.hasOwnProperty("outHashes")) {
                if (!Array.isArray(message.outHashes))
                    return "outHashes: array expected";
                for (var i = 0; i < message.outHashes.length; ++i)
                    if (!$util.isString(message.outHashes[i]))
                        return "outHashes: string[] expected";
            }
            if (message.blockHeight != null && message.hasOwnProperty("blockHeight"))
                if (!$util.isInteger(message.blockHeight) && !(message.blockHeight && $util.isInteger(message.blockHeight.low) && $util.isInteger(message.blockHeight.high)))
                    return "blockHeight: integer|Long expected";
            if (message.signers != null && message.hasOwnProperty("signers")) {
                if (!Array.isArray(message.signers))
                    return "signers: array expected";
                for (var i = 0; i < message.signers.length; ++i)
                    if (!$util.isString(message.signers[i]))
                        return "signers: string[] expected";
            }
            if (message.observedPubKey != null && message.hasOwnProperty("observedPubKey"))
                if (!$util.isString(message.observedPubKey))
                    return "observedPubKey: string expected";
            if (message.keysignMs != null && message.hasOwnProperty("keysignMs"))
                if (!$util.isInteger(message.keysignMs) && !(message.keysignMs && $util.isInteger(message.keysignMs.low) && $util.isInteger(message.keysignMs.high)))
                    return "keysignMs: integer|Long expected";
            if (message.finaliseHeight != null && message.hasOwnProperty("finaliseHeight"))
                if (!$util.isInteger(message.finaliseHeight) && !(message.finaliseHeight && $util.isInteger(message.finaliseHeight.low) && $util.isInteger(message.finaliseHeight.high)))
                    return "finaliseHeight: integer|Long expected";
            if (message.aggregator != null && message.hasOwnProperty("aggregator"))
                if (!$util.isString(message.aggregator))
                    return "aggregator: string expected";
            if (message.aggregatorTarget != null && message.hasOwnProperty("aggregatorTarget"))
                if (!$util.isString(message.aggregatorTarget))
                    return "aggregatorTarget: string expected";
            if (message.aggregatorTargetLimit != null && message.hasOwnProperty("aggregatorTargetLimit"))
                if (!$util.isString(message.aggregatorTargetLimit))
                    return "aggregatorTargetLimit: string expected";
            return null;
        };

        /**
         * Creates an ObservedTx message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.ObservedTx
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.ObservedTx} ObservedTx
         */
        ObservedTx.fromObject = function fromObject(object) {
            if (object instanceof $root.common.ObservedTx)
                return object;
            var message = new $root.common.ObservedTx();
            if (object.tx != null) {
                if (typeof object.tx !== "object")
                    throw TypeError(".common.ObservedTx.tx: object expected");
                message.tx = $root.common.Tx.fromObject(object.tx);
            }
            switch (object.status) {
            case "incomplete":
            case 0:
                message.status = 0;
                break;
            case "done":
            case 1:
                message.status = 1;
                break;
            case "reverted":
            case 2:
                message.status = 2;
                break;
            }
            if (object.outHashes) {
                if (!Array.isArray(object.outHashes))
                    throw TypeError(".common.ObservedTx.outHashes: array expected");
                message.outHashes = [];
                for (var i = 0; i < object.outHashes.length; ++i)
                    message.outHashes[i] = String(object.outHashes[i]);
            }
            if (object.blockHeight != null)
                if ($util.Long)
                    (message.blockHeight = $util.Long.fromValue(object.blockHeight)).unsigned = false;
                else if (typeof object.blockHeight === "string")
                    message.blockHeight = parseInt(object.blockHeight, 10);
                else if (typeof object.blockHeight === "number")
                    message.blockHeight = object.blockHeight;
                else if (typeof object.blockHeight === "object")
                    message.blockHeight = new $util.LongBits(object.blockHeight.low >>> 0, object.blockHeight.high >>> 0).toNumber();
            if (object.signers) {
                if (!Array.isArray(object.signers))
                    throw TypeError(".common.ObservedTx.signers: array expected");
                message.signers = [];
                for (var i = 0; i < object.signers.length; ++i)
                    message.signers[i] = String(object.signers[i]);
            }
            if (object.observedPubKey != null)
                message.observedPubKey = String(object.observedPubKey);
            if (object.keysignMs != null)
                if ($util.Long)
                    (message.keysignMs = $util.Long.fromValue(object.keysignMs)).unsigned = false;
                else if (typeof object.keysignMs === "string")
                    message.keysignMs = parseInt(object.keysignMs, 10);
                else if (typeof object.keysignMs === "number")
                    message.keysignMs = object.keysignMs;
                else if (typeof object.keysignMs === "object")
                    message.keysignMs = new $util.LongBits(object.keysignMs.low >>> 0, object.keysignMs.high >>> 0).toNumber();
            if (object.finaliseHeight != null)
                if ($util.Long)
                    (message.finaliseHeight = $util.Long.fromValue(object.finaliseHeight)).unsigned = false;
                else if (typeof object.finaliseHeight === "string")
                    message.finaliseHeight = parseInt(object.finaliseHeight, 10);
                else if (typeof object.finaliseHeight === "number")
                    message.finaliseHeight = object.finaliseHeight;
                else if (typeof object.finaliseHeight === "object")
                    message.finaliseHeight = new $util.LongBits(object.finaliseHeight.low >>> 0, object.finaliseHeight.high >>> 0).toNumber();
            if (object.aggregator != null)
                message.aggregator = String(object.aggregator);
            if (object.aggregatorTarget != null)
                message.aggregatorTarget = String(object.aggregatorTarget);
            if (object.aggregatorTargetLimit != null)
                message.aggregatorTargetLimit = String(object.aggregatorTargetLimit);
            return message;
        };

        /**
         * Creates a plain object from an ObservedTx message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.ObservedTx
         * @static
         * @param {common.ObservedTx} message ObservedTx
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ObservedTx.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.outHashes = [];
                object.signers = [];
            }
            if (options.defaults) {
                object.tx = null;
                object.status = options.enums === String ? "incomplete" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.blockHeight = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.blockHeight = options.longs === String ? "0" : 0;
                object.observedPubKey = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.keysignMs = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.keysignMs = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.finaliseHeight = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.finaliseHeight = options.longs === String ? "0" : 0;
                object.aggregator = "";
                object.aggregatorTarget = "";
                object.aggregatorTargetLimit = "";
            }
            if (message.tx != null && message.hasOwnProperty("tx"))
                object.tx = $root.common.Tx.toObject(message.tx, options);
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = options.enums === String ? $root.common.Status[message.status] : message.status;
            if (message.outHashes && message.outHashes.length) {
                object.outHashes = [];
                for (var j = 0; j < message.outHashes.length; ++j)
                    object.outHashes[j] = message.outHashes[j];
            }
            if (message.blockHeight != null && message.hasOwnProperty("blockHeight"))
                if (typeof message.blockHeight === "number")
                    object.blockHeight = options.longs === String ? String(message.blockHeight) : message.blockHeight;
                else
                    object.blockHeight = options.longs === String ? $util.Long.prototype.toString.call(message.blockHeight) : options.longs === Number ? new $util.LongBits(message.blockHeight.low >>> 0, message.blockHeight.high >>> 0).toNumber() : message.blockHeight;
            if (message.signers && message.signers.length) {
                object.signers = [];
                for (var j = 0; j < message.signers.length; ++j)
                    object.signers[j] = message.signers[j];
            }
            if (message.observedPubKey != null && message.hasOwnProperty("observedPubKey"))
                object.observedPubKey = message.observedPubKey;
            if (message.keysignMs != null && message.hasOwnProperty("keysignMs"))
                if (typeof message.keysignMs === "number")
                    object.keysignMs = options.longs === String ? String(message.keysignMs) : message.keysignMs;
                else
                    object.keysignMs = options.longs === String ? $util.Long.prototype.toString.call(message.keysignMs) : options.longs === Number ? new $util.LongBits(message.keysignMs.low >>> 0, message.keysignMs.high >>> 0).toNumber() : message.keysignMs;
            if (message.finaliseHeight != null && message.hasOwnProperty("finaliseHeight"))
                if (typeof message.finaliseHeight === "number")
                    object.finaliseHeight = options.longs === String ? String(message.finaliseHeight) : message.finaliseHeight;
                else
                    object.finaliseHeight = options.longs === String ? $util.Long.prototype.toString.call(message.finaliseHeight) : options.longs === Number ? new $util.LongBits(message.finaliseHeight.low >>> 0, message.finaliseHeight.high >>> 0).toNumber() : message.finaliseHeight;
            if (message.aggregator != null && message.hasOwnProperty("aggregator"))
                object.aggregator = message.aggregator;
            if (message.aggregatorTarget != null && message.hasOwnProperty("aggregatorTarget"))
                object.aggregatorTarget = message.aggregatorTarget;
            if (message.aggregatorTargetLimit != null && message.hasOwnProperty("aggregatorTargetLimit"))
                object.aggregatorTargetLimit = message.aggregatorTargetLimit;
            return object;
        };

        /**
         * Converts this ObservedTx to JSON.
         * @function toJSON
         * @memberof common.ObservedTx
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ObservedTx.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ObservedTx;
    })();

    common.Attestation = (function() {

        /**
         * Properties of an Attestation.
         * @memberof common
         * @interface IAttestation
         * @property {Uint8Array|null} [PubKey] Attestation PubKey
         * @property {Uint8Array|null} [Signature] Attestation Signature
         */

        /**
         * Constructs a new Attestation.
         * @memberof common
         * @classdesc Represents an Attestation.
         * @implements IAttestation
         * @constructor
         * @param {common.IAttestation=} [properties] Properties to set
         */
        function Attestation(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Attestation PubKey.
         * @member {Uint8Array} PubKey
         * @memberof common.Attestation
         * @instance
         */
        Attestation.prototype.PubKey = $util.newBuffer([]);

        /**
         * Attestation Signature.
         * @member {Uint8Array} Signature
         * @memberof common.Attestation
         * @instance
         */
        Attestation.prototype.Signature = $util.newBuffer([]);

        /**
         * Creates a new Attestation instance using the specified properties.
         * @function create
         * @memberof common.Attestation
         * @static
         * @param {common.IAttestation=} [properties] Properties to set
         * @returns {common.Attestation} Attestation instance
         */
        Attestation.create = function create(properties) {
            return new Attestation(properties);
        };

        /**
         * Encodes the specified Attestation message. Does not implicitly {@link common.Attestation.verify|verify} messages.
         * @function encode
         * @memberof common.Attestation
         * @static
         * @param {common.IAttestation} message Attestation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Attestation.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.PubKey != null && Object.hasOwnProperty.call(message, "PubKey"))
                writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.PubKey);
            if (message.Signature != null && Object.hasOwnProperty.call(message, "Signature"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.Signature);
            return writer;
        };

        /**
         * Encodes the specified Attestation message, length delimited. Does not implicitly {@link common.Attestation.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.Attestation
         * @static
         * @param {common.IAttestation} message Attestation message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Attestation.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Attestation message from the specified reader or buffer.
         * @function decode
         * @memberof common.Attestation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.Attestation} Attestation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Attestation.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.Attestation();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.PubKey = reader.bytes();
                    break;
                case 2:
                    message.Signature = reader.bytes();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Attestation message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.Attestation
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.Attestation} Attestation
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Attestation.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Attestation message.
         * @function verify
         * @memberof common.Attestation
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Attestation.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.PubKey != null && message.hasOwnProperty("PubKey"))
                if (!(message.PubKey && typeof message.PubKey.length === "number" || $util.isString(message.PubKey)))
                    return "PubKey: buffer expected";
            if (message.Signature != null && message.hasOwnProperty("Signature"))
                if (!(message.Signature && typeof message.Signature.length === "number" || $util.isString(message.Signature)))
                    return "Signature: buffer expected";
            return null;
        };

        /**
         * Creates an Attestation message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.Attestation
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.Attestation} Attestation
         */
        Attestation.fromObject = function fromObject(object) {
            if (object instanceof $root.common.Attestation)
                return object;
            var message = new $root.common.Attestation();
            if (object.PubKey != null)
                if (typeof object.PubKey === "string")
                    $util.base64.decode(object.PubKey, message.PubKey = $util.newBuffer($util.base64.length(object.PubKey)), 0);
                else if (object.PubKey.length)
                    message.PubKey = object.PubKey;
            if (object.Signature != null)
                if (typeof object.Signature === "string")
                    $util.base64.decode(object.Signature, message.Signature = $util.newBuffer($util.base64.length(object.Signature)), 0);
                else if (object.Signature.length)
                    message.Signature = object.Signature;
            return message;
        };

        /**
         * Creates a plain object from an Attestation message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.Attestation
         * @static
         * @param {common.Attestation} message Attestation
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Attestation.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if (options.bytes === String)
                    object.PubKey = "";
                else {
                    object.PubKey = [];
                    if (options.bytes !== Array)
                        object.PubKey = $util.newBuffer(object.PubKey);
                }
                if (options.bytes === String)
                    object.Signature = "";
                else {
                    object.Signature = [];
                    if (options.bytes !== Array)
                        object.Signature = $util.newBuffer(object.Signature);
                }
            }
            if (message.PubKey != null && message.hasOwnProperty("PubKey"))
                object.PubKey = options.bytes === String ? $util.base64.encode(message.PubKey, 0, message.PubKey.length) : options.bytes === Array ? Array.prototype.slice.call(message.PubKey) : message.PubKey;
            if (message.Signature != null && message.hasOwnProperty("Signature"))
                object.Signature = options.bytes === String ? $util.base64.encode(message.Signature, 0, message.Signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.Signature) : message.Signature;
            return object;
        };

        /**
         * Converts this Attestation to JSON.
         * @function toJSON
         * @memberof common.Attestation
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Attestation.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Attestation;
    })();

    common.AttestTx = (function() {

        /**
         * Properties of an AttestTx.
         * @memberof common
         * @interface IAttestTx
         * @property {common.IObservedTx|null} [obsTx] AttestTx obsTx
         * @property {common.IAttestation|null} [attestation] AttestTx attestation
         * @property {boolean|null} [inbound] AttestTx inbound
         * @property {boolean|null} [allowFutureObservation] AttestTx allowFutureObservation
         */

        /**
         * Constructs a new AttestTx.
         * @memberof common
         * @classdesc Represents an AttestTx.
         * @implements IAttestTx
         * @constructor
         * @param {common.IAttestTx=} [properties] Properties to set
         */
        function AttestTx(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AttestTx obsTx.
         * @member {common.IObservedTx|null|undefined} obsTx
         * @memberof common.AttestTx
         * @instance
         */
        AttestTx.prototype.obsTx = null;

        /**
         * AttestTx attestation.
         * @member {common.IAttestation|null|undefined} attestation
         * @memberof common.AttestTx
         * @instance
         */
        AttestTx.prototype.attestation = null;

        /**
         * AttestTx inbound.
         * @member {boolean} inbound
         * @memberof common.AttestTx
         * @instance
         */
        AttestTx.prototype.inbound = false;

        /**
         * AttestTx allowFutureObservation.
         * @member {boolean} allowFutureObservation
         * @memberof common.AttestTx
         * @instance
         */
        AttestTx.prototype.allowFutureObservation = false;

        /**
         * Creates a new AttestTx instance using the specified properties.
         * @function create
         * @memberof common.AttestTx
         * @static
         * @param {common.IAttestTx=} [properties] Properties to set
         * @returns {common.AttestTx} AttestTx instance
         */
        AttestTx.create = function create(properties) {
            return new AttestTx(properties);
        };

        /**
         * Encodes the specified AttestTx message. Does not implicitly {@link common.AttestTx.verify|verify} messages.
         * @function encode
         * @memberof common.AttestTx
         * @static
         * @param {common.IAttestTx} message AttestTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AttestTx.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.obsTx != null && Object.hasOwnProperty.call(message, "obsTx"))
                $root.common.ObservedTx.encode(message.obsTx, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.attestation != null && Object.hasOwnProperty.call(message, "attestation"))
                $root.common.Attestation.encode(message.attestation, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.inbound != null && Object.hasOwnProperty.call(message, "inbound"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.inbound);
            if (message.allowFutureObservation != null && Object.hasOwnProperty.call(message, "allowFutureObservation"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.allowFutureObservation);
            return writer;
        };

        /**
         * Encodes the specified AttestTx message, length delimited. Does not implicitly {@link common.AttestTx.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.AttestTx
         * @static
         * @param {common.IAttestTx} message AttestTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AttestTx.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AttestTx message from the specified reader or buffer.
         * @function decode
         * @memberof common.AttestTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.AttestTx} AttestTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AttestTx.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.AttestTx();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.obsTx = $root.common.ObservedTx.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.attestation = $root.common.Attestation.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.inbound = reader.bool();
                    break;
                case 4:
                    message.allowFutureObservation = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AttestTx message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.AttestTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.AttestTx} AttestTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AttestTx.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AttestTx message.
         * @function verify
         * @memberof common.AttestTx
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AttestTx.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.obsTx != null && message.hasOwnProperty("obsTx")) {
                var error = $root.common.ObservedTx.verify(message.obsTx);
                if (error)
                    return "obsTx." + error;
            }
            if (message.attestation != null && message.hasOwnProperty("attestation")) {
                var error = $root.common.Attestation.verify(message.attestation);
                if (error)
                    return "attestation." + error;
            }
            if (message.inbound != null && message.hasOwnProperty("inbound"))
                if (typeof message.inbound !== "boolean")
                    return "inbound: boolean expected";
            if (message.allowFutureObservation != null && message.hasOwnProperty("allowFutureObservation"))
                if (typeof message.allowFutureObservation !== "boolean")
                    return "allowFutureObservation: boolean expected";
            return null;
        };

        /**
         * Creates an AttestTx message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.AttestTx
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.AttestTx} AttestTx
         */
        AttestTx.fromObject = function fromObject(object) {
            if (object instanceof $root.common.AttestTx)
                return object;
            var message = new $root.common.AttestTx();
            if (object.obsTx != null) {
                if (typeof object.obsTx !== "object")
                    throw TypeError(".common.AttestTx.obsTx: object expected");
                message.obsTx = $root.common.ObservedTx.fromObject(object.obsTx);
            }
            if (object.attestation != null) {
                if (typeof object.attestation !== "object")
                    throw TypeError(".common.AttestTx.attestation: object expected");
                message.attestation = $root.common.Attestation.fromObject(object.attestation);
            }
            if (object.inbound != null)
                message.inbound = Boolean(object.inbound);
            if (object.allowFutureObservation != null)
                message.allowFutureObservation = Boolean(object.allowFutureObservation);
            return message;
        };

        /**
         * Creates a plain object from an AttestTx message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.AttestTx
         * @static
         * @param {common.AttestTx} message AttestTx
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AttestTx.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.obsTx = null;
                object.attestation = null;
                object.inbound = false;
                object.allowFutureObservation = false;
            }
            if (message.obsTx != null && message.hasOwnProperty("obsTx"))
                object.obsTx = $root.common.ObservedTx.toObject(message.obsTx, options);
            if (message.attestation != null && message.hasOwnProperty("attestation"))
                object.attestation = $root.common.Attestation.toObject(message.attestation, options);
            if (message.inbound != null && message.hasOwnProperty("inbound"))
                object.inbound = message.inbound;
            if (message.allowFutureObservation != null && message.hasOwnProperty("allowFutureObservation"))
                object.allowFutureObservation = message.allowFutureObservation;
            return object;
        };

        /**
         * Converts this AttestTx to JSON.
         * @function toJSON
         * @memberof common.AttestTx
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AttestTx.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AttestTx;
    })();

    common.QuorumTx = (function() {

        /**
         * Properties of a QuorumTx.
         * @memberof common
         * @interface IQuorumTx
         * @property {common.IObservedTx|null} [obsTx] QuorumTx obsTx
         * @property {Array.<common.IAttestation>|null} [attestations] QuorumTx attestations
         * @property {boolean|null} [inbound] QuorumTx inbound
         * @property {boolean|null} [allowFutureObservation] QuorumTx allowFutureObservation
         */

        /**
         * Constructs a new QuorumTx.
         * @memberof common
         * @classdesc Represents a QuorumTx.
         * @implements IQuorumTx
         * @constructor
         * @param {common.IQuorumTx=} [properties] Properties to set
         */
        function QuorumTx(properties) {
            this.attestations = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * QuorumTx obsTx.
         * @member {common.IObservedTx|null|undefined} obsTx
         * @memberof common.QuorumTx
         * @instance
         */
        QuorumTx.prototype.obsTx = null;

        /**
         * QuorumTx attestations.
         * @member {Array.<common.IAttestation>} attestations
         * @memberof common.QuorumTx
         * @instance
         */
        QuorumTx.prototype.attestations = $util.emptyArray;

        /**
         * QuorumTx inbound.
         * @member {boolean} inbound
         * @memberof common.QuorumTx
         * @instance
         */
        QuorumTx.prototype.inbound = false;

        /**
         * QuorumTx allowFutureObservation.
         * @member {boolean} allowFutureObservation
         * @memberof common.QuorumTx
         * @instance
         */
        QuorumTx.prototype.allowFutureObservation = false;

        /**
         * Creates a new QuorumTx instance using the specified properties.
         * @function create
         * @memberof common.QuorumTx
         * @static
         * @param {common.IQuorumTx=} [properties] Properties to set
         * @returns {common.QuorumTx} QuorumTx instance
         */
        QuorumTx.create = function create(properties) {
            return new QuorumTx(properties);
        };

        /**
         * Encodes the specified QuorumTx message. Does not implicitly {@link common.QuorumTx.verify|verify} messages.
         * @function encode
         * @memberof common.QuorumTx
         * @static
         * @param {common.IQuorumTx} message QuorumTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuorumTx.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.obsTx != null && Object.hasOwnProperty.call(message, "obsTx"))
                $root.common.ObservedTx.encode(message.obsTx, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.attestations != null && message.attestations.length)
                for (var i = 0; i < message.attestations.length; ++i)
                    $root.common.Attestation.encode(message.attestations[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.inbound != null && Object.hasOwnProperty.call(message, "inbound"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.inbound);
            if (message.allowFutureObservation != null && Object.hasOwnProperty.call(message, "allowFutureObservation"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.allowFutureObservation);
            return writer;
        };

        /**
         * Encodes the specified QuorumTx message, length delimited. Does not implicitly {@link common.QuorumTx.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.QuorumTx
         * @static
         * @param {common.IQuorumTx} message QuorumTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuorumTx.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a QuorumTx message from the specified reader or buffer.
         * @function decode
         * @memberof common.QuorumTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.QuorumTx} QuorumTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuorumTx.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.QuorumTx();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.obsTx = $root.common.ObservedTx.decode(reader, reader.uint32());
                    break;
                case 2:
                    if (!(message.attestations && message.attestations.length))
                        message.attestations = [];
                    message.attestations.push($root.common.Attestation.decode(reader, reader.uint32()));
                    break;
                case 3:
                    message.inbound = reader.bool();
                    break;
                case 4:
                    message.allowFutureObservation = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a QuorumTx message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.QuorumTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.QuorumTx} QuorumTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuorumTx.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a QuorumTx message.
         * @function verify
         * @memberof common.QuorumTx
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        QuorumTx.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.obsTx != null && message.hasOwnProperty("obsTx")) {
                var error = $root.common.ObservedTx.verify(message.obsTx);
                if (error)
                    return "obsTx." + error;
            }
            if (message.attestations != null && message.hasOwnProperty("attestations")) {
                if (!Array.isArray(message.attestations))
                    return "attestations: array expected";
                for (var i = 0; i < message.attestations.length; ++i) {
                    var error = $root.common.Attestation.verify(message.attestations[i]);
                    if (error)
                        return "attestations." + error;
                }
            }
            if (message.inbound != null && message.hasOwnProperty("inbound"))
                if (typeof message.inbound !== "boolean")
                    return "inbound: boolean expected";
            if (message.allowFutureObservation != null && message.hasOwnProperty("allowFutureObservation"))
                if (typeof message.allowFutureObservation !== "boolean")
                    return "allowFutureObservation: boolean expected";
            return null;
        };

        /**
         * Creates a QuorumTx message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.QuorumTx
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.QuorumTx} QuorumTx
         */
        QuorumTx.fromObject = function fromObject(object) {
            if (object instanceof $root.common.QuorumTx)
                return object;
            var message = new $root.common.QuorumTx();
            if (object.obsTx != null) {
                if (typeof object.obsTx !== "object")
                    throw TypeError(".common.QuorumTx.obsTx: object expected");
                message.obsTx = $root.common.ObservedTx.fromObject(object.obsTx);
            }
            if (object.attestations) {
                if (!Array.isArray(object.attestations))
                    throw TypeError(".common.QuorumTx.attestations: array expected");
                message.attestations = [];
                for (var i = 0; i < object.attestations.length; ++i) {
                    if (typeof object.attestations[i] !== "object")
                        throw TypeError(".common.QuorumTx.attestations: object expected");
                    message.attestations[i] = $root.common.Attestation.fromObject(object.attestations[i]);
                }
            }
            if (object.inbound != null)
                message.inbound = Boolean(object.inbound);
            if (object.allowFutureObservation != null)
                message.allowFutureObservation = Boolean(object.allowFutureObservation);
            return message;
        };

        /**
         * Creates a plain object from a QuorumTx message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.QuorumTx
         * @static
         * @param {common.QuorumTx} message QuorumTx
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        QuorumTx.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.attestations = [];
            if (options.defaults) {
                object.obsTx = null;
                object.inbound = false;
                object.allowFutureObservation = false;
            }
            if (message.obsTx != null && message.hasOwnProperty("obsTx"))
                object.obsTx = $root.common.ObservedTx.toObject(message.obsTx, options);
            if (message.attestations && message.attestations.length) {
                object.attestations = [];
                for (var j = 0; j < message.attestations.length; ++j)
                    object.attestations[j] = $root.common.Attestation.toObject(message.attestations[j], options);
            }
            if (message.inbound != null && message.hasOwnProperty("inbound"))
                object.inbound = message.inbound;
            if (message.allowFutureObservation != null && message.hasOwnProperty("allowFutureObservation"))
                object.allowFutureObservation = message.allowFutureObservation;
            return object;
        };

        /**
         * Converts this QuorumTx to JSON.
         * @function toJSON
         * @memberof common.QuorumTx
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        QuorumTx.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return QuorumTx;
    })();

    common.QuorumState = (function() {

        /**
         * Properties of a QuorumState.
         * @memberof common
         * @interface IQuorumState
         * @property {Array.<common.IQuorumTx>|null} [quoTxs] QuorumState quoTxs
         * @property {Array.<common.IQuorumNetworkFee>|null} [quoNetworkFees] QuorumState quoNetworkFees
         * @property {Array.<common.IQuorumSolvency>|null} [quoSolvencies] QuorumState quoSolvencies
         * @property {Array.<common.IQuorumErrataTx>|null} [quoErrataTxs] QuorumState quoErrataTxs
         */

        /**
         * Constructs a new QuorumState.
         * @memberof common
         * @classdesc Represents a QuorumState.
         * @implements IQuorumState
         * @constructor
         * @param {common.IQuorumState=} [properties] Properties to set
         */
        function QuorumState(properties) {
            this.quoTxs = [];
            this.quoNetworkFees = [];
            this.quoSolvencies = [];
            this.quoErrataTxs = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * QuorumState quoTxs.
         * @member {Array.<common.IQuorumTx>} quoTxs
         * @memberof common.QuorumState
         * @instance
         */
        QuorumState.prototype.quoTxs = $util.emptyArray;

        /**
         * QuorumState quoNetworkFees.
         * @member {Array.<common.IQuorumNetworkFee>} quoNetworkFees
         * @memberof common.QuorumState
         * @instance
         */
        QuorumState.prototype.quoNetworkFees = $util.emptyArray;

        /**
         * QuorumState quoSolvencies.
         * @member {Array.<common.IQuorumSolvency>} quoSolvencies
         * @memberof common.QuorumState
         * @instance
         */
        QuorumState.prototype.quoSolvencies = $util.emptyArray;

        /**
         * QuorumState quoErrataTxs.
         * @member {Array.<common.IQuorumErrataTx>} quoErrataTxs
         * @memberof common.QuorumState
         * @instance
         */
        QuorumState.prototype.quoErrataTxs = $util.emptyArray;

        /**
         * Creates a new QuorumState instance using the specified properties.
         * @function create
         * @memberof common.QuorumState
         * @static
         * @param {common.IQuorumState=} [properties] Properties to set
         * @returns {common.QuorumState} QuorumState instance
         */
        QuorumState.create = function create(properties) {
            return new QuorumState(properties);
        };

        /**
         * Encodes the specified QuorumState message. Does not implicitly {@link common.QuorumState.verify|verify} messages.
         * @function encode
         * @memberof common.QuorumState
         * @static
         * @param {common.IQuorumState} message QuorumState message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuorumState.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.quoTxs != null && message.quoTxs.length)
                for (var i = 0; i < message.quoTxs.length; ++i)
                    $root.common.QuorumTx.encode(message.quoTxs[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.quoNetworkFees != null && message.quoNetworkFees.length)
                for (var i = 0; i < message.quoNetworkFees.length; ++i)
                    $root.common.QuorumNetworkFee.encode(message.quoNetworkFees[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.quoSolvencies != null && message.quoSolvencies.length)
                for (var i = 0; i < message.quoSolvencies.length; ++i)
                    $root.common.QuorumSolvency.encode(message.quoSolvencies[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.quoErrataTxs != null && message.quoErrataTxs.length)
                for (var i = 0; i < message.quoErrataTxs.length; ++i)
                    $root.common.QuorumErrataTx.encode(message.quoErrataTxs[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified QuorumState message, length delimited. Does not implicitly {@link common.QuorumState.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.QuorumState
         * @static
         * @param {common.IQuorumState} message QuorumState message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuorumState.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a QuorumState message from the specified reader or buffer.
         * @function decode
         * @memberof common.QuorumState
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.QuorumState} QuorumState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuorumState.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.QuorumState();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.quoTxs && message.quoTxs.length))
                        message.quoTxs = [];
                    message.quoTxs.push($root.common.QuorumTx.decode(reader, reader.uint32()));
                    break;
                case 2:
                    if (!(message.quoNetworkFees && message.quoNetworkFees.length))
                        message.quoNetworkFees = [];
                    message.quoNetworkFees.push($root.common.QuorumNetworkFee.decode(reader, reader.uint32()));
                    break;
                case 3:
                    if (!(message.quoSolvencies && message.quoSolvencies.length))
                        message.quoSolvencies = [];
                    message.quoSolvencies.push($root.common.QuorumSolvency.decode(reader, reader.uint32()));
                    break;
                case 4:
                    if (!(message.quoErrataTxs && message.quoErrataTxs.length))
                        message.quoErrataTxs = [];
                    message.quoErrataTxs.push($root.common.QuorumErrataTx.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a QuorumState message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.QuorumState
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.QuorumState} QuorumState
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuorumState.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a QuorumState message.
         * @function verify
         * @memberof common.QuorumState
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        QuorumState.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.quoTxs != null && message.hasOwnProperty("quoTxs")) {
                if (!Array.isArray(message.quoTxs))
                    return "quoTxs: array expected";
                for (var i = 0; i < message.quoTxs.length; ++i) {
                    var error = $root.common.QuorumTx.verify(message.quoTxs[i]);
                    if (error)
                        return "quoTxs." + error;
                }
            }
            if (message.quoNetworkFees != null && message.hasOwnProperty("quoNetworkFees")) {
                if (!Array.isArray(message.quoNetworkFees))
                    return "quoNetworkFees: array expected";
                for (var i = 0; i < message.quoNetworkFees.length; ++i) {
                    var error = $root.common.QuorumNetworkFee.verify(message.quoNetworkFees[i]);
                    if (error)
                        return "quoNetworkFees." + error;
                }
            }
            if (message.quoSolvencies != null && message.hasOwnProperty("quoSolvencies")) {
                if (!Array.isArray(message.quoSolvencies))
                    return "quoSolvencies: array expected";
                for (var i = 0; i < message.quoSolvencies.length; ++i) {
                    var error = $root.common.QuorumSolvency.verify(message.quoSolvencies[i]);
                    if (error)
                        return "quoSolvencies." + error;
                }
            }
            if (message.quoErrataTxs != null && message.hasOwnProperty("quoErrataTxs")) {
                if (!Array.isArray(message.quoErrataTxs))
                    return "quoErrataTxs: array expected";
                for (var i = 0; i < message.quoErrataTxs.length; ++i) {
                    var error = $root.common.QuorumErrataTx.verify(message.quoErrataTxs[i]);
                    if (error)
                        return "quoErrataTxs." + error;
                }
            }
            return null;
        };

        /**
         * Creates a QuorumState message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.QuorumState
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.QuorumState} QuorumState
         */
        QuorumState.fromObject = function fromObject(object) {
            if (object instanceof $root.common.QuorumState)
                return object;
            var message = new $root.common.QuorumState();
            if (object.quoTxs) {
                if (!Array.isArray(object.quoTxs))
                    throw TypeError(".common.QuorumState.quoTxs: array expected");
                message.quoTxs = [];
                for (var i = 0; i < object.quoTxs.length; ++i) {
                    if (typeof object.quoTxs[i] !== "object")
                        throw TypeError(".common.QuorumState.quoTxs: object expected");
                    message.quoTxs[i] = $root.common.QuorumTx.fromObject(object.quoTxs[i]);
                }
            }
            if (object.quoNetworkFees) {
                if (!Array.isArray(object.quoNetworkFees))
                    throw TypeError(".common.QuorumState.quoNetworkFees: array expected");
                message.quoNetworkFees = [];
                for (var i = 0; i < object.quoNetworkFees.length; ++i) {
                    if (typeof object.quoNetworkFees[i] !== "object")
                        throw TypeError(".common.QuorumState.quoNetworkFees: object expected");
                    message.quoNetworkFees[i] = $root.common.QuorumNetworkFee.fromObject(object.quoNetworkFees[i]);
                }
            }
            if (object.quoSolvencies) {
                if (!Array.isArray(object.quoSolvencies))
                    throw TypeError(".common.QuorumState.quoSolvencies: array expected");
                message.quoSolvencies = [];
                for (var i = 0; i < object.quoSolvencies.length; ++i) {
                    if (typeof object.quoSolvencies[i] !== "object")
                        throw TypeError(".common.QuorumState.quoSolvencies: object expected");
                    message.quoSolvencies[i] = $root.common.QuorumSolvency.fromObject(object.quoSolvencies[i]);
                }
            }
            if (object.quoErrataTxs) {
                if (!Array.isArray(object.quoErrataTxs))
                    throw TypeError(".common.QuorumState.quoErrataTxs: array expected");
                message.quoErrataTxs = [];
                for (var i = 0; i < object.quoErrataTxs.length; ++i) {
                    if (typeof object.quoErrataTxs[i] !== "object")
                        throw TypeError(".common.QuorumState.quoErrataTxs: object expected");
                    message.quoErrataTxs[i] = $root.common.QuorumErrataTx.fromObject(object.quoErrataTxs[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a QuorumState message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.QuorumState
         * @static
         * @param {common.QuorumState} message QuorumState
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        QuorumState.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.quoTxs = [];
                object.quoNetworkFees = [];
                object.quoSolvencies = [];
                object.quoErrataTxs = [];
            }
            if (message.quoTxs && message.quoTxs.length) {
                object.quoTxs = [];
                for (var j = 0; j < message.quoTxs.length; ++j)
                    object.quoTxs[j] = $root.common.QuorumTx.toObject(message.quoTxs[j], options);
            }
            if (message.quoNetworkFees && message.quoNetworkFees.length) {
                object.quoNetworkFees = [];
                for (var j = 0; j < message.quoNetworkFees.length; ++j)
                    object.quoNetworkFees[j] = $root.common.QuorumNetworkFee.toObject(message.quoNetworkFees[j], options);
            }
            if (message.quoSolvencies && message.quoSolvencies.length) {
                object.quoSolvencies = [];
                for (var j = 0; j < message.quoSolvencies.length; ++j)
                    object.quoSolvencies[j] = $root.common.QuorumSolvency.toObject(message.quoSolvencies[j], options);
            }
            if (message.quoErrataTxs && message.quoErrataTxs.length) {
                object.quoErrataTxs = [];
                for (var j = 0; j < message.quoErrataTxs.length; ++j)
                    object.quoErrataTxs[j] = $root.common.QuorumErrataTx.toObject(message.quoErrataTxs[j], options);
            }
            return object;
        };

        /**
         * Converts this QuorumState to JSON.
         * @function toJSON
         * @memberof common.QuorumState
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        QuorumState.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return QuorumState;
    })();

    common.NetworkFee = (function() {

        /**
         * Properties of a NetworkFee.
         * @memberof common
         * @interface INetworkFee
         * @property {number|Long|null} [height] NetworkFee height
         * @property {string|null} [chain] NetworkFee chain
         * @property {number|Long|null} [transactionSize] NetworkFee transactionSize
         * @property {number|Long|null} [transactionRate] NetworkFee transactionRate
         */

        /**
         * Constructs a new NetworkFee.
         * @memberof common
         * @classdesc Represents a NetworkFee.
         * @implements INetworkFee
         * @constructor
         * @param {common.INetworkFee=} [properties] Properties to set
         */
        function NetworkFee(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * NetworkFee height.
         * @member {number|Long} height
         * @memberof common.NetworkFee
         * @instance
         */
        NetworkFee.prototype.height = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * NetworkFee chain.
         * @member {string} chain
         * @memberof common.NetworkFee
         * @instance
         */
        NetworkFee.prototype.chain = "";

        /**
         * NetworkFee transactionSize.
         * @member {number|Long} transactionSize
         * @memberof common.NetworkFee
         * @instance
         */
        NetworkFee.prototype.transactionSize = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * NetworkFee transactionRate.
         * @member {number|Long} transactionRate
         * @memberof common.NetworkFee
         * @instance
         */
        NetworkFee.prototype.transactionRate = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Creates a new NetworkFee instance using the specified properties.
         * @function create
         * @memberof common.NetworkFee
         * @static
         * @param {common.INetworkFee=} [properties] Properties to set
         * @returns {common.NetworkFee} NetworkFee instance
         */
        NetworkFee.create = function create(properties) {
            return new NetworkFee(properties);
        };

        /**
         * Encodes the specified NetworkFee message. Does not implicitly {@link common.NetworkFee.verify|verify} messages.
         * @function encode
         * @memberof common.NetworkFee
         * @static
         * @param {common.INetworkFee} message NetworkFee message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NetworkFee.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.height != null && Object.hasOwnProperty.call(message, "height"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.height);
            if (message.chain != null && Object.hasOwnProperty.call(message, "chain"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.chain);
            if (message.transactionSize != null && Object.hasOwnProperty.call(message, "transactionSize"))
                writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.transactionSize);
            if (message.transactionRate != null && Object.hasOwnProperty.call(message, "transactionRate"))
                writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.transactionRate);
            return writer;
        };

        /**
         * Encodes the specified NetworkFee message, length delimited. Does not implicitly {@link common.NetworkFee.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.NetworkFee
         * @static
         * @param {common.INetworkFee} message NetworkFee message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        NetworkFee.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a NetworkFee message from the specified reader or buffer.
         * @function decode
         * @memberof common.NetworkFee
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.NetworkFee} NetworkFee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NetworkFee.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.NetworkFee();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.height = reader.int64();
                    break;
                case 2:
                    message.chain = reader.string();
                    break;
                case 3:
                    message.transactionSize = reader.uint64();
                    break;
                case 4:
                    message.transactionRate = reader.uint64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a NetworkFee message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.NetworkFee
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.NetworkFee} NetworkFee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        NetworkFee.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a NetworkFee message.
         * @function verify
         * @memberof common.NetworkFee
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        NetworkFee.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.height != null && message.hasOwnProperty("height"))
                if (!$util.isInteger(message.height) && !(message.height && $util.isInteger(message.height.low) && $util.isInteger(message.height.high)))
                    return "height: integer|Long expected";
            if (message.chain != null && message.hasOwnProperty("chain"))
                if (!$util.isString(message.chain))
                    return "chain: string expected";
            if (message.transactionSize != null && message.hasOwnProperty("transactionSize"))
                if (!$util.isInteger(message.transactionSize) && !(message.transactionSize && $util.isInteger(message.transactionSize.low) && $util.isInteger(message.transactionSize.high)))
                    return "transactionSize: integer|Long expected";
            if (message.transactionRate != null && message.hasOwnProperty("transactionRate"))
                if (!$util.isInteger(message.transactionRate) && !(message.transactionRate && $util.isInteger(message.transactionRate.low) && $util.isInteger(message.transactionRate.high)))
                    return "transactionRate: integer|Long expected";
            return null;
        };

        /**
         * Creates a NetworkFee message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.NetworkFee
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.NetworkFee} NetworkFee
         */
        NetworkFee.fromObject = function fromObject(object) {
            if (object instanceof $root.common.NetworkFee)
                return object;
            var message = new $root.common.NetworkFee();
            if (object.height != null)
                if ($util.Long)
                    (message.height = $util.Long.fromValue(object.height)).unsigned = false;
                else if (typeof object.height === "string")
                    message.height = parseInt(object.height, 10);
                else if (typeof object.height === "number")
                    message.height = object.height;
                else if (typeof object.height === "object")
                    message.height = new $util.LongBits(object.height.low >>> 0, object.height.high >>> 0).toNumber();
            if (object.chain != null)
                message.chain = String(object.chain);
            if (object.transactionSize != null)
                if ($util.Long)
                    (message.transactionSize = $util.Long.fromValue(object.transactionSize)).unsigned = true;
                else if (typeof object.transactionSize === "string")
                    message.transactionSize = parseInt(object.transactionSize, 10);
                else if (typeof object.transactionSize === "number")
                    message.transactionSize = object.transactionSize;
                else if (typeof object.transactionSize === "object")
                    message.transactionSize = new $util.LongBits(object.transactionSize.low >>> 0, object.transactionSize.high >>> 0).toNumber(true);
            if (object.transactionRate != null)
                if ($util.Long)
                    (message.transactionRate = $util.Long.fromValue(object.transactionRate)).unsigned = true;
                else if (typeof object.transactionRate === "string")
                    message.transactionRate = parseInt(object.transactionRate, 10);
                else if (typeof object.transactionRate === "number")
                    message.transactionRate = object.transactionRate;
                else if (typeof object.transactionRate === "object")
                    message.transactionRate = new $util.LongBits(object.transactionRate.low >>> 0, object.transactionRate.high >>> 0).toNumber(true);
            return message;
        };

        /**
         * Creates a plain object from a NetworkFee message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.NetworkFee
         * @static
         * @param {common.NetworkFee} message NetworkFee
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        NetworkFee.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.height = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.height = options.longs === String ? "0" : 0;
                object.chain = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.transactionSize = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.transactionSize = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.transactionRate = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.transactionRate = options.longs === String ? "0" : 0;
            }
            if (message.height != null && message.hasOwnProperty("height"))
                if (typeof message.height === "number")
                    object.height = options.longs === String ? String(message.height) : message.height;
                else
                    object.height = options.longs === String ? $util.Long.prototype.toString.call(message.height) : options.longs === Number ? new $util.LongBits(message.height.low >>> 0, message.height.high >>> 0).toNumber() : message.height;
            if (message.chain != null && message.hasOwnProperty("chain"))
                object.chain = message.chain;
            if (message.transactionSize != null && message.hasOwnProperty("transactionSize"))
                if (typeof message.transactionSize === "number")
                    object.transactionSize = options.longs === String ? String(message.transactionSize) : message.transactionSize;
                else
                    object.transactionSize = options.longs === String ? $util.Long.prototype.toString.call(message.transactionSize) : options.longs === Number ? new $util.LongBits(message.transactionSize.low >>> 0, message.transactionSize.high >>> 0).toNumber(true) : message.transactionSize;
            if (message.transactionRate != null && message.hasOwnProperty("transactionRate"))
                if (typeof message.transactionRate === "number")
                    object.transactionRate = options.longs === String ? String(message.transactionRate) : message.transactionRate;
                else
                    object.transactionRate = options.longs === String ? $util.Long.prototype.toString.call(message.transactionRate) : options.longs === Number ? new $util.LongBits(message.transactionRate.low >>> 0, message.transactionRate.high >>> 0).toNumber(true) : message.transactionRate;
            return object;
        };

        /**
         * Converts this NetworkFee to JSON.
         * @function toJSON
         * @memberof common.NetworkFee
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        NetworkFee.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return NetworkFee;
    })();

    common.AttestNetworkFee = (function() {

        /**
         * Properties of an AttestNetworkFee.
         * @memberof common
         * @interface IAttestNetworkFee
         * @property {common.INetworkFee|null} [networkFee] AttestNetworkFee networkFee
         * @property {common.IAttestation|null} [attestation] AttestNetworkFee attestation
         */

        /**
         * Constructs a new AttestNetworkFee.
         * @memberof common
         * @classdesc Represents an AttestNetworkFee.
         * @implements IAttestNetworkFee
         * @constructor
         * @param {common.IAttestNetworkFee=} [properties] Properties to set
         */
        function AttestNetworkFee(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AttestNetworkFee networkFee.
         * @member {common.INetworkFee|null|undefined} networkFee
         * @memberof common.AttestNetworkFee
         * @instance
         */
        AttestNetworkFee.prototype.networkFee = null;

        /**
         * AttestNetworkFee attestation.
         * @member {common.IAttestation|null|undefined} attestation
         * @memberof common.AttestNetworkFee
         * @instance
         */
        AttestNetworkFee.prototype.attestation = null;

        /**
         * Creates a new AttestNetworkFee instance using the specified properties.
         * @function create
         * @memberof common.AttestNetworkFee
         * @static
         * @param {common.IAttestNetworkFee=} [properties] Properties to set
         * @returns {common.AttestNetworkFee} AttestNetworkFee instance
         */
        AttestNetworkFee.create = function create(properties) {
            return new AttestNetworkFee(properties);
        };

        /**
         * Encodes the specified AttestNetworkFee message. Does not implicitly {@link common.AttestNetworkFee.verify|verify} messages.
         * @function encode
         * @memberof common.AttestNetworkFee
         * @static
         * @param {common.IAttestNetworkFee} message AttestNetworkFee message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AttestNetworkFee.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.networkFee != null && Object.hasOwnProperty.call(message, "networkFee"))
                $root.common.NetworkFee.encode(message.networkFee, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.attestation != null && Object.hasOwnProperty.call(message, "attestation"))
                $root.common.Attestation.encode(message.attestation, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified AttestNetworkFee message, length delimited. Does not implicitly {@link common.AttestNetworkFee.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.AttestNetworkFee
         * @static
         * @param {common.IAttestNetworkFee} message AttestNetworkFee message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AttestNetworkFee.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AttestNetworkFee message from the specified reader or buffer.
         * @function decode
         * @memberof common.AttestNetworkFee
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.AttestNetworkFee} AttestNetworkFee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AttestNetworkFee.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.AttestNetworkFee();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.networkFee = $root.common.NetworkFee.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.attestation = $root.common.Attestation.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AttestNetworkFee message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.AttestNetworkFee
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.AttestNetworkFee} AttestNetworkFee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AttestNetworkFee.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AttestNetworkFee message.
         * @function verify
         * @memberof common.AttestNetworkFee
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AttestNetworkFee.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.networkFee != null && message.hasOwnProperty("networkFee")) {
                var error = $root.common.NetworkFee.verify(message.networkFee);
                if (error)
                    return "networkFee." + error;
            }
            if (message.attestation != null && message.hasOwnProperty("attestation")) {
                var error = $root.common.Attestation.verify(message.attestation);
                if (error)
                    return "attestation." + error;
            }
            return null;
        };

        /**
         * Creates an AttestNetworkFee message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.AttestNetworkFee
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.AttestNetworkFee} AttestNetworkFee
         */
        AttestNetworkFee.fromObject = function fromObject(object) {
            if (object instanceof $root.common.AttestNetworkFee)
                return object;
            var message = new $root.common.AttestNetworkFee();
            if (object.networkFee != null) {
                if (typeof object.networkFee !== "object")
                    throw TypeError(".common.AttestNetworkFee.networkFee: object expected");
                message.networkFee = $root.common.NetworkFee.fromObject(object.networkFee);
            }
            if (object.attestation != null) {
                if (typeof object.attestation !== "object")
                    throw TypeError(".common.AttestNetworkFee.attestation: object expected");
                message.attestation = $root.common.Attestation.fromObject(object.attestation);
            }
            return message;
        };

        /**
         * Creates a plain object from an AttestNetworkFee message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.AttestNetworkFee
         * @static
         * @param {common.AttestNetworkFee} message AttestNetworkFee
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AttestNetworkFee.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.networkFee = null;
                object.attestation = null;
            }
            if (message.networkFee != null && message.hasOwnProperty("networkFee"))
                object.networkFee = $root.common.NetworkFee.toObject(message.networkFee, options);
            if (message.attestation != null && message.hasOwnProperty("attestation"))
                object.attestation = $root.common.Attestation.toObject(message.attestation, options);
            return object;
        };

        /**
         * Converts this AttestNetworkFee to JSON.
         * @function toJSON
         * @memberof common.AttestNetworkFee
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AttestNetworkFee.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AttestNetworkFee;
    })();

    common.QuorumNetworkFee = (function() {

        /**
         * Properties of a QuorumNetworkFee.
         * @memberof common
         * @interface IQuorumNetworkFee
         * @property {common.INetworkFee|null} [networkFee] QuorumNetworkFee networkFee
         * @property {Array.<common.IAttestation>|null} [attestations] QuorumNetworkFee attestations
         */

        /**
         * Constructs a new QuorumNetworkFee.
         * @memberof common
         * @classdesc Represents a QuorumNetworkFee.
         * @implements IQuorumNetworkFee
         * @constructor
         * @param {common.IQuorumNetworkFee=} [properties] Properties to set
         */
        function QuorumNetworkFee(properties) {
            this.attestations = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * QuorumNetworkFee networkFee.
         * @member {common.INetworkFee|null|undefined} networkFee
         * @memberof common.QuorumNetworkFee
         * @instance
         */
        QuorumNetworkFee.prototype.networkFee = null;

        /**
         * QuorumNetworkFee attestations.
         * @member {Array.<common.IAttestation>} attestations
         * @memberof common.QuorumNetworkFee
         * @instance
         */
        QuorumNetworkFee.prototype.attestations = $util.emptyArray;

        /**
         * Creates a new QuorumNetworkFee instance using the specified properties.
         * @function create
         * @memberof common.QuorumNetworkFee
         * @static
         * @param {common.IQuorumNetworkFee=} [properties] Properties to set
         * @returns {common.QuorumNetworkFee} QuorumNetworkFee instance
         */
        QuorumNetworkFee.create = function create(properties) {
            return new QuorumNetworkFee(properties);
        };

        /**
         * Encodes the specified QuorumNetworkFee message. Does not implicitly {@link common.QuorumNetworkFee.verify|verify} messages.
         * @function encode
         * @memberof common.QuorumNetworkFee
         * @static
         * @param {common.IQuorumNetworkFee} message QuorumNetworkFee message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuorumNetworkFee.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.networkFee != null && Object.hasOwnProperty.call(message, "networkFee"))
                $root.common.NetworkFee.encode(message.networkFee, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.attestations != null && message.attestations.length)
                for (var i = 0; i < message.attestations.length; ++i)
                    $root.common.Attestation.encode(message.attestations[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified QuorumNetworkFee message, length delimited. Does not implicitly {@link common.QuorumNetworkFee.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.QuorumNetworkFee
         * @static
         * @param {common.IQuorumNetworkFee} message QuorumNetworkFee message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuorumNetworkFee.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a QuorumNetworkFee message from the specified reader or buffer.
         * @function decode
         * @memberof common.QuorumNetworkFee
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.QuorumNetworkFee} QuorumNetworkFee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuorumNetworkFee.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.QuorumNetworkFee();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.networkFee = $root.common.NetworkFee.decode(reader, reader.uint32());
                    break;
                case 2:
                    if (!(message.attestations && message.attestations.length))
                        message.attestations = [];
                    message.attestations.push($root.common.Attestation.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a QuorumNetworkFee message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.QuorumNetworkFee
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.QuorumNetworkFee} QuorumNetworkFee
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuorumNetworkFee.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a QuorumNetworkFee message.
         * @function verify
         * @memberof common.QuorumNetworkFee
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        QuorumNetworkFee.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.networkFee != null && message.hasOwnProperty("networkFee")) {
                var error = $root.common.NetworkFee.verify(message.networkFee);
                if (error)
                    return "networkFee." + error;
            }
            if (message.attestations != null && message.hasOwnProperty("attestations")) {
                if (!Array.isArray(message.attestations))
                    return "attestations: array expected";
                for (var i = 0; i < message.attestations.length; ++i) {
                    var error = $root.common.Attestation.verify(message.attestations[i]);
                    if (error)
                        return "attestations." + error;
                }
            }
            return null;
        };

        /**
         * Creates a QuorumNetworkFee message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.QuorumNetworkFee
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.QuorumNetworkFee} QuorumNetworkFee
         */
        QuorumNetworkFee.fromObject = function fromObject(object) {
            if (object instanceof $root.common.QuorumNetworkFee)
                return object;
            var message = new $root.common.QuorumNetworkFee();
            if (object.networkFee != null) {
                if (typeof object.networkFee !== "object")
                    throw TypeError(".common.QuorumNetworkFee.networkFee: object expected");
                message.networkFee = $root.common.NetworkFee.fromObject(object.networkFee);
            }
            if (object.attestations) {
                if (!Array.isArray(object.attestations))
                    throw TypeError(".common.QuorumNetworkFee.attestations: array expected");
                message.attestations = [];
                for (var i = 0; i < object.attestations.length; ++i) {
                    if (typeof object.attestations[i] !== "object")
                        throw TypeError(".common.QuorumNetworkFee.attestations: object expected");
                    message.attestations[i] = $root.common.Attestation.fromObject(object.attestations[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a QuorumNetworkFee message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.QuorumNetworkFee
         * @static
         * @param {common.QuorumNetworkFee} message QuorumNetworkFee
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        QuorumNetworkFee.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.attestations = [];
            if (options.defaults)
                object.networkFee = null;
            if (message.networkFee != null && message.hasOwnProperty("networkFee"))
                object.networkFee = $root.common.NetworkFee.toObject(message.networkFee, options);
            if (message.attestations && message.attestations.length) {
                object.attestations = [];
                for (var j = 0; j < message.attestations.length; ++j)
                    object.attestations[j] = $root.common.Attestation.toObject(message.attestations[j], options);
            }
            return object;
        };

        /**
         * Converts this QuorumNetworkFee to JSON.
         * @function toJSON
         * @memberof common.QuorumNetworkFee
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        QuorumNetworkFee.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return QuorumNetworkFee;
    })();

    common.Solvency = (function() {

        /**
         * Properties of a Solvency.
         * @memberof common
         * @interface ISolvency
         * @property {string|null} [id] Solvency id
         * @property {string|null} [chain] Solvency chain
         * @property {string|null} [pubKey] Solvency pubKey
         * @property {Array.<common.ICoin>|null} [coins] Solvency coins
         * @property {number|Long|null} [height] Solvency height
         */

        /**
         * Constructs a new Solvency.
         * @memberof common
         * @classdesc Represents a Solvency.
         * @implements ISolvency
         * @constructor
         * @param {common.ISolvency=} [properties] Properties to set
         */
        function Solvency(properties) {
            this.coins = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Solvency id.
         * @member {string} id
         * @memberof common.Solvency
         * @instance
         */
        Solvency.prototype.id = "";

        /**
         * Solvency chain.
         * @member {string} chain
         * @memberof common.Solvency
         * @instance
         */
        Solvency.prototype.chain = "";

        /**
         * Solvency pubKey.
         * @member {string} pubKey
         * @memberof common.Solvency
         * @instance
         */
        Solvency.prototype.pubKey = "";

        /**
         * Solvency coins.
         * @member {Array.<common.ICoin>} coins
         * @memberof common.Solvency
         * @instance
         */
        Solvency.prototype.coins = $util.emptyArray;

        /**
         * Solvency height.
         * @member {number|Long} height
         * @memberof common.Solvency
         * @instance
         */
        Solvency.prototype.height = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Creates a new Solvency instance using the specified properties.
         * @function create
         * @memberof common.Solvency
         * @static
         * @param {common.ISolvency=} [properties] Properties to set
         * @returns {common.Solvency} Solvency instance
         */
        Solvency.create = function create(properties) {
            return new Solvency(properties);
        };

        /**
         * Encodes the specified Solvency message. Does not implicitly {@link common.Solvency.verify|verify} messages.
         * @function encode
         * @memberof common.Solvency
         * @static
         * @param {common.ISolvency} message Solvency message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Solvency.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.chain != null && Object.hasOwnProperty.call(message, "chain"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.chain);
            if (message.pubKey != null && Object.hasOwnProperty.call(message, "pubKey"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.pubKey);
            if (message.coins != null && message.coins.length)
                for (var i = 0; i < message.coins.length; ++i)
                    $root.common.Coin.encode(message.coins[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.height != null && Object.hasOwnProperty.call(message, "height"))
                writer.uint32(/* id 5, wireType 0 =*/40).int64(message.height);
            return writer;
        };

        /**
         * Encodes the specified Solvency message, length delimited. Does not implicitly {@link common.Solvency.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.Solvency
         * @static
         * @param {common.ISolvency} message Solvency message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Solvency.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Solvency message from the specified reader or buffer.
         * @function decode
         * @memberof common.Solvency
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.Solvency} Solvency
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Solvency.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.Solvency();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.chain = reader.string();
                    break;
                case 3:
                    message.pubKey = reader.string();
                    break;
                case 4:
                    if (!(message.coins && message.coins.length))
                        message.coins = [];
                    message.coins.push($root.common.Coin.decode(reader, reader.uint32()));
                    break;
                case 5:
                    message.height = reader.int64();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Solvency message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.Solvency
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.Solvency} Solvency
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Solvency.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Solvency message.
         * @function verify
         * @memberof common.Solvency
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Solvency.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.chain != null && message.hasOwnProperty("chain"))
                if (!$util.isString(message.chain))
                    return "chain: string expected";
            if (message.pubKey != null && message.hasOwnProperty("pubKey"))
                if (!$util.isString(message.pubKey))
                    return "pubKey: string expected";
            if (message.coins != null && message.hasOwnProperty("coins")) {
                if (!Array.isArray(message.coins))
                    return "coins: array expected";
                for (var i = 0; i < message.coins.length; ++i) {
                    var error = $root.common.Coin.verify(message.coins[i]);
                    if (error)
                        return "coins." + error;
                }
            }
            if (message.height != null && message.hasOwnProperty("height"))
                if (!$util.isInteger(message.height) && !(message.height && $util.isInteger(message.height.low) && $util.isInteger(message.height.high)))
                    return "height: integer|Long expected";
            return null;
        };

        /**
         * Creates a Solvency message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.Solvency
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.Solvency} Solvency
         */
        Solvency.fromObject = function fromObject(object) {
            if (object instanceof $root.common.Solvency)
                return object;
            var message = new $root.common.Solvency();
            if (object.id != null)
                message.id = String(object.id);
            if (object.chain != null)
                message.chain = String(object.chain);
            if (object.pubKey != null)
                message.pubKey = String(object.pubKey);
            if (object.coins) {
                if (!Array.isArray(object.coins))
                    throw TypeError(".common.Solvency.coins: array expected");
                message.coins = [];
                for (var i = 0; i < object.coins.length; ++i) {
                    if (typeof object.coins[i] !== "object")
                        throw TypeError(".common.Solvency.coins: object expected");
                    message.coins[i] = $root.common.Coin.fromObject(object.coins[i]);
                }
            }
            if (object.height != null)
                if ($util.Long)
                    (message.height = $util.Long.fromValue(object.height)).unsigned = false;
                else if (typeof object.height === "string")
                    message.height = parseInt(object.height, 10);
                else if (typeof object.height === "number")
                    message.height = object.height;
                else if (typeof object.height === "object")
                    message.height = new $util.LongBits(object.height.low >>> 0, object.height.high >>> 0).toNumber();
            return message;
        };

        /**
         * Creates a plain object from a Solvency message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.Solvency
         * @static
         * @param {common.Solvency} message Solvency
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Solvency.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.coins = [];
            if (options.defaults) {
                object.id = "";
                object.chain = "";
                object.pubKey = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.height = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.height = options.longs === String ? "0" : 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.chain != null && message.hasOwnProperty("chain"))
                object.chain = message.chain;
            if (message.pubKey != null && message.hasOwnProperty("pubKey"))
                object.pubKey = message.pubKey;
            if (message.coins && message.coins.length) {
                object.coins = [];
                for (var j = 0; j < message.coins.length; ++j)
                    object.coins[j] = $root.common.Coin.toObject(message.coins[j], options);
            }
            if (message.height != null && message.hasOwnProperty("height"))
                if (typeof message.height === "number")
                    object.height = options.longs === String ? String(message.height) : message.height;
                else
                    object.height = options.longs === String ? $util.Long.prototype.toString.call(message.height) : options.longs === Number ? new $util.LongBits(message.height.low >>> 0, message.height.high >>> 0).toNumber() : message.height;
            return object;
        };

        /**
         * Converts this Solvency to JSON.
         * @function toJSON
         * @memberof common.Solvency
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Solvency.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Solvency;
    })();

    common.AttestSolvency = (function() {

        /**
         * Properties of an AttestSolvency.
         * @memberof common
         * @interface IAttestSolvency
         * @property {common.ISolvency|null} [solvency] AttestSolvency solvency
         * @property {common.IAttestation|null} [attestation] AttestSolvency attestation
         */

        /**
         * Constructs a new AttestSolvency.
         * @memberof common
         * @classdesc Represents an AttestSolvency.
         * @implements IAttestSolvency
         * @constructor
         * @param {common.IAttestSolvency=} [properties] Properties to set
         */
        function AttestSolvency(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AttestSolvency solvency.
         * @member {common.ISolvency|null|undefined} solvency
         * @memberof common.AttestSolvency
         * @instance
         */
        AttestSolvency.prototype.solvency = null;

        /**
         * AttestSolvency attestation.
         * @member {common.IAttestation|null|undefined} attestation
         * @memberof common.AttestSolvency
         * @instance
         */
        AttestSolvency.prototype.attestation = null;

        /**
         * Creates a new AttestSolvency instance using the specified properties.
         * @function create
         * @memberof common.AttestSolvency
         * @static
         * @param {common.IAttestSolvency=} [properties] Properties to set
         * @returns {common.AttestSolvency} AttestSolvency instance
         */
        AttestSolvency.create = function create(properties) {
            return new AttestSolvency(properties);
        };

        /**
         * Encodes the specified AttestSolvency message. Does not implicitly {@link common.AttestSolvency.verify|verify} messages.
         * @function encode
         * @memberof common.AttestSolvency
         * @static
         * @param {common.IAttestSolvency} message AttestSolvency message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AttestSolvency.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.solvency != null && Object.hasOwnProperty.call(message, "solvency"))
                $root.common.Solvency.encode(message.solvency, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.attestation != null && Object.hasOwnProperty.call(message, "attestation"))
                $root.common.Attestation.encode(message.attestation, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified AttestSolvency message, length delimited. Does not implicitly {@link common.AttestSolvency.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.AttestSolvency
         * @static
         * @param {common.IAttestSolvency} message AttestSolvency message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AttestSolvency.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AttestSolvency message from the specified reader or buffer.
         * @function decode
         * @memberof common.AttestSolvency
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.AttestSolvency} AttestSolvency
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AttestSolvency.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.AttestSolvency();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.solvency = $root.common.Solvency.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.attestation = $root.common.Attestation.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AttestSolvency message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.AttestSolvency
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.AttestSolvency} AttestSolvency
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AttestSolvency.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AttestSolvency message.
         * @function verify
         * @memberof common.AttestSolvency
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AttestSolvency.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.solvency != null && message.hasOwnProperty("solvency")) {
                var error = $root.common.Solvency.verify(message.solvency);
                if (error)
                    return "solvency." + error;
            }
            if (message.attestation != null && message.hasOwnProperty("attestation")) {
                var error = $root.common.Attestation.verify(message.attestation);
                if (error)
                    return "attestation." + error;
            }
            return null;
        };

        /**
         * Creates an AttestSolvency message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.AttestSolvency
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.AttestSolvency} AttestSolvency
         */
        AttestSolvency.fromObject = function fromObject(object) {
            if (object instanceof $root.common.AttestSolvency)
                return object;
            var message = new $root.common.AttestSolvency();
            if (object.solvency != null) {
                if (typeof object.solvency !== "object")
                    throw TypeError(".common.AttestSolvency.solvency: object expected");
                message.solvency = $root.common.Solvency.fromObject(object.solvency);
            }
            if (object.attestation != null) {
                if (typeof object.attestation !== "object")
                    throw TypeError(".common.AttestSolvency.attestation: object expected");
                message.attestation = $root.common.Attestation.fromObject(object.attestation);
            }
            return message;
        };

        /**
         * Creates a plain object from an AttestSolvency message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.AttestSolvency
         * @static
         * @param {common.AttestSolvency} message AttestSolvency
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AttestSolvency.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.solvency = null;
                object.attestation = null;
            }
            if (message.solvency != null && message.hasOwnProperty("solvency"))
                object.solvency = $root.common.Solvency.toObject(message.solvency, options);
            if (message.attestation != null && message.hasOwnProperty("attestation"))
                object.attestation = $root.common.Attestation.toObject(message.attestation, options);
            return object;
        };

        /**
         * Converts this AttestSolvency to JSON.
         * @function toJSON
         * @memberof common.AttestSolvency
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AttestSolvency.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AttestSolvency;
    })();

    common.QuorumSolvency = (function() {

        /**
         * Properties of a QuorumSolvency.
         * @memberof common
         * @interface IQuorumSolvency
         * @property {common.ISolvency|null} [solvency] QuorumSolvency solvency
         * @property {Array.<common.IAttestation>|null} [attestations] QuorumSolvency attestations
         */

        /**
         * Constructs a new QuorumSolvency.
         * @memberof common
         * @classdesc Represents a QuorumSolvency.
         * @implements IQuorumSolvency
         * @constructor
         * @param {common.IQuorumSolvency=} [properties] Properties to set
         */
        function QuorumSolvency(properties) {
            this.attestations = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * QuorumSolvency solvency.
         * @member {common.ISolvency|null|undefined} solvency
         * @memberof common.QuorumSolvency
         * @instance
         */
        QuorumSolvency.prototype.solvency = null;

        /**
         * QuorumSolvency attestations.
         * @member {Array.<common.IAttestation>} attestations
         * @memberof common.QuorumSolvency
         * @instance
         */
        QuorumSolvency.prototype.attestations = $util.emptyArray;

        /**
         * Creates a new QuorumSolvency instance using the specified properties.
         * @function create
         * @memberof common.QuorumSolvency
         * @static
         * @param {common.IQuorumSolvency=} [properties] Properties to set
         * @returns {common.QuorumSolvency} QuorumSolvency instance
         */
        QuorumSolvency.create = function create(properties) {
            return new QuorumSolvency(properties);
        };

        /**
         * Encodes the specified QuorumSolvency message. Does not implicitly {@link common.QuorumSolvency.verify|verify} messages.
         * @function encode
         * @memberof common.QuorumSolvency
         * @static
         * @param {common.IQuorumSolvency} message QuorumSolvency message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuorumSolvency.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.solvency != null && Object.hasOwnProperty.call(message, "solvency"))
                $root.common.Solvency.encode(message.solvency, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.attestations != null && message.attestations.length)
                for (var i = 0; i < message.attestations.length; ++i)
                    $root.common.Attestation.encode(message.attestations[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified QuorumSolvency message, length delimited. Does not implicitly {@link common.QuorumSolvency.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.QuorumSolvency
         * @static
         * @param {common.IQuorumSolvency} message QuorumSolvency message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuorumSolvency.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a QuorumSolvency message from the specified reader or buffer.
         * @function decode
         * @memberof common.QuorumSolvency
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.QuorumSolvency} QuorumSolvency
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuorumSolvency.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.QuorumSolvency();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.solvency = $root.common.Solvency.decode(reader, reader.uint32());
                    break;
                case 2:
                    if (!(message.attestations && message.attestations.length))
                        message.attestations = [];
                    message.attestations.push($root.common.Attestation.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a QuorumSolvency message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.QuorumSolvency
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.QuorumSolvency} QuorumSolvency
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuorumSolvency.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a QuorumSolvency message.
         * @function verify
         * @memberof common.QuorumSolvency
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        QuorumSolvency.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.solvency != null && message.hasOwnProperty("solvency")) {
                var error = $root.common.Solvency.verify(message.solvency);
                if (error)
                    return "solvency." + error;
            }
            if (message.attestations != null && message.hasOwnProperty("attestations")) {
                if (!Array.isArray(message.attestations))
                    return "attestations: array expected";
                for (var i = 0; i < message.attestations.length; ++i) {
                    var error = $root.common.Attestation.verify(message.attestations[i]);
                    if (error)
                        return "attestations." + error;
                }
            }
            return null;
        };

        /**
         * Creates a QuorumSolvency message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.QuorumSolvency
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.QuorumSolvency} QuorumSolvency
         */
        QuorumSolvency.fromObject = function fromObject(object) {
            if (object instanceof $root.common.QuorumSolvency)
                return object;
            var message = new $root.common.QuorumSolvency();
            if (object.solvency != null) {
                if (typeof object.solvency !== "object")
                    throw TypeError(".common.QuorumSolvency.solvency: object expected");
                message.solvency = $root.common.Solvency.fromObject(object.solvency);
            }
            if (object.attestations) {
                if (!Array.isArray(object.attestations))
                    throw TypeError(".common.QuorumSolvency.attestations: array expected");
                message.attestations = [];
                for (var i = 0; i < object.attestations.length; ++i) {
                    if (typeof object.attestations[i] !== "object")
                        throw TypeError(".common.QuorumSolvency.attestations: object expected");
                    message.attestations[i] = $root.common.Attestation.fromObject(object.attestations[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a QuorumSolvency message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.QuorumSolvency
         * @static
         * @param {common.QuorumSolvency} message QuorumSolvency
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        QuorumSolvency.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.attestations = [];
            if (options.defaults)
                object.solvency = null;
            if (message.solvency != null && message.hasOwnProperty("solvency"))
                object.solvency = $root.common.Solvency.toObject(message.solvency, options);
            if (message.attestations && message.attestations.length) {
                object.attestations = [];
                for (var j = 0; j < message.attestations.length; ++j)
                    object.attestations[j] = $root.common.Attestation.toObject(message.attestations[j], options);
            }
            return object;
        };

        /**
         * Converts this QuorumSolvency to JSON.
         * @function toJSON
         * @memberof common.QuorumSolvency
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        QuorumSolvency.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return QuorumSolvency;
    })();

    common.ErrataTx = (function() {

        /**
         * Properties of an ErrataTx.
         * @memberof common
         * @interface IErrataTx
         * @property {string|null} [id] ErrataTx id
         * @property {string|null} [chain] ErrataTx chain
         */

        /**
         * Constructs a new ErrataTx.
         * @memberof common
         * @classdesc Represents an ErrataTx.
         * @implements IErrataTx
         * @constructor
         * @param {common.IErrataTx=} [properties] Properties to set
         */
        function ErrataTx(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * ErrataTx id.
         * @member {string} id
         * @memberof common.ErrataTx
         * @instance
         */
        ErrataTx.prototype.id = "";

        /**
         * ErrataTx chain.
         * @member {string} chain
         * @memberof common.ErrataTx
         * @instance
         */
        ErrataTx.prototype.chain = "";

        /**
         * Creates a new ErrataTx instance using the specified properties.
         * @function create
         * @memberof common.ErrataTx
         * @static
         * @param {common.IErrataTx=} [properties] Properties to set
         * @returns {common.ErrataTx} ErrataTx instance
         */
        ErrataTx.create = function create(properties) {
            return new ErrataTx(properties);
        };

        /**
         * Encodes the specified ErrataTx message. Does not implicitly {@link common.ErrataTx.verify|verify} messages.
         * @function encode
         * @memberof common.ErrataTx
         * @static
         * @param {common.IErrataTx} message ErrataTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ErrataTx.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.chain != null && Object.hasOwnProperty.call(message, "chain"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.chain);
            return writer;
        };

        /**
         * Encodes the specified ErrataTx message, length delimited. Does not implicitly {@link common.ErrataTx.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.ErrataTx
         * @static
         * @param {common.IErrataTx} message ErrataTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        ErrataTx.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an ErrataTx message from the specified reader or buffer.
         * @function decode
         * @memberof common.ErrataTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.ErrataTx} ErrataTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ErrataTx.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.ErrataTx();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.string();
                    break;
                case 2:
                    message.chain = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an ErrataTx message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.ErrataTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.ErrataTx} ErrataTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        ErrataTx.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an ErrataTx message.
         * @function verify
         * @memberof common.ErrataTx
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        ErrataTx.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.chain != null && message.hasOwnProperty("chain"))
                if (!$util.isString(message.chain))
                    return "chain: string expected";
            return null;
        };

        /**
         * Creates an ErrataTx message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.ErrataTx
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.ErrataTx} ErrataTx
         */
        ErrataTx.fromObject = function fromObject(object) {
            if (object instanceof $root.common.ErrataTx)
                return object;
            var message = new $root.common.ErrataTx();
            if (object.id != null)
                message.id = String(object.id);
            if (object.chain != null)
                message.chain = String(object.chain);
            return message;
        };

        /**
         * Creates a plain object from an ErrataTx message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.ErrataTx
         * @static
         * @param {common.ErrataTx} message ErrataTx
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        ErrataTx.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.id = "";
                object.chain = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.chain != null && message.hasOwnProperty("chain"))
                object.chain = message.chain;
            return object;
        };

        /**
         * Converts this ErrataTx to JSON.
         * @function toJSON
         * @memberof common.ErrataTx
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        ErrataTx.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return ErrataTx;
    })();

    common.AttestErrataTx = (function() {

        /**
         * Properties of an AttestErrataTx.
         * @memberof common
         * @interface IAttestErrataTx
         * @property {common.IErrataTx|null} [errataTx] AttestErrataTx errataTx
         * @property {common.IAttestation|null} [attestation] AttestErrataTx attestation
         */

        /**
         * Constructs a new AttestErrataTx.
         * @memberof common
         * @classdesc Represents an AttestErrataTx.
         * @implements IAttestErrataTx
         * @constructor
         * @param {common.IAttestErrataTx=} [properties] Properties to set
         */
        function AttestErrataTx(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AttestErrataTx errataTx.
         * @member {common.IErrataTx|null|undefined} errataTx
         * @memberof common.AttestErrataTx
         * @instance
         */
        AttestErrataTx.prototype.errataTx = null;

        /**
         * AttestErrataTx attestation.
         * @member {common.IAttestation|null|undefined} attestation
         * @memberof common.AttestErrataTx
         * @instance
         */
        AttestErrataTx.prototype.attestation = null;

        /**
         * Creates a new AttestErrataTx instance using the specified properties.
         * @function create
         * @memberof common.AttestErrataTx
         * @static
         * @param {common.IAttestErrataTx=} [properties] Properties to set
         * @returns {common.AttestErrataTx} AttestErrataTx instance
         */
        AttestErrataTx.create = function create(properties) {
            return new AttestErrataTx(properties);
        };

        /**
         * Encodes the specified AttestErrataTx message. Does not implicitly {@link common.AttestErrataTx.verify|verify} messages.
         * @function encode
         * @memberof common.AttestErrataTx
         * @static
         * @param {common.IAttestErrataTx} message AttestErrataTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AttestErrataTx.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.errataTx != null && Object.hasOwnProperty.call(message, "errataTx"))
                $root.common.ErrataTx.encode(message.errataTx, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.attestation != null && Object.hasOwnProperty.call(message, "attestation"))
                $root.common.Attestation.encode(message.attestation, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified AttestErrataTx message, length delimited. Does not implicitly {@link common.AttestErrataTx.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.AttestErrataTx
         * @static
         * @param {common.IAttestErrataTx} message AttestErrataTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AttestErrataTx.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AttestErrataTx message from the specified reader or buffer.
         * @function decode
         * @memberof common.AttestErrataTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.AttestErrataTx} AttestErrataTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AttestErrataTx.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.AttestErrataTx();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.errataTx = $root.common.ErrataTx.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.attestation = $root.common.Attestation.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AttestErrataTx message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.AttestErrataTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.AttestErrataTx} AttestErrataTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AttestErrataTx.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AttestErrataTx message.
         * @function verify
         * @memberof common.AttestErrataTx
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AttestErrataTx.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.errataTx != null && message.hasOwnProperty("errataTx")) {
                var error = $root.common.ErrataTx.verify(message.errataTx);
                if (error)
                    return "errataTx." + error;
            }
            if (message.attestation != null && message.hasOwnProperty("attestation")) {
                var error = $root.common.Attestation.verify(message.attestation);
                if (error)
                    return "attestation." + error;
            }
            return null;
        };

        /**
         * Creates an AttestErrataTx message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.AttestErrataTx
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.AttestErrataTx} AttestErrataTx
         */
        AttestErrataTx.fromObject = function fromObject(object) {
            if (object instanceof $root.common.AttestErrataTx)
                return object;
            var message = new $root.common.AttestErrataTx();
            if (object.errataTx != null) {
                if (typeof object.errataTx !== "object")
                    throw TypeError(".common.AttestErrataTx.errataTx: object expected");
                message.errataTx = $root.common.ErrataTx.fromObject(object.errataTx);
            }
            if (object.attestation != null) {
                if (typeof object.attestation !== "object")
                    throw TypeError(".common.AttestErrataTx.attestation: object expected");
                message.attestation = $root.common.Attestation.fromObject(object.attestation);
            }
            return message;
        };

        /**
         * Creates a plain object from an AttestErrataTx message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.AttestErrataTx
         * @static
         * @param {common.AttestErrataTx} message AttestErrataTx
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AttestErrataTx.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.errataTx = null;
                object.attestation = null;
            }
            if (message.errataTx != null && message.hasOwnProperty("errataTx"))
                object.errataTx = $root.common.ErrataTx.toObject(message.errataTx, options);
            if (message.attestation != null && message.hasOwnProperty("attestation"))
                object.attestation = $root.common.Attestation.toObject(message.attestation, options);
            return object;
        };

        /**
         * Converts this AttestErrataTx to JSON.
         * @function toJSON
         * @memberof common.AttestErrataTx
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AttestErrataTx.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AttestErrataTx;
    })();

    common.QuorumErrataTx = (function() {

        /**
         * Properties of a QuorumErrataTx.
         * @memberof common
         * @interface IQuorumErrataTx
         * @property {common.IErrataTx|null} [errataTx] QuorumErrataTx errataTx
         * @property {Array.<common.IAttestation>|null} [attestations] QuorumErrataTx attestations
         */

        /**
         * Constructs a new QuorumErrataTx.
         * @memberof common
         * @classdesc Represents a QuorumErrataTx.
         * @implements IQuorumErrataTx
         * @constructor
         * @param {common.IQuorumErrataTx=} [properties] Properties to set
         */
        function QuorumErrataTx(properties) {
            this.attestations = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * QuorumErrataTx errataTx.
         * @member {common.IErrataTx|null|undefined} errataTx
         * @memberof common.QuorumErrataTx
         * @instance
         */
        QuorumErrataTx.prototype.errataTx = null;

        /**
         * QuorumErrataTx attestations.
         * @member {Array.<common.IAttestation>} attestations
         * @memberof common.QuorumErrataTx
         * @instance
         */
        QuorumErrataTx.prototype.attestations = $util.emptyArray;

        /**
         * Creates a new QuorumErrataTx instance using the specified properties.
         * @function create
         * @memberof common.QuorumErrataTx
         * @static
         * @param {common.IQuorumErrataTx=} [properties] Properties to set
         * @returns {common.QuorumErrataTx} QuorumErrataTx instance
         */
        QuorumErrataTx.create = function create(properties) {
            return new QuorumErrataTx(properties);
        };

        /**
         * Encodes the specified QuorumErrataTx message. Does not implicitly {@link common.QuorumErrataTx.verify|verify} messages.
         * @function encode
         * @memberof common.QuorumErrataTx
         * @static
         * @param {common.IQuorumErrataTx} message QuorumErrataTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuorumErrataTx.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.errataTx != null && Object.hasOwnProperty.call(message, "errataTx"))
                $root.common.ErrataTx.encode(message.errataTx, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.attestations != null && message.attestations.length)
                for (var i = 0; i < message.attestations.length; ++i)
                    $root.common.Attestation.encode(message.attestations[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified QuorumErrataTx message, length delimited. Does not implicitly {@link common.QuorumErrataTx.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.QuorumErrataTx
         * @static
         * @param {common.IQuorumErrataTx} message QuorumErrataTx message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        QuorumErrataTx.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a QuorumErrataTx message from the specified reader or buffer.
         * @function decode
         * @memberof common.QuorumErrataTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.QuorumErrataTx} QuorumErrataTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuorumErrataTx.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.QuorumErrataTx();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.errataTx = $root.common.ErrataTx.decode(reader, reader.uint32());
                    break;
                case 2:
                    if (!(message.attestations && message.attestations.length))
                        message.attestations = [];
                    message.attestations.push($root.common.Attestation.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a QuorumErrataTx message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.QuorumErrataTx
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.QuorumErrataTx} QuorumErrataTx
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        QuorumErrataTx.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a QuorumErrataTx message.
         * @function verify
         * @memberof common.QuorumErrataTx
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        QuorumErrataTx.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.errataTx != null && message.hasOwnProperty("errataTx")) {
                var error = $root.common.ErrataTx.verify(message.errataTx);
                if (error)
                    return "errataTx." + error;
            }
            if (message.attestations != null && message.hasOwnProperty("attestations")) {
                if (!Array.isArray(message.attestations))
                    return "attestations: array expected";
                for (var i = 0; i < message.attestations.length; ++i) {
                    var error = $root.common.Attestation.verify(message.attestations[i]);
                    if (error)
                        return "attestations." + error;
                }
            }
            return null;
        };

        /**
         * Creates a QuorumErrataTx message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.QuorumErrataTx
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.QuorumErrataTx} QuorumErrataTx
         */
        QuorumErrataTx.fromObject = function fromObject(object) {
            if (object instanceof $root.common.QuorumErrataTx)
                return object;
            var message = new $root.common.QuorumErrataTx();
            if (object.errataTx != null) {
                if (typeof object.errataTx !== "object")
                    throw TypeError(".common.QuorumErrataTx.errataTx: object expected");
                message.errataTx = $root.common.ErrataTx.fromObject(object.errataTx);
            }
            if (object.attestations) {
                if (!Array.isArray(object.attestations))
                    throw TypeError(".common.QuorumErrataTx.attestations: array expected");
                message.attestations = [];
                for (var i = 0; i < object.attestations.length; ++i) {
                    if (typeof object.attestations[i] !== "object")
                        throw TypeError(".common.QuorumErrataTx.attestations: object expected");
                    message.attestations[i] = $root.common.Attestation.fromObject(object.attestations[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a QuorumErrataTx message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.QuorumErrataTx
         * @static
         * @param {common.QuorumErrataTx} message QuorumErrataTx
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        QuorumErrataTx.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.attestations = [];
            if (options.defaults)
                object.errataTx = null;
            if (message.errataTx != null && message.hasOwnProperty("errataTx"))
                object.errataTx = $root.common.ErrataTx.toObject(message.errataTx, options);
            if (message.attestations && message.attestations.length) {
                object.attestations = [];
                for (var j = 0; j < message.attestations.length; ++j)
                    object.attestations[j] = $root.common.Attestation.toObject(message.attestations[j], options);
            }
            return object;
        };

        /**
         * Converts this QuorumErrataTx to JSON.
         * @function toJSON
         * @memberof common.QuorumErrataTx
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        QuorumErrataTx.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return QuorumErrataTx;
    })();

    common.AttestationBatch = (function() {

        /**
         * Properties of an AttestationBatch.
         * @memberof common
         * @interface IAttestationBatch
         * @property {Array.<common.IAttestTx>|null} [attestTxs] AttestationBatch attestTxs
         * @property {Array.<common.IAttestNetworkFee>|null} [attestNetworkFees] AttestationBatch attestNetworkFees
         * @property {Array.<common.IAttestSolvency>|null} [attestSolvencies] AttestationBatch attestSolvencies
         * @property {Array.<common.IAttestErrataTx>|null} [attestErrataTxs] AttestationBatch attestErrataTxs
         */

        /**
         * Constructs a new AttestationBatch.
         * @memberof common
         * @classdesc Represents an AttestationBatch.
         * @implements IAttestationBatch
         * @constructor
         * @param {common.IAttestationBatch=} [properties] Properties to set
         */
        function AttestationBatch(properties) {
            this.attestTxs = [];
            this.attestNetworkFees = [];
            this.attestSolvencies = [];
            this.attestErrataTxs = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AttestationBatch attestTxs.
         * @member {Array.<common.IAttestTx>} attestTxs
         * @memberof common.AttestationBatch
         * @instance
         */
        AttestationBatch.prototype.attestTxs = $util.emptyArray;

        /**
         * AttestationBatch attestNetworkFees.
         * @member {Array.<common.IAttestNetworkFee>} attestNetworkFees
         * @memberof common.AttestationBatch
         * @instance
         */
        AttestationBatch.prototype.attestNetworkFees = $util.emptyArray;

        /**
         * AttestationBatch attestSolvencies.
         * @member {Array.<common.IAttestSolvency>} attestSolvencies
         * @memberof common.AttestationBatch
         * @instance
         */
        AttestationBatch.prototype.attestSolvencies = $util.emptyArray;

        /**
         * AttestationBatch attestErrataTxs.
         * @member {Array.<common.IAttestErrataTx>} attestErrataTxs
         * @memberof common.AttestationBatch
         * @instance
         */
        AttestationBatch.prototype.attestErrataTxs = $util.emptyArray;

        /**
         * Creates a new AttestationBatch instance using the specified properties.
         * @function create
         * @memberof common.AttestationBatch
         * @static
         * @param {common.IAttestationBatch=} [properties] Properties to set
         * @returns {common.AttestationBatch} AttestationBatch instance
         */
        AttestationBatch.create = function create(properties) {
            return new AttestationBatch(properties);
        };

        /**
         * Encodes the specified AttestationBatch message. Does not implicitly {@link common.AttestationBatch.verify|verify} messages.
         * @function encode
         * @memberof common.AttestationBatch
         * @static
         * @param {common.IAttestationBatch} message AttestationBatch message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AttestationBatch.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.attestTxs != null && message.attestTxs.length)
                for (var i = 0; i < message.attestTxs.length; ++i)
                    $root.common.AttestTx.encode(message.attestTxs[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.attestNetworkFees != null && message.attestNetworkFees.length)
                for (var i = 0; i < message.attestNetworkFees.length; ++i)
                    $root.common.AttestNetworkFee.encode(message.attestNetworkFees[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.attestSolvencies != null && message.attestSolvencies.length)
                for (var i = 0; i < message.attestSolvencies.length; ++i)
                    $root.common.AttestSolvency.encode(message.attestSolvencies[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.attestErrataTxs != null && message.attestErrataTxs.length)
                for (var i = 0; i < message.attestErrataTxs.length; ++i)
                    $root.common.AttestErrataTx.encode(message.attestErrataTxs[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified AttestationBatch message, length delimited. Does not implicitly {@link common.AttestationBatch.verify|verify} messages.
         * @function encodeDelimited
         * @memberof common.AttestationBatch
         * @static
         * @param {common.IAttestationBatch} message AttestationBatch message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AttestationBatch.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AttestationBatch message from the specified reader or buffer.
         * @function decode
         * @memberof common.AttestationBatch
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {common.AttestationBatch} AttestationBatch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AttestationBatch.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.common.AttestationBatch();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.attestTxs && message.attestTxs.length))
                        message.attestTxs = [];
                    message.attestTxs.push($root.common.AttestTx.decode(reader, reader.uint32()));
                    break;
                case 2:
                    if (!(message.attestNetworkFees && message.attestNetworkFees.length))
                        message.attestNetworkFees = [];
                    message.attestNetworkFees.push($root.common.AttestNetworkFee.decode(reader, reader.uint32()));
                    break;
                case 3:
                    if (!(message.attestSolvencies && message.attestSolvencies.length))
                        message.attestSolvencies = [];
                    message.attestSolvencies.push($root.common.AttestSolvency.decode(reader, reader.uint32()));
                    break;
                case 4:
                    if (!(message.attestErrataTxs && message.attestErrataTxs.length))
                        message.attestErrataTxs = [];
                    message.attestErrataTxs.push($root.common.AttestErrataTx.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AttestationBatch message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof common.AttestationBatch
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {common.AttestationBatch} AttestationBatch
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AttestationBatch.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AttestationBatch message.
         * @function verify
         * @memberof common.AttestationBatch
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AttestationBatch.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.attestTxs != null && message.hasOwnProperty("attestTxs")) {
                if (!Array.isArray(message.attestTxs))
                    return "attestTxs: array expected";
                for (var i = 0; i < message.attestTxs.length; ++i) {
                    var error = $root.common.AttestTx.verify(message.attestTxs[i]);
                    if (error)
                        return "attestTxs." + error;
                }
            }
            if (message.attestNetworkFees != null && message.hasOwnProperty("attestNetworkFees")) {
                if (!Array.isArray(message.attestNetworkFees))
                    return "attestNetworkFees: array expected";
                for (var i = 0; i < message.attestNetworkFees.length; ++i) {
                    var error = $root.common.AttestNetworkFee.verify(message.attestNetworkFees[i]);
                    if (error)
                        return "attestNetworkFees." + error;
                }
            }
            if (message.attestSolvencies != null && message.hasOwnProperty("attestSolvencies")) {
                if (!Array.isArray(message.attestSolvencies))
                    return "attestSolvencies: array expected";
                for (var i = 0; i < message.attestSolvencies.length; ++i) {
                    var error = $root.common.AttestSolvency.verify(message.attestSolvencies[i]);
                    if (error)
                        return "attestSolvencies." + error;
                }
            }
            if (message.attestErrataTxs != null && message.hasOwnProperty("attestErrataTxs")) {
                if (!Array.isArray(message.attestErrataTxs))
                    return "attestErrataTxs: array expected";
                for (var i = 0; i < message.attestErrataTxs.length; ++i) {
                    var error = $root.common.AttestErrataTx.verify(message.attestErrataTxs[i]);
                    if (error)
                        return "attestErrataTxs." + error;
                }
            }
            return null;
        };

        /**
         * Creates an AttestationBatch message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof common.AttestationBatch
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {common.AttestationBatch} AttestationBatch
         */
        AttestationBatch.fromObject = function fromObject(object) {
            if (object instanceof $root.common.AttestationBatch)
                return object;
            var message = new $root.common.AttestationBatch();
            if (object.attestTxs) {
                if (!Array.isArray(object.attestTxs))
                    throw TypeError(".common.AttestationBatch.attestTxs: array expected");
                message.attestTxs = [];
                for (var i = 0; i < object.attestTxs.length; ++i) {
                    if (typeof object.attestTxs[i] !== "object")
                        throw TypeError(".common.AttestationBatch.attestTxs: object expected");
                    message.attestTxs[i] = $root.common.AttestTx.fromObject(object.attestTxs[i]);
                }
            }
            if (object.attestNetworkFees) {
                if (!Array.isArray(object.attestNetworkFees))
                    throw TypeError(".common.AttestationBatch.attestNetworkFees: array expected");
                message.attestNetworkFees = [];
                for (var i = 0; i < object.attestNetworkFees.length; ++i) {
                    if (typeof object.attestNetworkFees[i] !== "object")
                        throw TypeError(".common.AttestationBatch.attestNetworkFees: object expected");
                    message.attestNetworkFees[i] = $root.common.AttestNetworkFee.fromObject(object.attestNetworkFees[i]);
                }
            }
            if (object.attestSolvencies) {
                if (!Array.isArray(object.attestSolvencies))
                    throw TypeError(".common.AttestationBatch.attestSolvencies: array expected");
                message.attestSolvencies = [];
                for (var i = 0; i < object.attestSolvencies.length; ++i) {
                    if (typeof object.attestSolvencies[i] !== "object")
                        throw TypeError(".common.AttestationBatch.attestSolvencies: object expected");
                    message.attestSolvencies[i] = $root.common.AttestSolvency.fromObject(object.attestSolvencies[i]);
                }
            }
            if (object.attestErrataTxs) {
                if (!Array.isArray(object.attestErrataTxs))
                    throw TypeError(".common.AttestationBatch.attestErrataTxs: array expected");
                message.attestErrataTxs = [];
                for (var i = 0; i < object.attestErrataTxs.length; ++i) {
                    if (typeof object.attestErrataTxs[i] !== "object")
                        throw TypeError(".common.AttestationBatch.attestErrataTxs: object expected");
                    message.attestErrataTxs[i] = $root.common.AttestErrataTx.fromObject(object.attestErrataTxs[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an AttestationBatch message. Also converts values to other types if specified.
         * @function toObject
         * @memberof common.AttestationBatch
         * @static
         * @param {common.AttestationBatch} message AttestationBatch
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AttestationBatch.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.attestTxs = [];
                object.attestNetworkFees = [];
                object.attestSolvencies = [];
                object.attestErrataTxs = [];
            }
            if (message.attestTxs && message.attestTxs.length) {
                object.attestTxs = [];
                for (var j = 0; j < message.attestTxs.length; ++j)
                    object.attestTxs[j] = $root.common.AttestTx.toObject(message.attestTxs[j], options);
            }
            if (message.attestNetworkFees && message.attestNetworkFees.length) {
                object.attestNetworkFees = [];
                for (var j = 0; j < message.attestNetworkFees.length; ++j)
                    object.attestNetworkFees[j] = $root.common.AttestNetworkFee.toObject(message.attestNetworkFees[j], options);
            }
            if (message.attestSolvencies && message.attestSolvencies.length) {
                object.attestSolvencies = [];
                for (var j = 0; j < message.attestSolvencies.length; ++j)
                    object.attestSolvencies[j] = $root.common.AttestSolvency.toObject(message.attestSolvencies[j], options);
            }
            if (message.attestErrataTxs && message.attestErrataTxs.length) {
                object.attestErrataTxs = [];
                for (var j = 0; j < message.attestErrataTxs.length; ++j)
                    object.attestErrataTxs[j] = $root.common.AttestErrataTx.toObject(message.attestErrataTxs[j], options);
            }
            return object;
        };

        /**
         * Converts this AttestationBatch to JSON.
         * @function toJSON
         * @memberof common.AttestationBatch
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AttestationBatch.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AttestationBatch;
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

            v1beta1.DecCoin = (function() {

                /**
                 * Properties of a DecCoin.
                 * @memberof cosmos.base.v1beta1
                 * @interface IDecCoin
                 * @property {string|null} [denom] DecCoin denom
                 * @property {string|null} [amount] DecCoin amount
                 */

                /**
                 * Constructs a new DecCoin.
                 * @memberof cosmos.base.v1beta1
                 * @classdesc Represents a DecCoin.
                 * @implements IDecCoin
                 * @constructor
                 * @param {cosmos.base.v1beta1.IDecCoin=} [properties] Properties to set
                 */
                function DecCoin(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DecCoin denom.
                 * @member {string} denom
                 * @memberof cosmos.base.v1beta1.DecCoin
                 * @instance
                 */
                DecCoin.prototype.denom = "";

                /**
                 * DecCoin amount.
                 * @member {string} amount
                 * @memberof cosmos.base.v1beta1.DecCoin
                 * @instance
                 */
                DecCoin.prototype.amount = "";

                /**
                 * Creates a new DecCoin instance using the specified properties.
                 * @function create
                 * @memberof cosmos.base.v1beta1.DecCoin
                 * @static
                 * @param {cosmos.base.v1beta1.IDecCoin=} [properties] Properties to set
                 * @returns {cosmos.base.v1beta1.DecCoin} DecCoin instance
                 */
                DecCoin.create = function create(properties) {
                    return new DecCoin(properties);
                };

                /**
                 * Encodes the specified DecCoin message. Does not implicitly {@link cosmos.base.v1beta1.DecCoin.verify|verify} messages.
                 * @function encode
                 * @memberof cosmos.base.v1beta1.DecCoin
                 * @static
                 * @param {cosmos.base.v1beta1.IDecCoin} message DecCoin message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DecCoin.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.denom != null && Object.hasOwnProperty.call(message, "denom"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.denom);
                    if (message.amount != null && Object.hasOwnProperty.call(message, "amount"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.amount);
                    return writer;
                };

                /**
                 * Encodes the specified DecCoin message, length delimited. Does not implicitly {@link cosmos.base.v1beta1.DecCoin.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof cosmos.base.v1beta1.DecCoin
                 * @static
                 * @param {cosmos.base.v1beta1.IDecCoin} message DecCoin message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DecCoin.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DecCoin message from the specified reader or buffer.
                 * @function decode
                 * @memberof cosmos.base.v1beta1.DecCoin
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {cosmos.base.v1beta1.DecCoin} DecCoin
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DecCoin.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cosmos.base.v1beta1.DecCoin();
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
                 * Decodes a DecCoin message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof cosmos.base.v1beta1.DecCoin
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {cosmos.base.v1beta1.DecCoin} DecCoin
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DecCoin.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DecCoin message.
                 * @function verify
                 * @memberof cosmos.base.v1beta1.DecCoin
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DecCoin.verify = function verify(message) {
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
                 * Creates a DecCoin message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof cosmos.base.v1beta1.DecCoin
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {cosmos.base.v1beta1.DecCoin} DecCoin
                 */
                DecCoin.fromObject = function fromObject(object) {
                    if (object instanceof $root.cosmos.base.v1beta1.DecCoin)
                        return object;
                    var message = new $root.cosmos.base.v1beta1.DecCoin();
                    if (object.denom != null)
                        message.denom = String(object.denom);
                    if (object.amount != null)
                        message.amount = String(object.amount);
                    return message;
                };

                /**
                 * Creates a plain object from a DecCoin message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof cosmos.base.v1beta1.DecCoin
                 * @static
                 * @param {cosmos.base.v1beta1.DecCoin} message DecCoin
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DecCoin.toObject = function toObject(message, options) {
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
                 * Converts this DecCoin to JSON.
                 * @function toJSON
                 * @memberof cosmos.base.v1beta1.DecCoin
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DecCoin.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return DecCoin;
            })();

            v1beta1.IntProto = (function() {

                /**
                 * Properties of an IntProto.
                 * @memberof cosmos.base.v1beta1
                 * @interface IIntProto
                 * @property {string|null} [int] IntProto int
                 */

                /**
                 * Constructs a new IntProto.
                 * @memberof cosmos.base.v1beta1
                 * @classdesc Represents an IntProto.
                 * @implements IIntProto
                 * @constructor
                 * @param {cosmos.base.v1beta1.IIntProto=} [properties] Properties to set
                 */
                function IntProto(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * IntProto int.
                 * @member {string} int
                 * @memberof cosmos.base.v1beta1.IntProto
                 * @instance
                 */
                IntProto.prototype.int = "";

                /**
                 * Creates a new IntProto instance using the specified properties.
                 * @function create
                 * @memberof cosmos.base.v1beta1.IntProto
                 * @static
                 * @param {cosmos.base.v1beta1.IIntProto=} [properties] Properties to set
                 * @returns {cosmos.base.v1beta1.IntProto} IntProto instance
                 */
                IntProto.create = function create(properties) {
                    return new IntProto(properties);
                };

                /**
                 * Encodes the specified IntProto message. Does not implicitly {@link cosmos.base.v1beta1.IntProto.verify|verify} messages.
                 * @function encode
                 * @memberof cosmos.base.v1beta1.IntProto
                 * @static
                 * @param {cosmos.base.v1beta1.IIntProto} message IntProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                IntProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.int != null && Object.hasOwnProperty.call(message, "int"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.int);
                    return writer;
                };

                /**
                 * Encodes the specified IntProto message, length delimited. Does not implicitly {@link cosmos.base.v1beta1.IntProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof cosmos.base.v1beta1.IntProto
                 * @static
                 * @param {cosmos.base.v1beta1.IIntProto} message IntProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                IntProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes an IntProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof cosmos.base.v1beta1.IntProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {cosmos.base.v1beta1.IntProto} IntProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                IntProto.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cosmos.base.v1beta1.IntProto();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.int = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes an IntProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof cosmos.base.v1beta1.IntProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {cosmos.base.v1beta1.IntProto} IntProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                IntProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies an IntProto message.
                 * @function verify
                 * @memberof cosmos.base.v1beta1.IntProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                IntProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.int != null && message.hasOwnProperty("int"))
                        if (!$util.isString(message.int))
                            return "int: string expected";
                    return null;
                };

                /**
                 * Creates an IntProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof cosmos.base.v1beta1.IntProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {cosmos.base.v1beta1.IntProto} IntProto
                 */
                IntProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.cosmos.base.v1beta1.IntProto)
                        return object;
                    var message = new $root.cosmos.base.v1beta1.IntProto();
                    if (object.int != null)
                        message.int = String(object.int);
                    return message;
                };

                /**
                 * Creates a plain object from an IntProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof cosmos.base.v1beta1.IntProto
                 * @static
                 * @param {cosmos.base.v1beta1.IntProto} message IntProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                IntProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.int = "";
                    if (message.int != null && message.hasOwnProperty("int"))
                        object.int = message.int;
                    return object;
                };

                /**
                 * Converts this IntProto to JSON.
                 * @function toJSON
                 * @memberof cosmos.base.v1beta1.IntProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                IntProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return IntProto;
            })();

            v1beta1.DecProto = (function() {

                /**
                 * Properties of a DecProto.
                 * @memberof cosmos.base.v1beta1
                 * @interface IDecProto
                 * @property {string|null} [dec] DecProto dec
                 */

                /**
                 * Constructs a new DecProto.
                 * @memberof cosmos.base.v1beta1
                 * @classdesc Represents a DecProto.
                 * @implements IDecProto
                 * @constructor
                 * @param {cosmos.base.v1beta1.IDecProto=} [properties] Properties to set
                 */
                function DecProto(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * DecProto dec.
                 * @member {string} dec
                 * @memberof cosmos.base.v1beta1.DecProto
                 * @instance
                 */
                DecProto.prototype.dec = "";

                /**
                 * Creates a new DecProto instance using the specified properties.
                 * @function create
                 * @memberof cosmos.base.v1beta1.DecProto
                 * @static
                 * @param {cosmos.base.v1beta1.IDecProto=} [properties] Properties to set
                 * @returns {cosmos.base.v1beta1.DecProto} DecProto instance
                 */
                DecProto.create = function create(properties) {
                    return new DecProto(properties);
                };

                /**
                 * Encodes the specified DecProto message. Does not implicitly {@link cosmos.base.v1beta1.DecProto.verify|verify} messages.
                 * @function encode
                 * @memberof cosmos.base.v1beta1.DecProto
                 * @static
                 * @param {cosmos.base.v1beta1.IDecProto} message DecProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DecProto.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.dec != null && Object.hasOwnProperty.call(message, "dec"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.dec);
                    return writer;
                };

                /**
                 * Encodes the specified DecProto message, length delimited. Does not implicitly {@link cosmos.base.v1beta1.DecProto.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof cosmos.base.v1beta1.DecProto
                 * @static
                 * @param {cosmos.base.v1beta1.IDecProto} message DecProto message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                DecProto.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a DecProto message from the specified reader or buffer.
                 * @function decode
                 * @memberof cosmos.base.v1beta1.DecProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {cosmos.base.v1beta1.DecProto} DecProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DecProto.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.cosmos.base.v1beta1.DecProto();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.dec = reader.string();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a DecProto message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof cosmos.base.v1beta1.DecProto
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {cosmos.base.v1beta1.DecProto} DecProto
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                DecProto.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a DecProto message.
                 * @function verify
                 * @memberof cosmos.base.v1beta1.DecProto
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                DecProto.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.dec != null && message.hasOwnProperty("dec"))
                        if (!$util.isString(message.dec))
                            return "dec: string expected";
                    return null;
                };

                /**
                 * Creates a DecProto message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof cosmos.base.v1beta1.DecProto
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {cosmos.base.v1beta1.DecProto} DecProto
                 */
                DecProto.fromObject = function fromObject(object) {
                    if (object instanceof $root.cosmos.base.v1beta1.DecProto)
                        return object;
                    var message = new $root.cosmos.base.v1beta1.DecProto();
                    if (object.dec != null)
                        message.dec = String(object.dec);
                    return message;
                };

                /**
                 * Creates a plain object from a DecProto message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof cosmos.base.v1beta1.DecProto
                 * @static
                 * @param {cosmos.base.v1beta1.DecProto} message DecProto
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                DecProto.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults)
                        object.dec = "";
                    if (message.dec != null && message.hasOwnProperty("dec"))
                        object.dec = message.dec;
                    return object;
                };

                /**
                 * Converts this DecProto to JSON.
                 * @function toJSON
                 * @memberof cosmos.base.v1beta1.DecProto
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                DecProto.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return DecProto;
            })();

            return v1beta1;
        })();

        return base;
    })();

    return cosmos;
})();

module.exports = $root;
