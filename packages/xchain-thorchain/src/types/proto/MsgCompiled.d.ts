import * as $protobuf from "protobufjs";
export = types;

declare namespace types {


    /** Namespace common. */
    namespace common {

        /** Properties of an Asset. */
        interface IAsset {

            /** Asset chain */
            chain?: (string|null);

            /** Asset symbol */
            symbol?: (string|null);

            /** Asset ticker */
            ticker?: (string|null);

            /** Asset synth */
            synth?: (boolean|null);

            /** Asset trade */
            trade?: (boolean|null);

            /** Asset secured */
            secured?: (boolean|null);
        }

        /** Represents an Asset. */
        class Asset implements IAsset {

            /**
             * Constructs a new Asset.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IAsset);

            /** Asset chain. */
            public chain: string;

            /** Asset symbol. */
            public symbol: string;

            /** Asset ticker. */
            public ticker: string;

            /** Asset synth. */
            public synth: boolean;

            /** Asset trade. */
            public trade: boolean;

            /** Asset secured. */
            public secured: boolean;

            /**
             * Creates a new Asset instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Asset instance
             */
            public static create(properties?: common.IAsset): common.Asset;

            /**
             * Encodes the specified Asset message. Does not implicitly {@link common.Asset.verify|verify} messages.
             * @param message Asset message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IAsset, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Asset message, length delimited. Does not implicitly {@link common.Asset.verify|verify} messages.
             * @param message Asset message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IAsset, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Asset message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Asset
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.Asset;

            /**
             * Decodes an Asset message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Asset
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.Asset;

            /**
             * Verifies an Asset message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Asset message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Asset
             */
            public static fromObject(object: { [k: string]: any }): common.Asset;

            /**
             * Creates a plain object from an Asset message. Also converts values to other types if specified.
             * @param message Asset
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.Asset, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Asset to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Coin. */
        interface ICoin {

            /** Coin asset */
            asset?: (common.IAsset|null);

            /** Coin amount */
            amount?: (string|null);

            /** Coin decimals */
            decimals?: (number|Long|null);
        }

        /** Represents a Coin. */
        class Coin implements ICoin {

            /**
             * Constructs a new Coin.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.ICoin);

            /** Coin asset. */
            public asset?: (common.IAsset|null);

            /** Coin amount. */
            public amount: string;

            /** Coin decimals. */
            public decimals: (number|Long);

            /**
             * Creates a new Coin instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Coin instance
             */
            public static create(properties?: common.ICoin): common.Coin;

            /**
             * Encodes the specified Coin message. Does not implicitly {@link common.Coin.verify|verify} messages.
             * @param message Coin message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.ICoin, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Coin message, length delimited. Does not implicitly {@link common.Coin.verify|verify} messages.
             * @param message Coin message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.ICoin, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Coin message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Coin
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.Coin;

            /**
             * Decodes a Coin message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Coin
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.Coin;

            /**
             * Verifies a Coin message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Coin message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Coin
             */
            public static fromObject(object: { [k: string]: any }): common.Coin;

            /**
             * Creates a plain object from a Coin message. Also converts values to other types if specified.
             * @param message Coin
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.Coin, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Coin to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace types. */
    namespace types {

        /** Properties of a MsgDeposit. */
        interface IMsgDeposit {

            /** MsgDeposit coins */
            coins?: (common.ICoin[]|null);

            /** MsgDeposit memo */
            memo?: (string|null);

            /** MsgDeposit signer */
            signer?: (Uint8Array|null);
        }

        /** Represents a MsgDeposit. */
        class MsgDeposit implements IMsgDeposit {

            /**
             * Constructs a new MsgDeposit.
             * @param [properties] Properties to set
             */
            constructor(properties?: types.IMsgDeposit);

            /** MsgDeposit coins. */
            public coins: common.ICoin[];

            /** MsgDeposit memo. */
            public memo: string;

            /** MsgDeposit signer. */
            public signer: Uint8Array;

            /**
             * Creates a new MsgDeposit instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MsgDeposit instance
             */
            public static create(properties?: types.IMsgDeposit): types.MsgDeposit;

            /**
             * Encodes the specified MsgDeposit message. Does not implicitly {@link types.MsgDeposit.verify|verify} messages.
             * @param message MsgDeposit message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: types.IMsgDeposit, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MsgDeposit message, length delimited. Does not implicitly {@link types.MsgDeposit.verify|verify} messages.
             * @param message MsgDeposit message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: types.IMsgDeposit, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MsgDeposit message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MsgDeposit
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MsgDeposit;

            /**
             * Decodes a MsgDeposit message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MsgDeposit
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MsgDeposit;

            /**
             * Verifies a MsgDeposit message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MsgDeposit message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MsgDeposit
             */
            public static fromObject(object: { [k: string]: any }): types.MsgDeposit;

            /**
             * Creates a plain object from a MsgDeposit message. Also converts values to other types if specified.
             * @param message MsgDeposit
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: types.MsgDeposit, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MsgDeposit to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a MsgSend. */
        interface IMsgSend {

            /** MsgSend fromAddress */
            fromAddress?: (Uint8Array|null);

            /** MsgSend toAddress */
            toAddress?: (Uint8Array|null);

            /** MsgSend amount */
            amount?: (cosmos.base.v1beta1.ICoin[]|null);
        }

        /** Represents a MsgSend. */
        class MsgSend implements IMsgSend {

            /**
             * Constructs a new MsgSend.
             * @param [properties] Properties to set
             */
            constructor(properties?: types.IMsgSend);

            /** MsgSend fromAddress. */
            public fromAddress: Uint8Array;

            /** MsgSend toAddress. */
            public toAddress: Uint8Array;

            /** MsgSend amount. */
            public amount: cosmos.base.v1beta1.ICoin[];

            /**
             * Creates a new MsgSend instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MsgSend instance
             */
            public static create(properties?: types.IMsgSend): types.MsgSend;

            /**
             * Encodes the specified MsgSend message. Does not implicitly {@link types.MsgSend.verify|verify} messages.
             * @param message MsgSend message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: types.IMsgSend, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MsgSend message, length delimited. Does not implicitly {@link types.MsgSend.verify|verify} messages.
             * @param message MsgSend message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: types.IMsgSend, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MsgSend message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MsgSend
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): types.MsgSend;

            /**
             * Decodes a MsgSend message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MsgSend
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): types.MsgSend;

            /**
             * Verifies a MsgSend message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MsgSend message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MsgSend
             */
            public static fromObject(object: { [k: string]: any }): types.MsgSend;

            /**
             * Creates a plain object from a MsgSend message. Also converts values to other types if specified.
             * @param message MsgSend
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: types.MsgSend, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MsgSend to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace cosmos. */
    namespace cosmos {

        /** Namespace base. */
        namespace base {

            /** Namespace v1beta1. */
            namespace v1beta1 {

                /** Properties of a Coin. */
                interface ICoin {

                    /** Coin denom */
                    denom?: (string|null);

                    /** Coin amount */
                    amount?: (string|null);
                }

                /** Represents a Coin. */
                class Coin implements ICoin {

                    /**
                     * Constructs a new Coin.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: cosmos.base.v1beta1.ICoin);

                    /** Coin denom. */
                    public denom: string;

                    /** Coin amount. */
                    public amount: string;

                    /**
                     * Creates a new Coin instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Coin instance
                     */
                    public static create(properties?: cosmos.base.v1beta1.ICoin): cosmos.base.v1beta1.Coin;

                    /**
                     * Encodes the specified Coin message. Does not implicitly {@link cosmos.base.v1beta1.Coin.verify|verify} messages.
                     * @param message Coin message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: cosmos.base.v1beta1.ICoin, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Coin message, length delimited. Does not implicitly {@link cosmos.base.v1beta1.Coin.verify|verify} messages.
                     * @param message Coin message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: cosmos.base.v1beta1.ICoin, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Coin message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Coin
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cosmos.base.v1beta1.Coin;

                    /**
                     * Decodes a Coin message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Coin
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cosmos.base.v1beta1.Coin;

                    /**
                     * Verifies a Coin message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Coin message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Coin
                     */
                    public static fromObject(object: { [k: string]: any }): cosmos.base.v1beta1.Coin;

                    /**
                     * Creates a plain object from a Coin message. Also converts values to other types if specified.
                     * @param message Coin
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: cosmos.base.v1beta1.Coin, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Coin to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }
            }
        }
    }
}
