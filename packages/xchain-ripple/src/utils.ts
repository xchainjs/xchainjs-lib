import { isValidAddress } from 'xrpl'

/**
 * Function to validate a Ripple address.
 * @param {Address} address - The Ripple address to validate.
 * @returns {boolean} `true` if the address is valid, `false` otherwise.
 */
export const validateAddress = isValidAddress
