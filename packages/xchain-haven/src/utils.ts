import { convertBip39ToHavenMnemonic } from 'bip39-converter'
import { ASSET_LIST, HavenTicker } from 'haven-core-js'

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

/**
 * Guard for type HavenTicker
 * @param ticker
 * @returns
 */
export const isHavenTicker = (ticker: string): ticker is HavenTicker => ASSET_LIST.includes(ticker)
