export const XCHAINJS_IDENTIFIER = 'xchainjs-client'
export const NINE_REALMS_CLIENT_HEADER = 'x-client-id'

/**
 * Middleware to add custom header to requests (9R endpoints only)
 *
 * @param request RequestArgs (rxjs/ajax) | AxiosRequestConfig (axios)
 * @returns RequestArgs (rxjs/ajax) | AxiosRequestConfig (axios)
 */
export const add9Rheader = <T extends { url?: string; headers?: Record<string, string> }>(request: T) => {
  try {
    // URL throws an `TypeError` if `url` is not available and 'unknown-url' is set
    // [TypeError: Invalid URL] input: 'unknown-url', code: 'ERR_INVALID_URL' }
    const url = new URL(request?.url ?? 'unknown-url')
    const headerAlreadyExists = request.headers && 'x-client-id' in request.headers
    if (url.host.includes('ninerealms') && !headerAlreadyExists) {
      const headers = request?.headers ?? {}
      // Add custom header to request before returning it
      const newRequest = {
        ...request,
        headers: { ...headers, [`${NINE_REALMS_CLIENT_HEADER}`]: `${XCHAINJS_IDENTIFIER}` },
      }
      // console.log(` Request ${newRequest.url} ${JSON.stringify(newRequest.headers)}`)
      return newRequest
    }
  } catch (error) {
    console.error(`Failed to add custom ${NINE_REALMS_CLIENT_HEADER} header`, error)
  }

  // If it errors, just return same request and keep it untouched (no change)
  // console.log(` Request ${request.url} ${JSON.stringify(request.headers)}`)
  return request
}

/**
 * Adds custom header to axios requests (9R endpoints only)
 */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const register9Rheader = (axios: any) => {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  axios.interceptors.request.use(add9Rheader, (error: any) => Promise.reject(error))
}
