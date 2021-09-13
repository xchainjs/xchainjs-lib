/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as $protobuf from 'protobufjs'
/** Namespace types. */
export namespace types {
  /** Properties of a MsgDeposit. */
  interface IMsgDeposit {
    /** MsgDeposit coins */
    coins?: common.ICoin[] | null

    /** MsgDeposit memo */
    memo?: string | null

    /** MsgDeposit signer */
    signer?: Uint8Array | null
  }

  /** Represents a MsgDeposit. */
  class MsgDeposit implements IMsgDeposit {
    /**
     * Constructs a new MsgDeposit.
     * @param [properties] Properties to set
     */
    constructor(properties?: types.IMsgDeposit)

    /** MsgDeposit coins. */
    public coins: common.ICoin[]

    /** MsgDeposit memo. */
    public memo: string

    /** MsgDeposit signer. */
    public signer: Uint8Array

    /**
     * Creates a new MsgDeposit instance using the specified properties.
     * @param [properties] Properties to set
     * @returns MsgDeposit instance
     */
    public static create(properties?: types.IMsgDeposit): types.MsgDeposit

    /**
     * Encodes the specified MsgDeposit message. Does not implicitly {@link types.MsgDeposit.verify|verify} messages.
     * @param message MsgDeposit message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: types.IMsgDeposit, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Encodes the specified MsgDeposit message, length delimited. Does not implicitly {@link types.MsgDeposit.verify|verify} messages.
     * @param message MsgDeposit message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: types.IMsgDeposit, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Decodes a MsgDeposit message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns MsgDeposit
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): types.MsgDeposit

    /**
     * Decodes a MsgDeposit message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns MsgDeposit
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): types.MsgDeposit

    /**
     * Verifies a MsgDeposit message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null

    /**
     * Creates a MsgDeposit message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns MsgDeposit
     */
    public static fromObject(object: { [k: string]: any }): types.MsgDeposit

    /**
     * Creates a plain object from a MsgDeposit message. Also converts values to other types if specified.
     * @param message MsgDeposit
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: types.MsgDeposit, options?: $protobuf.IConversionOptions): { [k: string]: any }

    /**
     * Converts this MsgDeposit to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any }
  }
}

/** Namespace common. */
export namespace common {
  /** Properties of an Asset. */
  interface IAsset {
    /** Asset chain */
    chain?: string | null

    /** Asset symbol */
    symbol?: string | null

    /** Asset ticker */
    ticker?: string | null

    /** Asset synth */
    synth?: boolean | null
  }

  /** Represents an Asset. */
  class Asset implements IAsset {
    /**
     * Constructs a new Asset.
     * @param [properties] Properties to set
     */
    constructor(properties?: common.IAsset)

    /** Asset chain. */
    public chain: string

    /** Asset symbol. */
    public symbol: string

    /** Asset ticker. */
    public ticker: string

    /** Asset synth. */
    public synth: boolean

    /**
     * Creates a new Asset instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Asset instance
     */
    public static create(properties?: common.IAsset): common.Asset

    /**
     * Encodes the specified Asset message. Does not implicitly {@link common.Asset.verify|verify} messages.
     * @param message Asset message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: common.IAsset, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Encodes the specified Asset message, length delimited. Does not implicitly {@link common.Asset.verify|verify} messages.
     * @param message Asset message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: common.IAsset, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Decodes an Asset message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Asset
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): common.Asset

    /**
     * Decodes an Asset message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Asset
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): common.Asset

    /**
     * Verifies an Asset message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null

    /**
     * Creates an Asset message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Asset
     */
    public static fromObject(object: { [k: string]: any }): common.Asset

    /**
     * Creates a plain object from an Asset message. Also converts values to other types if specified.
     * @param message Asset
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: common.Asset, options?: $protobuf.IConversionOptions): { [k: string]: any }

    /**
     * Converts this Asset to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any }
  }

  /** Properties of a Coin. */
  interface ICoin {
    /** Coin asset */
    asset?: common.IAsset | null

    /** Coin amount */
    amount?: string | null

    /** Coin decimals */
    decimals?: number | Long | null
  }

  /** Represents a Coin. */
  class Coin implements ICoin {
    /**
     * Constructs a new Coin.
     * @param [properties] Properties to set
     */
    constructor(properties?: common.ICoin)

    /** Coin asset. */
    public asset?: common.IAsset | null

    /** Coin amount. */
    public amount: string

    /** Coin decimals. */
    public decimals: number | Long

    /**
     * Creates a new Coin instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Coin instance
     */
    public static create(properties?: common.ICoin): common.Coin

    /**
     * Encodes the specified Coin message. Does not implicitly {@link common.Coin.verify|verify} messages.
     * @param message Coin message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: common.ICoin, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Encodes the specified Coin message, length delimited. Does not implicitly {@link common.Coin.verify|verify} messages.
     * @param message Coin message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: common.ICoin, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Decodes a Coin message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Coin
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): common.Coin

    /**
     * Decodes a Coin message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Coin
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): common.Coin

    /**
     * Verifies a Coin message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null

    /**
     * Creates a Coin message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Coin
     */
    public static fromObject(object: { [k: string]: any }): common.Coin

    /**
     * Creates a plain object from a Coin message. Also converts values to other types if specified.
     * @param message Coin
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: common.Coin, options?: $protobuf.IConversionOptions): { [k: string]: any }

    /**
     * Converts this Coin to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any }
  }

  /** Properties of a PubKeySet. */
  interface IPubKeySet {
    /** PubKeySet secp256k1 */
    secp256k1?: string | null

    /** PubKeySet ed25519 */
    ed25519?: string | null
  }

  /** Represents a PubKeySet. */
  class PubKeySet implements IPubKeySet {
    /**
     * Constructs a new PubKeySet.
     * @param [properties] Properties to set
     */
    constructor(properties?: common.IPubKeySet)

    /** PubKeySet secp256k1. */
    public secp256k1: string

    /** PubKeySet ed25519. */
    public ed25519: string

    /**
     * Creates a new PubKeySet instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PubKeySet instance
     */
    public static create(properties?: common.IPubKeySet): common.PubKeySet

    /**
     * Encodes the specified PubKeySet message. Does not implicitly {@link common.PubKeySet.verify|verify} messages.
     * @param message PubKeySet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: common.IPubKeySet, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Encodes the specified PubKeySet message, length delimited. Does not implicitly {@link common.PubKeySet.verify|verify} messages.
     * @param message PubKeySet message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: common.IPubKeySet, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Decodes a PubKeySet message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PubKeySet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): common.PubKeySet

    /**
     * Decodes a PubKeySet message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PubKeySet
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): common.PubKeySet

    /**
     * Verifies a PubKeySet message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null

    /**
     * Creates a PubKeySet message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PubKeySet
     */
    public static fromObject(object: { [k: string]: any }): common.PubKeySet

    /**
     * Creates a plain object from a PubKeySet message. Also converts values to other types if specified.
     * @param message PubKeySet
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: common.PubKeySet, options?: $protobuf.IConversionOptions): { [k: string]: any }

    /**
     * Converts this PubKeySet to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any }
  }

  /** Properties of a Tx. */
  interface ITx {
    /** Tx id */
    id?: string | null

    /** Tx chain */
    chain?: string | null

    /** Tx fromAddress */
    fromAddress?: string | null

    /** Tx toAddress */
    toAddress?: string | null

    /** Tx coins */
    coins?: common.ICoin[] | null

    /** Tx gas */
    gas?: common.ICoin[] | null

    /** Tx memo */
    memo?: string | null
  }

  /** Represents a Tx. */
  class Tx implements ITx {
    /**
     * Constructs a new Tx.
     * @param [properties] Properties to set
     */
    constructor(properties?: common.ITx)

    /** Tx id. */
    public id: string

    /** Tx chain. */
    public chain: string

    /** Tx fromAddress. */
    public fromAddress: string

    /** Tx toAddress. */
    public toAddress: string

    /** Tx coins. */
    public coins: common.ICoin[]

    /** Tx gas. */
    public gas: common.ICoin[]

    /** Tx memo. */
    public memo: string

    /**
     * Creates a new Tx instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Tx instance
     */
    public static create(properties?: common.ITx): common.Tx

    /**
     * Encodes the specified Tx message. Does not implicitly {@link common.Tx.verify|verify} messages.
     * @param message Tx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: common.ITx, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Encodes the specified Tx message, length delimited. Does not implicitly {@link common.Tx.verify|verify} messages.
     * @param message Tx message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: common.ITx, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Decodes a Tx message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): common.Tx

    /**
     * Decodes a Tx message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Tx
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): common.Tx

    /**
     * Verifies a Tx message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null

    /**
     * Creates a Tx message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Tx
     */
    public static fromObject(object: { [k: string]: any }): common.Tx

    /**
     * Creates a plain object from a Tx message. Also converts values to other types if specified.
     * @param message Tx
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: common.Tx, options?: $protobuf.IConversionOptions): { [k: string]: any }

    /**
     * Converts this Tx to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any }
  }

  /** Properties of a Fee. */
  interface IFee {
    /** Fee coins */
    coins?: common.ICoin[] | null

    /** Fee poolDeduct */
    poolDeduct?: string | null
  }

  /** Represents a Fee. */
  class Fee implements IFee {
    /**
     * Constructs a new Fee.
     * @param [properties] Properties to set
     */
    constructor(properties?: common.IFee)

    /** Fee coins. */
    public coins: common.ICoin[]

    /** Fee poolDeduct. */
    public poolDeduct: string

    /**
     * Creates a new Fee instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Fee instance
     */
    public static create(properties?: common.IFee): common.Fee

    /**
     * Encodes the specified Fee message. Does not implicitly {@link common.Fee.verify|verify} messages.
     * @param message Fee message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: common.IFee, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Encodes the specified Fee message, length delimited. Does not implicitly {@link common.Fee.verify|verify} messages.
     * @param message Fee message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: common.IFee, writer?: $protobuf.Writer): $protobuf.Writer

    /**
     * Decodes a Fee message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Fee
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): common.Fee

    /**
     * Decodes a Fee message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Fee
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): common.Fee

    /**
     * Verifies a Fee message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): string | null

    /**
     * Creates a Fee message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Fee
     */
    public static fromObject(object: { [k: string]: any }): common.Fee

    /**
     * Creates a plain object from a Fee message. Also converts values to other types if specified.
     * @param message Fee
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: common.Fee, options?: $protobuf.IConversionOptions): { [k: string]: any }

    /**
     * Converts this Fee to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any }
  }
}
