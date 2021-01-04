/**
 * The Private Key interface
 */
export interface PrivKey {
  getPubKey(): PubKey | null
  toBuffer(): Buffer
  toBase64(): string
  sign(message: Buffer): Buffer
}
/**
 * The Public Key interface
 */
export interface PubKey {
  getAddress(): Buffer
  toBuffer(): Buffer
  toBase64(): string
  verify(signature: Buffer, message?: Buffer): boolean
}
