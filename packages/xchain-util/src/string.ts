/**
 * Removes leading / trailing zeros from a string of numbers
 * (1) Regex to remove trailing zeros https://stackoverflow.com/a/53397618/2032698
 * (2) Regex to remove leading zeros https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch06s06.html
 *
 * @param {string} value
 * @returns {string} The result after removing trailing zeros.
 */
export const trimZeros = (value: string) =>
  value
    // (1) remove trailing zeros
    .replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1')
    // (2) remove leading zeros
    .replace(/\b0*([1-9][0-9]*|0)\b/, '$1')
