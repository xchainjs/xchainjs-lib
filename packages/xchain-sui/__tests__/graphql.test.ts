import { jest } from '@jest/globals'

import { graphqlQuery } from '../src/graphql'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('graphqlQuery', () => {
  it('returns the JSON body when the response has no errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { ok: true } }),
    }) as typeof fetch

    await expect(graphqlQuery<{ ok: boolean }>('https://example/graphql', 'query { ok }')).resolves.toEqual({
      data: { ok: true },
    })
  })

  it('rejects a 200 response that includes GraphQL errors', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { coinMetadata: { decimals: 6 } },
        errors: [{ message: 'field error' }],
      }),
    }) as typeof fetch

    await expect(graphqlQuery('https://example/graphql', 'query { coinMetadata { decimals } }')).rejects.toThrow(
      'field error',
    )
  })

  it('rejects an HTTP failure', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    }) as typeof fetch

    await expect(graphqlQuery('https://example/graphql', 'query { ok }')).rejects.toThrow(
      'GraphQL request failed: Server Error (500)',
    )
  })

  it('forwards an abort signal to fetch', async () => {
    const controller = new AbortController()
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    })
    globalThis.fetch = fetchMock as typeof fetch

    await graphqlQuery('https://example/graphql', 'query { ok }', undefined, controller.signal)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example/graphql',
      expect.objectContaining({ signal: controller.signal }),
    )
  })
})
