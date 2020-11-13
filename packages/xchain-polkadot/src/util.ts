/**
 * Type guard for runtime checks of `Fee`
 */
export const isSuccess = (response: { code: number }): boolean => !response.code
