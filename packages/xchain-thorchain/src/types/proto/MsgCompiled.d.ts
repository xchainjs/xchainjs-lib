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

        /** Properties of a PubKeySet. */
        interface IPubKeySet {

            /** PubKeySet secp256k1 */
            secp256k1?: (string|null);

            /** PubKeySet ed25519 */
            ed25519?: (string|null);
        }

        /** Represents a PubKeySet. */
        class PubKeySet implements IPubKeySet {

            /**
             * Constructs a new PubKeySet.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IPubKeySet);

            /** PubKeySet secp256k1. */
            public secp256k1: string;

            /** PubKeySet ed25519. */
            public ed25519: string;

            /**
             * Creates a new PubKeySet instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PubKeySet instance
             */
            public static create(properties?: common.IPubKeySet): common.PubKeySet;

            /**
             * Encodes the specified PubKeySet message. Does not implicitly {@link common.PubKeySet.verify|verify} messages.
             * @param message PubKeySet message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IPubKeySet, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PubKeySet message, length delimited. Does not implicitly {@link common.PubKeySet.verify|verify} messages.
             * @param message PubKeySet message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IPubKeySet, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PubKeySet message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PubKeySet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.PubKeySet;

            /**
             * Decodes a PubKeySet message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PubKeySet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.PubKeySet;

            /**
             * Verifies a PubKeySet message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PubKeySet message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PubKeySet
             */
            public static fromObject(object: { [k: string]: any }): common.PubKeySet;

            /**
             * Creates a plain object from a PubKeySet message. Also converts values to other types if specified.
             * @param message PubKeySet
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.PubKeySet, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PubKeySet to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Tx. */
        interface ITx {

            /** Tx id */
            id?: (string|null);

            /** Tx chain */
            chain?: (string|null);

            /** Tx fromAddress */
            fromAddress?: (string|null);

            /** Tx toAddress */
            toAddress?: (string|null);

            /** Tx coins */
            coins?: (common.ICoin[]|null);

            /** Tx gas */
            gas?: (common.ICoin[]|null);

            /** Tx memo */
            memo?: (string|null);
        }

        /** Represents a Tx. */
        class Tx implements ITx {

            /**
             * Constructs a new Tx.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.ITx);

            /** Tx id. */
            public id: string;

            /** Tx chain. */
            public chain: string;

            /** Tx fromAddress. */
            public fromAddress: string;

            /** Tx toAddress. */
            public toAddress: string;

            /** Tx coins. */
            public coins: common.ICoin[];

            /** Tx gas. */
            public gas: common.ICoin[];

            /** Tx memo. */
            public memo: string;

            /**
             * Creates a new Tx instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Tx instance
             */
            public static create(properties?: common.ITx): common.Tx;

            /**
             * Encodes the specified Tx message. Does not implicitly {@link common.Tx.verify|verify} messages.
             * @param message Tx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.ITx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Tx message, length delimited. Does not implicitly {@link common.Tx.verify|verify} messages.
             * @param message Tx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.ITx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Tx message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Tx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.Tx;

            /**
             * Decodes a Tx message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Tx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.Tx;

            /**
             * Verifies a Tx message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Tx message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Tx
             */
            public static fromObject(object: { [k: string]: any }): common.Tx;

            /**
             * Creates a plain object from a Tx message. Also converts values to other types if specified.
             * @param message Tx
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.Tx, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Tx to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Fee. */
        interface IFee {

            /** Fee coins */
            coins?: (common.ICoin[]|null);

            /** Fee poolDeduct */
            poolDeduct?: (string|null);
        }

        /** Represents a Fee. */
        class Fee implements IFee {

            /**
             * Constructs a new Fee.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IFee);

            /** Fee coins. */
            public coins: common.ICoin[];

            /** Fee poolDeduct. */
            public poolDeduct: string;

            /**
             * Creates a new Fee instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Fee instance
             */
            public static create(properties?: common.IFee): common.Fee;

            /**
             * Encodes the specified Fee message. Does not implicitly {@link common.Fee.verify|verify} messages.
             * @param message Fee message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IFee, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Fee message, length delimited. Does not implicitly {@link common.Fee.verify|verify} messages.
             * @param message Fee message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IFee, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Fee message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Fee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.Fee;

            /**
             * Decodes a Fee message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Fee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.Fee;

            /**
             * Verifies a Fee message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Fee message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Fee
             */
            public static fromObject(object: { [k: string]: any }): common.Fee;

            /**
             * Creates a plain object from a Fee message. Also converts values to other types if specified.
             * @param message Fee
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.Fee, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Fee to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ProtoUint. */
        interface IProtoUint {

            /** ProtoUint value */
            value?: (string|null);
        }

        /** Represents a ProtoUint. */
        class ProtoUint implements IProtoUint {

            /**
             * Constructs a new ProtoUint.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IProtoUint);

            /** ProtoUint value. */
            public value: string;

            /**
             * Creates a new ProtoUint instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ProtoUint instance
             */
            public static create(properties?: common.IProtoUint): common.ProtoUint;

            /**
             * Encodes the specified ProtoUint message. Does not implicitly {@link common.ProtoUint.verify|verify} messages.
             * @param message ProtoUint message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IProtoUint, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ProtoUint message, length delimited. Does not implicitly {@link common.ProtoUint.verify|verify} messages.
             * @param message ProtoUint message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IProtoUint, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ProtoUint message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ProtoUint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.ProtoUint;

            /**
             * Decodes a ProtoUint message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ProtoUint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.ProtoUint;

            /**
             * Verifies a ProtoUint message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ProtoUint message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ProtoUint
             */
            public static fromObject(object: { [k: string]: any }): common.ProtoUint;

            /**
             * Creates a plain object from a ProtoUint message. Also converts values to other types if specified.
             * @param message ProtoUint
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.ProtoUint, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ProtoUint to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Status enum. */
        enum Status {
            incomplete = 0,
            done = 1,
            reverted = 2
        }

        /** Properties of an ObservedTx. */
        interface IObservedTx {

            /** ObservedTx tx */
            tx?: (common.ITx|null);

            /** ObservedTx status */
            status?: (common.Status|null);

            /** ObservedTx outHashes */
            outHashes?: (string[]|null);

            /** ObservedTx blockHeight */
            blockHeight?: (number|Long|null);

            /** ObservedTx signers */
            signers?: (string[]|null);

            /** ObservedTx observedPubKey */
            observedPubKey?: (string|null);

            /** ObservedTx keysignMs */
            keysignMs?: (number|Long|null);

            /** ObservedTx finaliseHeight */
            finaliseHeight?: (number|Long|null);

            /** ObservedTx aggregator */
            aggregator?: (string|null);

            /** ObservedTx aggregatorTarget */
            aggregatorTarget?: (string|null);

            /** ObservedTx aggregatorTargetLimit */
            aggregatorTargetLimit?: (string|null);
        }

        /** Represents an ObservedTx. */
        class ObservedTx implements IObservedTx {

            /**
             * Constructs a new ObservedTx.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IObservedTx);

            /** ObservedTx tx. */
            public tx?: (common.ITx|null);

            /** ObservedTx status. */
            public status: common.Status;

            /** ObservedTx outHashes. */
            public outHashes: string[];

            /** ObservedTx blockHeight. */
            public blockHeight: (number|Long);

            /** ObservedTx signers. */
            public signers: string[];

            /** ObservedTx observedPubKey. */
            public observedPubKey: string;

            /** ObservedTx keysignMs. */
            public keysignMs: (number|Long);

            /** ObservedTx finaliseHeight. */
            public finaliseHeight: (number|Long);

            /** ObservedTx aggregator. */
            public aggregator: string;

            /** ObservedTx aggregatorTarget. */
            public aggregatorTarget: string;

            /** ObservedTx aggregatorTargetLimit. */
            public aggregatorTargetLimit: string;

            /**
             * Creates a new ObservedTx instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ObservedTx instance
             */
            public static create(properties?: common.IObservedTx): common.ObservedTx;

            /**
             * Encodes the specified ObservedTx message. Does not implicitly {@link common.ObservedTx.verify|verify} messages.
             * @param message ObservedTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IObservedTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ObservedTx message, length delimited. Does not implicitly {@link common.ObservedTx.verify|verify} messages.
             * @param message ObservedTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IObservedTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ObservedTx message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ObservedTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.ObservedTx;

            /**
             * Decodes an ObservedTx message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ObservedTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.ObservedTx;

            /**
             * Verifies an ObservedTx message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ObservedTx message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ObservedTx
             */
            public static fromObject(object: { [k: string]: any }): common.ObservedTx;

            /**
             * Creates a plain object from an ObservedTx message. Also converts values to other types if specified.
             * @param message ObservedTx
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.ObservedTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ObservedTx to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an Attestation. */
        interface IAttestation {

            /** Attestation PubKey */
            PubKey?: (Uint8Array|null);

            /** Attestation Signature */
            Signature?: (Uint8Array|null);
        }

        /** Represents an Attestation. */
        class Attestation implements IAttestation {

            /**
             * Constructs a new Attestation.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IAttestation);

            /** Attestation PubKey. */
            public PubKey: Uint8Array;

            /** Attestation Signature. */
            public Signature: Uint8Array;

            /**
             * Creates a new Attestation instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Attestation instance
             */
            public static create(properties?: common.IAttestation): common.Attestation;

            /**
             * Encodes the specified Attestation message. Does not implicitly {@link common.Attestation.verify|verify} messages.
             * @param message Attestation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IAttestation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Attestation message, length delimited. Does not implicitly {@link common.Attestation.verify|verify} messages.
             * @param message Attestation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IAttestation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Attestation message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Attestation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.Attestation;

            /**
             * Decodes an Attestation message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Attestation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.Attestation;

            /**
             * Verifies an Attestation message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Attestation message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Attestation
             */
            public static fromObject(object: { [k: string]: any }): common.Attestation;

            /**
             * Creates a plain object from an Attestation message. Also converts values to other types if specified.
             * @param message Attestation
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.Attestation, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Attestation to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AttestTx. */
        interface IAttestTx {

            /** AttestTx obsTx */
            obsTx?: (common.IObservedTx|null);

            /** AttestTx attestation */
            attestation?: (common.IAttestation|null);

            /** AttestTx inbound */
            inbound?: (boolean|null);

            /** AttestTx allowFutureObservation */
            allowFutureObservation?: (boolean|null);
        }

        /** Represents an AttestTx. */
        class AttestTx implements IAttestTx {

            /**
             * Constructs a new AttestTx.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IAttestTx);

            /** AttestTx obsTx. */
            public obsTx?: (common.IObservedTx|null);

            /** AttestTx attestation. */
            public attestation?: (common.IAttestation|null);

            /** AttestTx inbound. */
            public inbound: boolean;

            /** AttestTx allowFutureObservation. */
            public allowFutureObservation: boolean;

            /**
             * Creates a new AttestTx instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AttestTx instance
             */
            public static create(properties?: common.IAttestTx): common.AttestTx;

            /**
             * Encodes the specified AttestTx message. Does not implicitly {@link common.AttestTx.verify|verify} messages.
             * @param message AttestTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IAttestTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AttestTx message, length delimited. Does not implicitly {@link common.AttestTx.verify|verify} messages.
             * @param message AttestTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IAttestTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AttestTx message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AttestTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.AttestTx;

            /**
             * Decodes an AttestTx message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AttestTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.AttestTx;

            /**
             * Verifies an AttestTx message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AttestTx message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AttestTx
             */
            public static fromObject(object: { [k: string]: any }): common.AttestTx;

            /**
             * Creates a plain object from an AttestTx message. Also converts values to other types if specified.
             * @param message AttestTx
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.AttestTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AttestTx to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a QuorumTx. */
        interface IQuorumTx {

            /** QuorumTx obsTx */
            obsTx?: (common.IObservedTx|null);

            /** QuorumTx attestations */
            attestations?: (common.IAttestation[]|null);

            /** QuorumTx inbound */
            inbound?: (boolean|null);

            /** QuorumTx allowFutureObservation */
            allowFutureObservation?: (boolean|null);
        }

        /** Represents a QuorumTx. */
        class QuorumTx implements IQuorumTx {

            /**
             * Constructs a new QuorumTx.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IQuorumTx);

            /** QuorumTx obsTx. */
            public obsTx?: (common.IObservedTx|null);

            /** QuorumTx attestations. */
            public attestations: common.IAttestation[];

            /** QuorumTx inbound. */
            public inbound: boolean;

            /** QuorumTx allowFutureObservation. */
            public allowFutureObservation: boolean;

            /**
             * Creates a new QuorumTx instance using the specified properties.
             * @param [properties] Properties to set
             * @returns QuorumTx instance
             */
            public static create(properties?: common.IQuorumTx): common.QuorumTx;

            /**
             * Encodes the specified QuorumTx message. Does not implicitly {@link common.QuorumTx.verify|verify} messages.
             * @param message QuorumTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IQuorumTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified QuorumTx message, length delimited. Does not implicitly {@link common.QuorumTx.verify|verify} messages.
             * @param message QuorumTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IQuorumTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a QuorumTx message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns QuorumTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.QuorumTx;

            /**
             * Decodes a QuorumTx message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns QuorumTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.QuorumTx;

            /**
             * Verifies a QuorumTx message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a QuorumTx message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns QuorumTx
             */
            public static fromObject(object: { [k: string]: any }): common.QuorumTx;

            /**
             * Creates a plain object from a QuorumTx message. Also converts values to other types if specified.
             * @param message QuorumTx
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.QuorumTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this QuorumTx to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a QuorumState. */
        interface IQuorumState {

            /** QuorumState quoTxs */
            quoTxs?: (common.IQuorumTx[]|null);

            /** QuorumState quoNetworkFees */
            quoNetworkFees?: (common.IQuorumNetworkFee[]|null);

            /** QuorumState quoSolvencies */
            quoSolvencies?: (common.IQuorumSolvency[]|null);

            /** QuorumState quoErrataTxs */
            quoErrataTxs?: (common.IQuorumErrataTx[]|null);
        }

        /** Represents a QuorumState. */
        class QuorumState implements IQuorumState {

            /**
             * Constructs a new QuorumState.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IQuorumState);

            /** QuorumState quoTxs. */
            public quoTxs: common.IQuorumTx[];

            /** QuorumState quoNetworkFees. */
            public quoNetworkFees: common.IQuorumNetworkFee[];

            /** QuorumState quoSolvencies. */
            public quoSolvencies: common.IQuorumSolvency[];

            /** QuorumState quoErrataTxs. */
            public quoErrataTxs: common.IQuorumErrataTx[];

            /**
             * Creates a new QuorumState instance using the specified properties.
             * @param [properties] Properties to set
             * @returns QuorumState instance
             */
            public static create(properties?: common.IQuorumState): common.QuorumState;

            /**
             * Encodes the specified QuorumState message. Does not implicitly {@link common.QuorumState.verify|verify} messages.
             * @param message QuorumState message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IQuorumState, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified QuorumState message, length delimited. Does not implicitly {@link common.QuorumState.verify|verify} messages.
             * @param message QuorumState message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IQuorumState, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a QuorumState message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns QuorumState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.QuorumState;

            /**
             * Decodes a QuorumState message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns QuorumState
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.QuorumState;

            /**
             * Verifies a QuorumState message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a QuorumState message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns QuorumState
             */
            public static fromObject(object: { [k: string]: any }): common.QuorumState;

            /**
             * Creates a plain object from a QuorumState message. Also converts values to other types if specified.
             * @param message QuorumState
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.QuorumState, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this QuorumState to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a NetworkFee. */
        interface INetworkFee {

            /** NetworkFee height */
            height?: (number|Long|null);

            /** NetworkFee chain */
            chain?: (string|null);

            /** NetworkFee transactionSize */
            transactionSize?: (number|Long|null);

            /** NetworkFee transactionRate */
            transactionRate?: (number|Long|null);
        }

        /** Represents a NetworkFee. */
        class NetworkFee implements INetworkFee {

            /**
             * Constructs a new NetworkFee.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.INetworkFee);

            /** NetworkFee height. */
            public height: (number|Long);

            /** NetworkFee chain. */
            public chain: string;

            /** NetworkFee transactionSize. */
            public transactionSize: (number|Long);

            /** NetworkFee transactionRate. */
            public transactionRate: (number|Long);

            /**
             * Creates a new NetworkFee instance using the specified properties.
             * @param [properties] Properties to set
             * @returns NetworkFee instance
             */
            public static create(properties?: common.INetworkFee): common.NetworkFee;

            /**
             * Encodes the specified NetworkFee message. Does not implicitly {@link common.NetworkFee.verify|verify} messages.
             * @param message NetworkFee message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.INetworkFee, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified NetworkFee message, length delimited. Does not implicitly {@link common.NetworkFee.verify|verify} messages.
             * @param message NetworkFee message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.INetworkFee, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a NetworkFee message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns NetworkFee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.NetworkFee;

            /**
             * Decodes a NetworkFee message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns NetworkFee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.NetworkFee;

            /**
             * Verifies a NetworkFee message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a NetworkFee message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns NetworkFee
             */
            public static fromObject(object: { [k: string]: any }): common.NetworkFee;

            /**
             * Creates a plain object from a NetworkFee message. Also converts values to other types if specified.
             * @param message NetworkFee
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.NetworkFee, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this NetworkFee to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AttestNetworkFee. */
        interface IAttestNetworkFee {

            /** AttestNetworkFee networkFee */
            networkFee?: (common.INetworkFee|null);

            /** AttestNetworkFee attestation */
            attestation?: (common.IAttestation|null);
        }

        /** Represents an AttestNetworkFee. */
        class AttestNetworkFee implements IAttestNetworkFee {

            /**
             * Constructs a new AttestNetworkFee.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IAttestNetworkFee);

            /** AttestNetworkFee networkFee. */
            public networkFee?: (common.INetworkFee|null);

            /** AttestNetworkFee attestation. */
            public attestation?: (common.IAttestation|null);

            /**
             * Creates a new AttestNetworkFee instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AttestNetworkFee instance
             */
            public static create(properties?: common.IAttestNetworkFee): common.AttestNetworkFee;

            /**
             * Encodes the specified AttestNetworkFee message. Does not implicitly {@link common.AttestNetworkFee.verify|verify} messages.
             * @param message AttestNetworkFee message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IAttestNetworkFee, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AttestNetworkFee message, length delimited. Does not implicitly {@link common.AttestNetworkFee.verify|verify} messages.
             * @param message AttestNetworkFee message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IAttestNetworkFee, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AttestNetworkFee message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AttestNetworkFee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.AttestNetworkFee;

            /**
             * Decodes an AttestNetworkFee message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AttestNetworkFee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.AttestNetworkFee;

            /**
             * Verifies an AttestNetworkFee message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AttestNetworkFee message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AttestNetworkFee
             */
            public static fromObject(object: { [k: string]: any }): common.AttestNetworkFee;

            /**
             * Creates a plain object from an AttestNetworkFee message. Also converts values to other types if specified.
             * @param message AttestNetworkFee
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.AttestNetworkFee, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AttestNetworkFee to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a QuorumNetworkFee. */
        interface IQuorumNetworkFee {

            /** QuorumNetworkFee networkFee */
            networkFee?: (common.INetworkFee|null);

            /** QuorumNetworkFee attestations */
            attestations?: (common.IAttestation[]|null);
        }

        /** Represents a QuorumNetworkFee. */
        class QuorumNetworkFee implements IQuorumNetworkFee {

            /**
             * Constructs a new QuorumNetworkFee.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IQuorumNetworkFee);

            /** QuorumNetworkFee networkFee. */
            public networkFee?: (common.INetworkFee|null);

            /** QuorumNetworkFee attestations. */
            public attestations: common.IAttestation[];

            /**
             * Creates a new QuorumNetworkFee instance using the specified properties.
             * @param [properties] Properties to set
             * @returns QuorumNetworkFee instance
             */
            public static create(properties?: common.IQuorumNetworkFee): common.QuorumNetworkFee;

            /**
             * Encodes the specified QuorumNetworkFee message. Does not implicitly {@link common.QuorumNetworkFee.verify|verify} messages.
             * @param message QuorumNetworkFee message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IQuorumNetworkFee, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified QuorumNetworkFee message, length delimited. Does not implicitly {@link common.QuorumNetworkFee.verify|verify} messages.
             * @param message QuorumNetworkFee message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IQuorumNetworkFee, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a QuorumNetworkFee message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns QuorumNetworkFee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.QuorumNetworkFee;

            /**
             * Decodes a QuorumNetworkFee message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns QuorumNetworkFee
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.QuorumNetworkFee;

            /**
             * Verifies a QuorumNetworkFee message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a QuorumNetworkFee message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns QuorumNetworkFee
             */
            public static fromObject(object: { [k: string]: any }): common.QuorumNetworkFee;

            /**
             * Creates a plain object from a QuorumNetworkFee message. Also converts values to other types if specified.
             * @param message QuorumNetworkFee
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.QuorumNetworkFee, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this QuorumNetworkFee to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Solvency. */
        interface ISolvency {

            /** Solvency id */
            id?: (string|null);

            /** Solvency chain */
            chain?: (string|null);

            /** Solvency pubKey */
            pubKey?: (string|null);

            /** Solvency coins */
            coins?: (common.ICoin[]|null);

            /** Solvency height */
            height?: (number|Long|null);
        }

        /** Represents a Solvency. */
        class Solvency implements ISolvency {

            /**
             * Constructs a new Solvency.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.ISolvency);

            /** Solvency id. */
            public id: string;

            /** Solvency chain. */
            public chain: string;

            /** Solvency pubKey. */
            public pubKey: string;

            /** Solvency coins. */
            public coins: common.ICoin[];

            /** Solvency height. */
            public height: (number|Long);

            /**
             * Creates a new Solvency instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Solvency instance
             */
            public static create(properties?: common.ISolvency): common.Solvency;

            /**
             * Encodes the specified Solvency message. Does not implicitly {@link common.Solvency.verify|verify} messages.
             * @param message Solvency message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.ISolvency, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Solvency message, length delimited. Does not implicitly {@link common.Solvency.verify|verify} messages.
             * @param message Solvency message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.ISolvency, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Solvency message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Solvency
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.Solvency;

            /**
             * Decodes a Solvency message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Solvency
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.Solvency;

            /**
             * Verifies a Solvency message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Solvency message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Solvency
             */
            public static fromObject(object: { [k: string]: any }): common.Solvency;

            /**
             * Creates a plain object from a Solvency message. Also converts values to other types if specified.
             * @param message Solvency
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.Solvency, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Solvency to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AttestSolvency. */
        interface IAttestSolvency {

            /** AttestSolvency solvency */
            solvency?: (common.ISolvency|null);

            /** AttestSolvency attestation */
            attestation?: (common.IAttestation|null);
        }

        /** Represents an AttestSolvency. */
        class AttestSolvency implements IAttestSolvency {

            /**
             * Constructs a new AttestSolvency.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IAttestSolvency);

            /** AttestSolvency solvency. */
            public solvency?: (common.ISolvency|null);

            /** AttestSolvency attestation. */
            public attestation?: (common.IAttestation|null);

            /**
             * Creates a new AttestSolvency instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AttestSolvency instance
             */
            public static create(properties?: common.IAttestSolvency): common.AttestSolvency;

            /**
             * Encodes the specified AttestSolvency message. Does not implicitly {@link common.AttestSolvency.verify|verify} messages.
             * @param message AttestSolvency message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IAttestSolvency, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AttestSolvency message, length delimited. Does not implicitly {@link common.AttestSolvency.verify|verify} messages.
             * @param message AttestSolvency message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IAttestSolvency, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AttestSolvency message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AttestSolvency
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.AttestSolvency;

            /**
             * Decodes an AttestSolvency message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AttestSolvency
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.AttestSolvency;

            /**
             * Verifies an AttestSolvency message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AttestSolvency message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AttestSolvency
             */
            public static fromObject(object: { [k: string]: any }): common.AttestSolvency;

            /**
             * Creates a plain object from an AttestSolvency message. Also converts values to other types if specified.
             * @param message AttestSolvency
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.AttestSolvency, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AttestSolvency to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a QuorumSolvency. */
        interface IQuorumSolvency {

            /** QuorumSolvency solvency */
            solvency?: (common.ISolvency|null);

            /** QuorumSolvency attestations */
            attestations?: (common.IAttestation[]|null);
        }

        /** Represents a QuorumSolvency. */
        class QuorumSolvency implements IQuorumSolvency {

            /**
             * Constructs a new QuorumSolvency.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IQuorumSolvency);

            /** QuorumSolvency solvency. */
            public solvency?: (common.ISolvency|null);

            /** QuorumSolvency attestations. */
            public attestations: common.IAttestation[];

            /**
             * Creates a new QuorumSolvency instance using the specified properties.
             * @param [properties] Properties to set
             * @returns QuorumSolvency instance
             */
            public static create(properties?: common.IQuorumSolvency): common.QuorumSolvency;

            /**
             * Encodes the specified QuorumSolvency message. Does not implicitly {@link common.QuorumSolvency.verify|verify} messages.
             * @param message QuorumSolvency message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IQuorumSolvency, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified QuorumSolvency message, length delimited. Does not implicitly {@link common.QuorumSolvency.verify|verify} messages.
             * @param message QuorumSolvency message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IQuorumSolvency, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a QuorumSolvency message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns QuorumSolvency
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.QuorumSolvency;

            /**
             * Decodes a QuorumSolvency message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns QuorumSolvency
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.QuorumSolvency;

            /**
             * Verifies a QuorumSolvency message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a QuorumSolvency message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns QuorumSolvency
             */
            public static fromObject(object: { [k: string]: any }): common.QuorumSolvency;

            /**
             * Creates a plain object from a QuorumSolvency message. Also converts values to other types if specified.
             * @param message QuorumSolvency
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.QuorumSolvency, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this QuorumSolvency to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an ErrataTx. */
        interface IErrataTx {

            /** ErrataTx id */
            id?: (string|null);

            /** ErrataTx chain */
            chain?: (string|null);
        }

        /** Represents an ErrataTx. */
        class ErrataTx implements IErrataTx {

            /**
             * Constructs a new ErrataTx.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IErrataTx);

            /** ErrataTx id. */
            public id: string;

            /** ErrataTx chain. */
            public chain: string;

            /**
             * Creates a new ErrataTx instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ErrataTx instance
             */
            public static create(properties?: common.IErrataTx): common.ErrataTx;

            /**
             * Encodes the specified ErrataTx message. Does not implicitly {@link common.ErrataTx.verify|verify} messages.
             * @param message ErrataTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IErrataTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ErrataTx message, length delimited. Does not implicitly {@link common.ErrataTx.verify|verify} messages.
             * @param message ErrataTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IErrataTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ErrataTx message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ErrataTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.ErrataTx;

            /**
             * Decodes an ErrataTx message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ErrataTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.ErrataTx;

            /**
             * Verifies an ErrataTx message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ErrataTx message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ErrataTx
             */
            public static fromObject(object: { [k: string]: any }): common.ErrataTx;

            /**
             * Creates a plain object from an ErrataTx message. Also converts values to other types if specified.
             * @param message ErrataTx
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.ErrataTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ErrataTx to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AttestErrataTx. */
        interface IAttestErrataTx {

            /** AttestErrataTx errataTx */
            errataTx?: (common.IErrataTx|null);

            /** AttestErrataTx attestation */
            attestation?: (common.IAttestation|null);
        }

        /** Represents an AttestErrataTx. */
        class AttestErrataTx implements IAttestErrataTx {

            /**
             * Constructs a new AttestErrataTx.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IAttestErrataTx);

            /** AttestErrataTx errataTx. */
            public errataTx?: (common.IErrataTx|null);

            /** AttestErrataTx attestation. */
            public attestation?: (common.IAttestation|null);

            /**
             * Creates a new AttestErrataTx instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AttestErrataTx instance
             */
            public static create(properties?: common.IAttestErrataTx): common.AttestErrataTx;

            /**
             * Encodes the specified AttestErrataTx message. Does not implicitly {@link common.AttestErrataTx.verify|verify} messages.
             * @param message AttestErrataTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IAttestErrataTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AttestErrataTx message, length delimited. Does not implicitly {@link common.AttestErrataTx.verify|verify} messages.
             * @param message AttestErrataTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IAttestErrataTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AttestErrataTx message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AttestErrataTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.AttestErrataTx;

            /**
             * Decodes an AttestErrataTx message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AttestErrataTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.AttestErrataTx;

            /**
             * Verifies an AttestErrataTx message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AttestErrataTx message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AttestErrataTx
             */
            public static fromObject(object: { [k: string]: any }): common.AttestErrataTx;

            /**
             * Creates a plain object from an AttestErrataTx message. Also converts values to other types if specified.
             * @param message AttestErrataTx
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.AttestErrataTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AttestErrataTx to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a QuorumErrataTx. */
        interface IQuorumErrataTx {

            /** QuorumErrataTx errataTx */
            errataTx?: (common.IErrataTx|null);

            /** QuorumErrataTx attestations */
            attestations?: (common.IAttestation[]|null);
        }

        /** Represents a QuorumErrataTx. */
        class QuorumErrataTx implements IQuorumErrataTx {

            /**
             * Constructs a new QuorumErrataTx.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IQuorumErrataTx);

            /** QuorumErrataTx errataTx. */
            public errataTx?: (common.IErrataTx|null);

            /** QuorumErrataTx attestations. */
            public attestations: common.IAttestation[];

            /**
             * Creates a new QuorumErrataTx instance using the specified properties.
             * @param [properties] Properties to set
             * @returns QuorumErrataTx instance
             */
            public static create(properties?: common.IQuorumErrataTx): common.QuorumErrataTx;

            /**
             * Encodes the specified QuorumErrataTx message. Does not implicitly {@link common.QuorumErrataTx.verify|verify} messages.
             * @param message QuorumErrataTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IQuorumErrataTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified QuorumErrataTx message, length delimited. Does not implicitly {@link common.QuorumErrataTx.verify|verify} messages.
             * @param message QuorumErrataTx message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IQuorumErrataTx, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a QuorumErrataTx message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns QuorumErrataTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.QuorumErrataTx;

            /**
             * Decodes a QuorumErrataTx message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns QuorumErrataTx
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.QuorumErrataTx;

            /**
             * Verifies a QuorumErrataTx message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a QuorumErrataTx message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns QuorumErrataTx
             */
            public static fromObject(object: { [k: string]: any }): common.QuorumErrataTx;

            /**
             * Creates a plain object from a QuorumErrataTx message. Also converts values to other types if specified.
             * @param message QuorumErrataTx
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.QuorumErrataTx, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this QuorumErrataTx to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AttestationBatch. */
        interface IAttestationBatch {

            /** AttestationBatch attestTxs */
            attestTxs?: (common.IAttestTx[]|null);

            /** AttestationBatch attestNetworkFees */
            attestNetworkFees?: (common.IAttestNetworkFee[]|null);

            /** AttestationBatch attestSolvencies */
            attestSolvencies?: (common.IAttestSolvency[]|null);

            /** AttestationBatch attestErrataTxs */
            attestErrataTxs?: (common.IAttestErrataTx[]|null);
        }

        /** Represents an AttestationBatch. */
        class AttestationBatch implements IAttestationBatch {

            /**
             * Constructs a new AttestationBatch.
             * @param [properties] Properties to set
             */
            constructor(properties?: common.IAttestationBatch);

            /** AttestationBatch attestTxs. */
            public attestTxs: common.IAttestTx[];

            /** AttestationBatch attestNetworkFees. */
            public attestNetworkFees: common.IAttestNetworkFee[];

            /** AttestationBatch attestSolvencies. */
            public attestSolvencies: common.IAttestSolvency[];

            /** AttestationBatch attestErrataTxs. */
            public attestErrataTxs: common.IAttestErrataTx[];

            /**
             * Creates a new AttestationBatch instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AttestationBatch instance
             */
            public static create(properties?: common.IAttestationBatch): common.AttestationBatch;

            /**
             * Encodes the specified AttestationBatch message. Does not implicitly {@link common.AttestationBatch.verify|verify} messages.
             * @param message AttestationBatch message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: common.IAttestationBatch, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AttestationBatch message, length delimited. Does not implicitly {@link common.AttestationBatch.verify|verify} messages.
             * @param message AttestationBatch message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: common.IAttestationBatch, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AttestationBatch message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AttestationBatch
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): common.AttestationBatch;

            /**
             * Decodes an AttestationBatch message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AttestationBatch
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): common.AttestationBatch;

            /**
             * Verifies an AttestationBatch message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AttestationBatch message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AttestationBatch
             */
            public static fromObject(object: { [k: string]: any }): common.AttestationBatch;

            /**
             * Creates a plain object from an AttestationBatch message. Also converts values to other types if specified.
             * @param message AttestationBatch
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: common.AttestationBatch, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AttestationBatch to JSON.
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

                /** Properties of a DecCoin. */
                interface IDecCoin {

                    /** DecCoin denom */
                    denom?: (string|null);

                    /** DecCoin amount */
                    amount?: (string|null);
                }

                /** Represents a DecCoin. */
                class DecCoin implements IDecCoin {

                    /**
                     * Constructs a new DecCoin.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: cosmos.base.v1beta1.IDecCoin);

                    /** DecCoin denom. */
                    public denom: string;

                    /** DecCoin amount. */
                    public amount: string;

                    /**
                     * Creates a new DecCoin instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns DecCoin instance
                     */
                    public static create(properties?: cosmos.base.v1beta1.IDecCoin): cosmos.base.v1beta1.DecCoin;

                    /**
                     * Encodes the specified DecCoin message. Does not implicitly {@link cosmos.base.v1beta1.DecCoin.verify|verify} messages.
                     * @param message DecCoin message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: cosmos.base.v1beta1.IDecCoin, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified DecCoin message, length delimited. Does not implicitly {@link cosmos.base.v1beta1.DecCoin.verify|verify} messages.
                     * @param message DecCoin message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: cosmos.base.v1beta1.IDecCoin, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a DecCoin message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns DecCoin
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cosmos.base.v1beta1.DecCoin;

                    /**
                     * Decodes a DecCoin message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns DecCoin
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cosmos.base.v1beta1.DecCoin;

                    /**
                     * Verifies a DecCoin message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a DecCoin message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns DecCoin
                     */
                    public static fromObject(object: { [k: string]: any }): cosmos.base.v1beta1.DecCoin;

                    /**
                     * Creates a plain object from a DecCoin message. Also converts values to other types if specified.
                     * @param message DecCoin
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: cosmos.base.v1beta1.DecCoin, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this DecCoin to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of an IntProto. */
                interface IIntProto {

                    /** IntProto int */
                    int?: (string|null);
                }

                /** Represents an IntProto. */
                class IntProto implements IIntProto {

                    /**
                     * Constructs a new IntProto.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: cosmos.base.v1beta1.IIntProto);

                    /** IntProto int. */
                    public int: string;

                    /**
                     * Creates a new IntProto instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns IntProto instance
                     */
                    public static create(properties?: cosmos.base.v1beta1.IIntProto): cosmos.base.v1beta1.IntProto;

                    /**
                     * Encodes the specified IntProto message. Does not implicitly {@link cosmos.base.v1beta1.IntProto.verify|verify} messages.
                     * @param message IntProto message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: cosmos.base.v1beta1.IIntProto, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified IntProto message, length delimited. Does not implicitly {@link cosmos.base.v1beta1.IntProto.verify|verify} messages.
                     * @param message IntProto message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: cosmos.base.v1beta1.IIntProto, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an IntProto message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns IntProto
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cosmos.base.v1beta1.IntProto;

                    /**
                     * Decodes an IntProto message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns IntProto
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cosmos.base.v1beta1.IntProto;

                    /**
                     * Verifies an IntProto message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an IntProto message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns IntProto
                     */
                    public static fromObject(object: { [k: string]: any }): cosmos.base.v1beta1.IntProto;

                    /**
                     * Creates a plain object from an IntProto message. Also converts values to other types if specified.
                     * @param message IntProto
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: cosmos.base.v1beta1.IntProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this IntProto to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }

                /** Properties of a DecProto. */
                interface IDecProto {

                    /** DecProto dec */
                    dec?: (string|null);
                }

                /** Represents a DecProto. */
                class DecProto implements IDecProto {

                    /**
                     * Constructs a new DecProto.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: cosmos.base.v1beta1.IDecProto);

                    /** DecProto dec. */
                    public dec: string;

                    /**
                     * Creates a new DecProto instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns DecProto instance
                     */
                    public static create(properties?: cosmos.base.v1beta1.IDecProto): cosmos.base.v1beta1.DecProto;

                    /**
                     * Encodes the specified DecProto message. Does not implicitly {@link cosmos.base.v1beta1.DecProto.verify|verify} messages.
                     * @param message DecProto message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: cosmos.base.v1beta1.IDecProto, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified DecProto message, length delimited. Does not implicitly {@link cosmos.base.v1beta1.DecProto.verify|verify} messages.
                     * @param message DecProto message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: cosmos.base.v1beta1.IDecProto, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a DecProto message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns DecProto
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): cosmos.base.v1beta1.DecProto;

                    /**
                     * Decodes a DecProto message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns DecProto
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): cosmos.base.v1beta1.DecProto;

                    /**
                     * Verifies a DecProto message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a DecProto message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns DecProto
                     */
                    public static fromObject(object: { [k: string]: any }): cosmos.base.v1beta1.DecProto;

                    /**
                     * Creates a plain object from a DecProto message. Also converts values to other types if specified.
                     * @param message DecProto
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: cosmos.base.v1beta1.DecProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this DecProto to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }
            }
        }
    }
}
