/** `SuiGraphQLClient` imports `print` from `graphql` even for a string query. These calls never need that parser. */
export type GraphqlResult<T> = {
  data?: T
  errors?: { message?: string }[]
}

// Same header `@mysten/sui` 2.35 sends (`dist/client/protocol-version.mjs`).
const PROTOCOL_HEADER = 'x-sui-client-protocol-version'
const PROTOCOL_VERSION = '138'

export async function graphqlQuery<T>(
  url: string,
  query: string,
  variables?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<GraphqlResult<T>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [PROTOCOL_HEADER]: PROTOCOL_VERSION,
    },
    body: JSON.stringify({ query, variables }),
    signal,
  })
  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText} (${response.status})`)
  }
  const body = (await response.json()) as GraphqlResult<T>
  // A 200 can still carry top-level errors with partial data. Callers treat a
  // resolved result as complete, so reject that payload here.
  if (body.errors?.length) {
    const message = body.errors
      .map((error) => error.message)
      .filter((text) => text)
      .join('; ')
    throw new Error(message || 'GraphQL request failed')
  }
  return body
}
