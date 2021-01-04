/**
 * Helper to delay anything within an `async` function
 *
 * @param ms delay in milliseconds
 *
 * @example
 *
 * ```
 * const anyAsyncFunc = async () => {
 *  // do something
 *  console.log('before delay')
 *  // wait for 200ms
 *  await delay(200)
 *  // and do other things
 *  console.log('after delay')
 * }
 * ```
 */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
