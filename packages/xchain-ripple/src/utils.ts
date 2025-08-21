import { isValidAddress } from 'xrpl'

/**
 * Function to validate a Ripple address.
 * @param {Address} address - The Ripple address to validate.
 * @returns {boolean} `true` if the address is valid, `false` otherwise.
 */
export const validateAddress = isValidAddress

/**
 * Function to validate a destination tag.
 * @param {number} destinationTag - The destination tag to validate.
 * @returns {boolean} `true` if the destination tag is valid, `false` otherwise.
 */
export const validateDestinationTag = (destinationTag: number): boolean => {
  return Number.isInteger(destinationTag) && destinationTag >= 0 && destinationTag <= 0xffffffff
}

/**
 * Parse a destination tag from string or number
 * @param {string | number} tag - The destination tag to parse
 * @returns {number | undefined} The parsed destination tag or undefined if invalid
 */
export const parseDestinationTag = (tag: string | number): number | undefined => {
  if (typeof tag === 'number') {
    return validateDestinationTag(tag) ? tag : undefined
  }

  if (typeof tag === 'string') {
    // Check if string represents a valid integer (no decimal points, scientific notation, etc.)
    if (!/^\d+$/.test(tag.trim())) {
      return undefined
    }
    const parsed = parseInt(tag, 10)
    return !isNaN(parsed) && validateDestinationTag(parsed) ? parsed : undefined
  }

  return undefined
}
