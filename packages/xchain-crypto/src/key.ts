/**
 * Represents the interface for a private key.
 */
export interface PrivKey {
  /**
   * Gets the corresponding public key.
   * @returns The public key, or null if unavailable.
   */
  getPubKey(): PubKey | null

  /**
   * Converts the private key to a buffer.
   * @returns The private key as a buffer.
   */
  toBuffer(): Buffer

  /**
   * Converts the private key to base64 format.
   * @returns The private key as a base64-encoded string.
   */
  toBase64(): string

  /**
   * Signs a message using the private key.
   * @param message - The message to be signed.
   * @returns The signature as a buffer.
   */
  sign(message: Buffer): Buffer
}

/**
 * Represents the interface for a public key.
 */
export interface PubKey {
  /**
   * Gets the address corresponding to the public key.
   * @returns The address as a buffer.
   */
  getAddress(): Buffer

  /**
   * Converts the public key to a buffer.
   * @returns The public key as a buffer.
   */
  toBuffer(): Buffer

  /**
   * Converts the public key to base64 format.
   * @returns The public key as a base64-encoded string.
   */
  toBase64(): string

  /**
   * Verifies a signature against a message using the public key.
   * @param signature - The signature to be verified.
   * @param message - The message that was signed.
   * @returns True if the signature is valid, false otherwise.
   */
  verify(signature: Buffer, message?: Buffer): boolean
}
