export type Network = {
  messagePrefix: string
  bip32: {
    public: number
    private: number
  }
  pubKeyHash: number
  scriptHash: number
  wif: number
  bech32: string
}
