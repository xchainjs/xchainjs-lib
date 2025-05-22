export type KeyPair = {
  getAddress(index: number): string
}

export type In = {
  hash: Buffer
  index: number
}

export type Out = {
  script: Buffer
  value: number
}

export type Transaction = {
  toHex(): string
  fromHex(hex: string): Transaction
  fromBuffer(buffer: Buffer): Transaction
  ins: In[]
  outs: Out[]
}

export type TransactionBuilder = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputs: any[]
  addInput(buffer: Buffer, index: number): void
  addOutput(script: Buffer, value: number): void
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
  buildIncomplete(): Transaction
}

export interface Network {
  messagePrefix: string
  bech32?: string
  bip32: Bip32
  pubKeyHash: number
  scriptHash: number
  wif: number
}
interface Bip32 {
  public: number
  private: number
}
