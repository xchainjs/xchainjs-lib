export interface BroadcastTxDTO {
    data: {
      transaction_hash: string;
    },
    context: {
      code: number;
      error?: string;
    }
}

export type BtcChainOptions = 'bitcoin' | 'bitcoin-cash' | 'litecoin' | 'bitcoin-sv' | 'dogecoin' | 'dash' | 'groestlcoin' | 'zcash' | 'bitcoin/testnet'