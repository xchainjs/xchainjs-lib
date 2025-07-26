import crypto from 'crypto'

/**
 * Calculate pbkdf2 (Password-Based Key Derivation Function 2).
 *
 * @param {string | Buffer | NodeJS.TypedArray | DataView} passphrase The passphrase.
 * @param {string | Buffer | NodeJS.TypedArray | DataView} salt The salt.
 * @param {number} iterations The number of iterations.
 * @param {number} keylen The length of the derived key.
 * @param {string} digest The digest algorithm.
 * @returns {Buffer} The derived key.
 */
export const pbkdf2Async = async (
  passphrase: string | Buffer | NodeJS.TypedArray | DataView,
  salt: string | Buffer | NodeJS.TypedArray | DataView,
  iterations: number,
  keylen: number,
  digest: string,
): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(passphrase, salt, iterations, keylen, digest, (err, drived) => {
      if (err) {
        reject(err)
      } else {
        resolve(drived)
      }
    })
  })
}
