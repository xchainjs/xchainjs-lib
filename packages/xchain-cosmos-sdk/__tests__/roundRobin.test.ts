import {
  TxNotFoundError,
  createRoundRobinExhaustedError,
  isRetryableRpcError,
  roundRobinGetTx,
  roundRobinTry,
} from '../src/roundRobin'

describe('isRetryableRpcError', () => {
  it('treats connection / gateway 5xx failures as retryable', () => {
    expect(isRetryableRpcError(new Error('Failed to fetch'))).toBe(true)
    expect(isRetryableRpcError(new Error('fetch failed'))).toBe(true)
    expect(isRetryableRpcError(new Error('connect ECONNREFUSED 127.0.0.1:26657'))).toBe(true)
    expect(isRetryableRpcError(new Error('getaddrinfo ENOTFOUND rpc.example.com'))).toBe(true)
    expect(isRetryableRpcError(new Error('socket hang up'))).toBe(true)
    expect(isRetryableRpcError(new Error('request timed out'))).toBe(true)
    expect(isRetryableRpcError(new Error('Bad status on response: 500'))).toBe(true)
    expect(isRetryableRpcError(new Error('Bad status on response: 503'))).toBe(true)
    expect(isRetryableRpcError(new Error('Bad status on response: 429'))).toBe(true)
  })

  it('does not retry HTTP 4xx (except 429)', () => {
    expect(isRetryableRpcError(new Error('Bad status on response: 400'))).toBe(false)
    expect(isRetryableRpcError(new Error('Bad status on response: 404'))).toBe(false)
    expect(isRetryableRpcError(new Error('invalid request'))).toBe(false)
  })

  it('treats chain rejection and unknown messages as non-retryable', () => {
    expect(isRetryableRpcError(new Error('insufficient funds: insufficient account funds'))).toBe(false)
    expect(isRetryableRpcError(new Error('account sequence mismatch, expected 5, got 4'))).toBe(false)
    expect(isRetryableRpcError(new Error('out of gas in location: WritePerByte'))).toBe(false)
    expect(isRetryableRpcError(new Error('failed to execute message; message index: 0'))).toBe(false)
    expect(isRetryableRpcError(new Error('something completely unexpected from cosmjs'))).toBe(false)
  })
})

describe('createRoundRobinExhaustedError', () => {
  it('includes last error message and cause', () => {
    const cause = new Error('Bad status on response: 500')
    const err = createRoundRobinExhaustedError('broadcast transaction', cause)
    expect(err.message).toContain('No clients available. Can not broadcast transaction')
    expect(err.message).toContain('Last error: Bad status on response: 500')
    expect((err as Error & { cause?: unknown }).cause).toBe(cause)
  })

  it('works without a last error', () => {
    const err = createRoundRobinExhaustedError('get chain id')
    expect(err.message).toBe('No clients available. Can not get chain id')
  })
})

describe('roundRobinTry', () => {
  it('returns the first successful result', async () => {
    const result = await roundRobinTry([1, 2, 3], 'test', async (n) => {
      if (n < 3) throw new Error('Failed to fetch')
      return n * 10
    })
    expect(result).toBe(30)
  })

  it('rethrows non-retryable errors immediately', async () => {
    await expect(
      roundRobinTry([1, 2], 'broadcast transaction', async () => {
        throw new Error('insufficient funds')
      }),
    ).rejects.toThrow('insufficient funds')
  })

  it('surfaces last retryable error when all endpoints fail', async () => {
    await expect(
      roundRobinTry(['a', 'b'], 'broadcast transaction', async (url) => {
        throw new Error(`Bad status on response: 500 from ${url}`)
      }),
    ).rejects.toThrow(/Last error: Bad status on response: 500 from b/)
  })

  it('throws exhausted error when item list is empty', async () => {
    await expect(roundRobinTry([], 'get chain id', async () => 1)).rejects.toThrow(
      'No clients available. Can not get chain id',
    )
  })
})

describe('roundRobinGetTx', () => {
  type FakeClient = { id: string }

  it('returns the first non-null tx', async () => {
    const clients: FakeClient[] = [{ id: 'a' }, { id: 'b' }]
    const tx = await roundRobinGetTx(clients, 'HASH', async (c) => (c.id === 'b' ? ({ height: 1 } as never) : null))
    expect(tx).toEqual({ height: 1 })
  })

  it('throws TxNotFoundError only when every client returns null', async () => {
    const clients: FakeClient[] = [{ id: 'a' }, { id: 'b' }]
    await expect(roundRobinGetTx(clients, 'HASH', async () => null)).rejects.toBeInstanceOf(TxNotFoundError)
  })

  it('null then retryable error → exhausted with last error (not TxNotFound)', async () => {
    const clients: FakeClient[] = [{ id: 'a' }, { id: 'b' }]
    await expect(
      roundRobinGetTx(clients, 'HASH', async (c) => {
        if (c.id === 'a') return null
        throw new Error('Bad status on response: 500')
      }),
    ).rejects.toThrow(/Last error: Bad status on response: 500/)
  })

  it('retryable error then null → exhausted with last error (not TxNotFound)', async () => {
    const clients: FakeClient[] = [{ id: 'a' }, { id: 'b' }]
    await expect(
      roundRobinGetTx(clients, 'HASH', async (c) => {
        if (c.id === 'a') throw new Error('Failed to fetch')
        return null
      }),
    ).rejects.toThrow(/Last error: Failed to fetch/)
  })

  it('rethrows non-retryable errors immediately', async () => {
    await expect(
      roundRobinGetTx([{ id: 'a' }, { id: 'b' }], 'HASH', async () => {
        throw new Error('insufficient funds')
      }),
    ).rejects.toThrow('insufficient funds')
  })
})

describe('TxNotFoundError', () => {
  it('names and message are stable for status pollers', () => {
    const err = new TxNotFoundError('ABC')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('TxNotFoundError')
    expect(err.txId).toBe('ABC')
    expect(err.message).toBe('Can not find transaction ABC')
  })
})
