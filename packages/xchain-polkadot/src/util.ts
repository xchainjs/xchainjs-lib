/**
 * Check Subscan API response
 */
export const isSuccess = (response: { code: number }): boolean => !response.code
