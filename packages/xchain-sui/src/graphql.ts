/**
 * POST a GraphQL query string.
 *
 * `SuiGraphQLClient` imports `print` from the `graphql` package even when the
 * query is already a string. These calls never need that parser.
 */
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
): Promise<GraphqlResult<T>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      [PROTOCOL_HEADER]: PROTOCOL_VERSION,
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText} (${response.status})`)
  }
  return (await response.json()) as GraphqlResult<T>
}
