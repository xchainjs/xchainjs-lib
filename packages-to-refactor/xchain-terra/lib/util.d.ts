import { Asset } from '@xchainjs/xchain-util/lib';
export declare enum TerraNativeAsset {
    LUNA = "LUNA",
    SDT = "SDT",
    UST = "UST",
    KRT = "KRT",
    MNT = "MNT",
    EUT = "EUT",
    CNT = "CNT",
    JPT = "JPT",
    GBT = "GBT",
    INT = "INT",
    CAT = "CAT",
    CHT = "CHT",
    AUT = "AUT",
    SGT = "SGT",
    TBT = "TBT",
    SET = "SET",
    NOT = "NOT",
    DKT = "DKT",
    IDT = "IDT",
    PHT = "PHT",
    HKT = "HKT",
    MYT = "MYT",
    TWT = "TWT"
}
export declare const isTerraAsset: ({ chain, symbol, ticker, synth }: Asset) => boolean;
export declare const getTerraMicroDenom: (assetDenom: string) => string | null;
