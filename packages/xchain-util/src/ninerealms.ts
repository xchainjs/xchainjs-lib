export const XCHAINJS_IDENTIFIER = 'xchainjs-client'
export const NINE_REALMS_CLIENT_HEADER = 'x-client-id'

/** Accepts an rxjs/ajax RequestArgs or an axios request config. */
export const add9Rheader = <T extends { url?: string; headers?: Record<string, string> }>(request: T) => {
  try {
    // `new URL` throws TypeError when url is missing ('unknown-url' placeholder)
    const url = new URL(request?.url ?? 'unknown-url')
    const headerAlreadyExists = request.headers && 'x-client-id' in request.headers
    if ((url.host.includes('ninerealms') || url.host.includes('liquify.com')) && !headerAlreadyExists) {
      const headers = request?.headers ?? {}
      const newRequest = {
        ...request,
        headers: { ...headers, [`${NINE_REALMS_CLIENT_HEADER}`]: `${XCHAINJS_IDENTIFIER}` },
      }
      return newRequest
    }
  } catch (error) {
    console.error(`Failed to add custom ${NINE_REALMS_CLIENT_HEADER} header`, error)
  }

  return request
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const register9Rheader = (axios: any) => {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  axios.interceptors.request.use(add9Rheader, (error: any) => Promise.reject(error))
}
