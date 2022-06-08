import { convertBip39ToHavenMnemonic } from 'bip39-converter'

export const XHV_DECIMAL = 12

/**
 * Converts bip39 phrase to Haven mnemonic
 * @param phrase
 * @param passphrase
 * @returns {string} Haven mnemonic
 */
export const convertToHavenMnemonic = (phrase: string, passphrase = ''): string => {
  return convertBip39ToHavenMnemonic(phrase, passphrase)
}
