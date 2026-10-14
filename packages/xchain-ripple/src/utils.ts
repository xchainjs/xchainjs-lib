import { isValidAddress } from 'xrpl'

export const validateAddress = isValidAddress

export const validateDestinationTag = (destinationTag: number): boolean => {
  return Number.isInteger(destinationTag) && destinationTag >= 0 && destinationTag <= 0xffffffff
}

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
