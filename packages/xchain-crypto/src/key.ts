export type PrivKey = {
  getPubKey(): PubKey
  toBuffer(): Buffer
  toBase64(): string
  sign(message: Buffer): Buffer
}

export type PubKey = {
  getAddress(): Buffer
  toBuffer(): Buffer
  toBase64(): string
  verify(signature: Buffer, message?: Buffer): boolean
}
