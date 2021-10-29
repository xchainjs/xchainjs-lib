export type KeyPair = {
  getAddress(index: number): Promise<string>
  sign(hash: Buffer, lowR?: boolean): Buffer
  getPublicKeyBuffer?(): Buffer
  toWIF(): string
  getNetwork(): Network
}

export type Transaction = {
  toHex(): string
}

export type TransactionBuilder = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputs: any[]
  sign(
    vin: number,
    keyPair: KeyPair,
    redeemScript?: Buffer,
    hashType?: number,
    witnessValue?: number,
    witnessScript?: Buffer,
    signatureAlgorithm?: string,
  ): void
  build(): Transaction
}

export type Network = {
  messagePrefix: string
  bech32: string
  bip32: {
    public: number
    private: number
  }
  pubKeyHash: number
  scriptHash: number
  wif: number
}
